import test from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';
import { formatHuman, parseArgs, runDoctor } from '../../scripts/governance/github-doctor.mjs';

function localRoot() {
  return process.cwd();
}

test('doctor reports local files without GitHub authentication and does not call remote APIs', async () => {
  let apiCalls = 0;
  const report = await runDoctor({
    root: localRoot(),
    gh: {
      async authenticated() { return false; },
      async api() { apiCalls += 1; throw new Error('must not be called'); },
      async graphql() { apiCalls += 1; throw new Error('must not be called'); },
    },
    git: { async wikiRefs() { throw new Error('must not be called'); } },
  });
  assert.equal(apiCalls, 0);
  assert.equal(report.findings.find((item) => item.checkId === 'github.authentication').status, 'NOT_ACCESSIBLE');
  assert.equal(report.findings.find((item) => item.checkId === 'local.pullRequestTemplate').status, 'VERIFIED_PRESENT');
  assert.equal(report.findings.find((item) => item.checkId === 'repository.rulesets').status, 'NOT_ACCESSIBLE');
  assert.match(formatHuman(report), /GitHub Governance Doctor/);
  assert.doesNotMatch(JSON.stringify(report), /gho_[A-Za-z0-9]+/);
});

test('doctor distinguishes empty API results from inaccessible settings', async () => {
  const repo = { full_name: 'bjo163/moonwitnessxv', default_branch: 'main', visibility: 'public', has_issues: true, has_wiki: true, has_pages: false, security_and_analysis: { secret_scanning: { status: 'enabled' } } };
  const gh = {
    async authenticated() { return true; },
    async api(path) {
      if (path === 'repos/bjo163/moonwitnessxv') return repo;
      if (path.includes('/rulesets?')) return [{ id: 42, name: 'main protection', target: 'branch', enforcement: 'active' }];
      if (path.endsWith('/rulesets/42')) return {
        id: 42,
        name: 'main protection',
        target: 'branch',
        enforcement: 'active',
        conditions: { ref_name: { include: ['refs/heads/main'], exclude: [] } },
        rules: [
          { type: 'pull_request', parameters: { required_approving_review_count: 1, allowed_merge_methods: ['squash'] } },
          { type: 'required_status_checks', parameters: { required_status_checks: [{ context: 'CI' }], strict_required_status_checks_policy: true } },
        ],
        bypass_actors: [],
      };
      if (path.includes('/private-vulnerability-reporting')) return { enabled: false };
      if (path.endsWith('/protection')) throw new Error('Branch not protected (HTTP 404)');
      if (path.includes('/actions/runs')) return { workflow_runs: [] };
      return [];
    },
    async graphql() { throw new Error('insufficient read:project scope'); },
  };
  const git = { async wikiRefs() { return { ok: false, stderr: 'not found' }; } };
  const report = await runDoctor({ root: localRoot(), gh, git });
  const byId = new Map(report.findings.map((item) => [item.checkId, item]));
  assert.equal(byId.get('github.issues').status, 'VERIFIED_ABSENT');
  assert.equal(byId.get('github.labels').status, 'VERIFIED_ABSENT');
  assert.equal(byId.get('repository.classicBranchProtection').status, 'VERIFIED_ABSENT');
  assert.equal(byId.get('github.projects').status, 'NOT_ACCESSIBLE');
  assert.equal(byId.get('github.wiki').status, 'NOT_ACCESSIBLE');
  assert.equal(byId.get('repository.pages').status, 'VERIFIED_ABSENT');
  assert.deepEqual(byId.get('repository.securitySettings').data.secret_scanning, 'enabled');
  assert.equal(byId.get('repository.rulesets').data[0].rules[0].requiredApprovals, 1);
  assert.equal(byId.get('github.privateVulnerabilityReporting').status, 'VERIFIED_ABSENT');
  assert.equal(byId.get('github.classicProjects').status, 'VERIFIED_ABSENT');
});

test('doctor leaves API failures unknown and validates CLI arguments', async () => {
  const report = await runDoctor({
    root: localRoot(),
    gh: {
      async authenticated() { return true; },
      async api(path) { if (path === 'repos/bjo163/moonwitnessxv') throw new Error('403'); throw new Error('403'); },
      async graphql() { throw new Error('403'); },
    },
    git: { async wikiRefs() { throw new Error('not reachable'); } },
  });
  assert.equal(report.findings.find((item) => item.checkId === 'repository.identity').status, 'NOT_ACCESSIBLE');
  assert.equal(report.findings.find((item) => item.checkId === 'github.wiki').status, 'NOT_ACCESSIBLE');
  assert.deepEqual(parseArgs(['--json', '--repo', 'owner/project']).json, true);
  assert.throws(() => parseArgs(['--repo', '../repo']), /owner\/name/);
  assert.throws(() => parseArgs(['--oops']), /Unknown/);
});
