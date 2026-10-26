#!/usr/bin/env node
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const execFile = promisify(execFileCallback);
export const STATUSES = Object.freeze([
  'VERIFIED_PRESENT',
  'VERIFIED_ABSENT',
  'NOT_ACCESSIBLE',
  'NOT_INSPECTED',
  'CONFLICTING_EVIDENCE',
]);

const REPO_DEFAULT = 'bjo163/moonwitnessxv';
const GH_HOST = 'github.com';
const LOCAL_PATHS = Object.freeze({
  issueTemplates: '.github/ISSUE_TEMPLATE',
  pullRequestTemplate: '.github/PULL_REQUEST_TEMPLATE.md',
  contributing: 'CONTRIBUTING.md',
  security: 'SECURITY.md',
  codeOwnersRoot: 'CODEOWNERS',
  codeOwnersDocs: 'docs/CODEOWNERS',
  codeOwnersGitHub: '.github/CODEOWNERS',
  governanceDirectory: 'docs/governance',
});

function makeFinding(checkId, status, details = {}) {
  return {
    checkId,
    status,
    evidence: details.evidence ?? 'Not available',
    reason: details.reason ?? '',
    risk: details.risk ?? 'Informational',
    recommendedAction: details.recommendedAction ?? 'No action required.',
    todoClassification: details.todoClassification ?? 'INDEPENDENT_GOVERNANCE_AUTOMATION',
    humanApprovalRequired: details.humanApprovalRequired ?? false,
    ...(details.data === undefined ? {} : { data: details.data }),
  };
}

function validateRepo(repo) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) || repo.split('/').some((part) => part === '.' || part === '..')) {
    throw new Error('Repository must use owner/name form.');
  }
}

async function command(file, args, options = {}) {
  try {
    const result = await execFile(file, args, {
      cwd: options.cwd,
      timeout: options.timeout ?? 15_000,
      maxBuffer: 8 * 1024 * 1024,
      windowsHide: true,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
    return { ok: true, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
  } catch (error) {
    return {
      ok: false,
      stdout: String(error.stdout ?? '').trim(),
      stderr: String(error.stderr ?? error.message ?? 'Command failed').trim(),
      code: error.code,
    };
  }
}

export function parseNdjson(text) {
  if (!text.trim()) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

export function createGhAdapter() {
  return {
    async authenticated() {
      // gh auth status may describe the credential; its output is intentionally discarded.
      const result = await command('gh', ['auth', 'status', '--hostname', GH_HOST]);
      return result.ok;
    },
    async api(path, { paginated = false } = {}) {
      const args = ['api'];
      if (paginated) args.push('--paginate', '--jq', '.[]');
      args.push(path);
      const result = await command('gh', args);
      if (!result.ok) throw new Error(result.stderr || `GitHub API request failed: ${path}`);
      return paginated ? parseNdjson(result.stdout) : JSON.parse(result.stdout);
    },
    async graphql(query) {
      const result = await command('gh', ['api', 'graphql', '-f', `query=${query}`]);
      if (!result.ok) throw new Error(result.stderr || 'GitHub Projects query failed');
      const response = JSON.parse(result.stdout);
      if (response.errors?.length) throw new Error(response.errors.map((item) => item.message).join('; '));
      return response.data;
    },
  };
}

export function createGitAdapter() {
  return {
    async wikiRefs(repo) {
      return command('git', ['-c', 'credential.interactive=never', 'ls-remote', `https://github.com/${repo}.wiki.git`]);
    },
    async wikiFiles(repo) {
      const tempRoot = resolve(tmpdir());
      const checkout = resolve(mkdtempSync(join(tempRoot, 'moonwitness-wiki-')));
      try {
        const cloned = await command('git', [
          '-c', 'credential.interactive=never', 'clone', '--quiet', '--depth', '1',
          `https://github.com/${repo}.wiki.git`, checkout,
        ], { timeout: 30_000 });
        if (!cloned.ok) throw new Error(cloned.stderr || 'Wiki clone failed');
        return readdirSync(checkout, { withFileTypes: true })
          .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
          .map((entry) => entry.name);
      } finally {
        // Only remove the uniquely created checkout directly beneath the OS temp directory.
        if (checkout.startsWith(`${tempRoot}${process.platform === 'win32' ? '\\' : '/'}`)) {
          rmSync(checkout, { recursive: true, force: true });
        }
      }
    },
  };
}

async function inspect(gh, checkId, path, options = {}) {
  try {
    return { value: await gh.api(path, options), finding: null };
  } catch {
    return {
      value: null,
      finding: makeFinding(checkId, 'NOT_ACCESSIBLE', {
        evidence: `GitHub API endpoint: ${path}`,
        reason: 'The API request failed or its permission was unavailable; absence is not inferred.',
        risk: 'The corresponding repository setting or resource remains unknown.',
        recommendedAction: 'Review this resource in GitHub or grant the minimum read scope needed for inventory.',
        todoClassification: 'BLOCKED_BY_ACCESS',
      }),
    };
  }
}

function dataFinding(checkId, value, evidence, details = {}) {
  const present = details.present ?? (Array.isArray(value) ? value.length > 0 : Boolean(value));
  return makeFinding(checkId, details.status ?? (present ? 'VERIFIED_PRESENT' : 'VERIFIED_ABSENT'), {
    evidence,
    reason: details.reason ?? (value ? 'Observed through the read-only GitHub API.' : 'The authorized API returned no matching resource.'),
    risk: details.risk ?? 'Informational',
    recommendedAction: details.recommendedAction ?? 'No action required.',
    todoClassification: details.todoClassification ?? 'INDEPENDENT_GOVERNANCE_AUTOMATION',
    humanApprovalRequired: details.humanApprovalRequired ?? false,
    data: details.data ?? value,
  });
}

export async function runDoctor({ repo = REPO_DEFAULT, root = process.cwd(), gh = createGhAdapter(), git = createGitAdapter() } = {}) {
  validateRepo(repo);
  const findings = [];

  for (const [checkId, relativePath] of Object.entries(LOCAL_PATHS)) {
    const path = resolve(root, relativePath);
    const present = existsSync(path);
    let data = present;
    if (present && checkId === 'issueTemplates') {
      data = readdirSync(path).filter((name) => /\.(yml|yaml|md)$/i.test(name));
    }
    findings.push(dataFinding(`local.${checkId}`, present, relativePath, {
      data,
      reason: present ? `Found local repository path: ${relativePath}` : `Local repository path is absent: ${relativePath}`,
      recommendedAction: present ? 'Review existing content before extending it.' : 'Create only if it is independently needed and outside TODO scope.',
    }));
  }

  let authenticated = false;
  try { authenticated = await gh.authenticated(); } catch { authenticated = false; }
  if (!authenticated) {
    findings.push(makeFinding('github.authentication', 'NOT_ACCESSIBLE', {
      evidence: 'GitHub CLI authentication status (credential output suppressed)',
      reason: 'GitHub CLI authentication is unavailable; remote resources were not inspected.',
      risk: 'Remote repository governance remains unknown.',
      recommendedAction: 'Run the tool after an authorized GitHub CLI session is available; do not provide tokens to the tool.',
      todoClassification: 'BLOCKED_BY_ACCESS',
    }));
    for (const checkId of [
      'repository.identity', 'repository.branches', 'repository.recentCommits', 'repository.rulesets',
      'repository.classicBranchProtection', 'repository.pages', 'repository.securitySettings',
      'github.labels', 'github.milestones', 'github.issues', 'github.pullRequests', 'github.projects',
      'github.classicProjects', 'github.wiki', 'github.privateVulnerabilityReporting', 'github.releases', 'github.tags', 'github.workflows', 'github.workflowRuns',
    ]) {
      findings.push(makeFinding(checkId, 'NOT_ACCESSIBLE', {
        evidence: 'Not inspected because GitHub CLI authentication is unavailable.',
        reason: 'No remote request was made.',
        risk: 'State is unknown.',
        recommendedAction: 'Re-run after authorized read access is available.',
        todoClassification: 'BLOCKED_BY_ACCESS',
      }));
    }
    return { repository: repo, generatedAt: new Date().toISOString(), findings };
  }

  const base = `repos/${repo}`;
  const paths = [
    ['repository.identity', `${base}`],
    ['repository.branches', `${base}/branches?per_page=100`, { paginated: true }],
    ['repository.recentCommits', `${base}/commits?per_page=5`],
    ['repository.rulesets', `${base}/rulesets?per_page=100`, { paginated: true }],
    ['github.labels', `${base}/labels?per_page=100`, { paginated: true }],
    ['github.milestones', `${base}/milestones?state=all&per_page=100`, { paginated: true }],
    ['github.issues', `${base}/issues?state=all&per_page=100`, { paginated: true }],
    ['github.pullRequests', `${base}/pulls?state=all&per_page=100`, { paginated: true }],
    ['github.privateVulnerabilityReporting', `${base}/private-vulnerability-reporting`],
    ['github.classicProjects', `${base}/projects?state=all&per_page=100`, { paginated: true }],
    ['github.releases', `${base}/releases?per_page=100`, { paginated: true }],
    ['github.tags', `${base}/tags?per_page=100`, { paginated: true }],
    ['github.workflows', `${base}/actions/workflows?per_page=100`, { paginated: true }],
  ];
  const responses = await Promise.all(paths.map(async ([id, path, options]) => {
    const result = await inspect(gh, id, path, options);
    return [id, path, result];
  }));
  const values = new Map();
  for (const [id, path, result] of responses) {
    if (result.finding) findings.push(result.finding);
    else values.set(id, { value: result.value, path });
  }

  const identity = values.get('repository.identity')?.value;
  if (identity) {
    findings.push(dataFinding('repository.identity', {
      name: identity.full_name,
      defaultBranch: identity.default_branch,
      visibility: identity.visibility,
      hasIssues: identity.has_issues,
      hasWiki: identity.has_wiki,
      hasPages: identity.has_pages,
    }, `GitHub REST API: ${base}`));
  }
  const branches = values.get('repository.branches');
  if (branches) findings.push(dataFinding('repository.branches', branches.value.map((item) => item.name), `GitHub REST API: ${branches.path}`));
  const commits = values.get('repository.recentCommits');
  if (commits) findings.push(dataFinding('repository.recentCommits', commits.value.map((item) => ({
    sha: item.sha,
    message: item.commit?.message?.split('\n')[0] ?? '',
    date: item.commit?.author?.date ?? null,
  })), `GitHub REST API: ${commits.path}`));

  const rulesets = values.get('repository.rulesets');
  if (rulesets) {
    const detailed = await Promise.all(rulesets.value.map(async (item) => {
      if (!item.id) return { name: item.name, target: item.target, enforcement: item.enforcement, detailStatus: 'NOT_ACCESSIBLE' };
      try {
        const detail = await gh.api(`${base}/rulesets/${item.id}`);
        return {
          id: detail.id,
          name: detail.name,
          target: detail.target,
          enforcement: detail.enforcement,
          refInclude: detail.conditions?.ref_name?.include ?? [],
          refExclude: detail.conditions?.ref_name?.exclude ?? [],
          rules: (detail.rules ?? []).map((rule) => ({
            type: rule.type,
            ...(rule.parameters?.required_approving_review_count === undefined ? {} : { requiredApprovals: rule.parameters.required_approving_review_count }),
            ...(rule.parameters?.required_status_checks === undefined ? {} : { requiredChecks: rule.parameters.required_status_checks.map((check) => check.context) }),
            ...(rule.parameters?.strict_required_status_checks_policy === undefined ? {} : { strictChecks: rule.parameters.strict_required_status_checks_policy }),
            ...(rule.parameters?.require_code_owner_review === undefined ? {} : { requireCodeOwnerReview: rule.parameters.require_code_owner_review }),
            ...(rule.parameters?.required_review_thread_resolution === undefined ? {} : { resolveReviewThreads: rule.parameters.required_review_thread_resolution }),
            ...(rule.parameters?.allowed_merge_methods === undefined ? {} : { allowedMergeMethods: rule.parameters.allowed_merge_methods }),
          })),
          bypassActorCount: detail.bypass_actors?.length ?? 0,
        };
      } catch {
        return { name: item.name, target: item.target, enforcement: item.enforcement, detailStatus: 'NOT_ACCESSIBLE' };
      }
    }));
    findings.push(dataFinding('repository.rulesets', detailed, `GitHub REST API: ${rulesets.path}`));
  }
  if (identity) {
    try {
      const protection = await gh.api(`${base}/branches/${encodeURIComponent(identity.default_branch)}/protection`);
      findings.push(dataFinding('repository.classicBranchProtection', { enabled: true, requiredChecks: protection.required_status_checks?.contexts ?? [] }, `GitHub REST API: ${base}/branches/${identity.default_branch}/protection`));
    } catch (error) {
      const message = String(error.message ?? error);
      if (/branch not protected/i.test(message)) {
        findings.push(dataFinding('repository.classicBranchProtection', false, `GitHub REST API: ${base}/branches/${identity.default_branch}/protection`, { reason: 'GitHub explicitly reported that classic branch protection is not configured; rulesets are inspected separately.' }));
      } else {
        findings.push(makeFinding('repository.classicBranchProtection', 'NOT_ACCESSIBLE', {
          evidence: `GitHub REST API: ${base}/branches/${identity.default_branch}/protection`,
          reason: 'The endpoint failed without an explicit absence response.',
          risk: 'Classic branch protection state is unknown.',
          recommendedAction: 'Inspect the branch settings in GitHub.',
          todoClassification: 'BLOCKED_BY_ACCESS',
        }));
      }
    }
  }
  const pagesMeta = identity?.has_pages;
  if (pagesMeta === false) findings.push(dataFinding('repository.pages', false, `GitHub REST API: ${base}`, { reason: 'Repository metadata reports Pages disabled.' }));
  else if (pagesMeta === true) {
    const pageResult = await inspect(gh, 'repository.pages', `${base}/pages`);
    if (pageResult.finding) findings.push(pageResult.finding);
    else findings.push(dataFinding('repository.pages', pageResult.value, `GitHub REST API: ${base}/pages`));
  } else findings.push(makeFinding('repository.pages', 'NOT_INSPECTED', {
    evidence: `GitHub REST API: ${base}`,
    reason: 'Repository metadata did not expose Pages status.',
    risk: 'Pages configuration remains unknown.',
    recommendedAction: 'Inspect Pages settings in GitHub.',
    todoClassification: 'BLOCKED_BY_ACCESS',
  }));
  if (identity?.security_and_analysis) {
    const security = Object.fromEntries(Object.entries(identity.security_and_analysis).map(([key, value]) => [key, value?.status ?? 'UNKNOWN']));
    findings.push(dataFinding('repository.securitySettings', security, `GitHub REST API: ${base}`));
  } else {
    const securityResult = responses.find(([id]) => id === 'repository.securitySettings')?.[2];
    if (securityResult?.finding) findings.push(securityResult.finding);
    else findings.push(dataFinding('repository.securitySettings', null, `GitHub REST API: ${base}`, { status: 'NOT_INSPECTED', reason: 'The API response did not expose security feature status.' }));
  }

  const labels = values.get('github.labels');
  if (labels) findings.push(dataFinding('github.labels', labels.value.map((item) => item.name), `GitHub REST API: ${labels.path}`));
  const milestones = values.get('github.milestones');
  if (milestones) findings.push(dataFinding('github.milestones', milestones.value.map((item) => ({ title: item.title, state: item.state, openIssues: item.open_issues, closedIssues: item.closed_issues })), `GitHub REST API: ${milestones.path}`));
  const issues = values.get('github.issues');
  if (issues) {
    const issueCount = issues.value.filter((item) => !item.pull_request).length;
    findings.push(dataFinding('github.issues', { issueCount }, `GitHub REST API: ${issues.path}`, { present: issueCount > 0 }));
  }
  const prs = values.get('github.pullRequests');
  if (prs) findings.push(dataFinding('github.pullRequests', { pullRequestCount: prs.value.length }, `GitHub REST API: ${prs.path}`, { present: prs.value.length > 0 }));
  const privateReporting = values.get('github.privateVulnerabilityReporting');
  if (privateReporting) findings.push(dataFinding('github.privateVulnerabilityReporting', privateReporting.value.enabled === true, `GitHub REST API: ${privateReporting.path}`, {
    reason: privateReporting.value.enabled === true ? 'Private vulnerability reporting is enabled.' : 'Private vulnerability reporting is disabled.',
    risk: privateReporting.value.enabled === true ? 'Informational' : 'Security reports lack a built-in private submission route.',
    recommendedAction: privateReporting.value.enabled === true ? 'No action required.' : 'Repository owner should enable private vulnerability reporting or publish a private contact.',
    humanApprovalRequired: privateReporting.value.enabled !== true,
  }));
  const classicProjects = values.get('github.classicProjects');
  if (classicProjects) findings.push(dataFinding('github.classicProjects', classicProjects.value.map((item) => ({ name: item.name, state: item.state, url: item.html_url })), `GitHub REST API: ${classicProjects.path}`));

  try {
    const owner = repo.split('/')[0];
    const name = repo.split('/')[1];
    const data = await gh.graphql(`query { repository(owner: "${owner}", name: "${name}") { projectsV2(first: 100) { nodes { title url closed } pageInfo { hasNextPage } } } }`);
    const connection = data?.repository?.projectsV2;
    const projectList = connection?.nodes ?? [];
    findings.push(dataFinding('github.projects', {
      projects: projectList.map(({ title, url, closed }) => ({ title, url, closed })),
      furtherPages: Boolean(connection?.pageInfo?.hasNextPage),
    }, 'GitHub GraphQL projectsV2 query', { present: projectList.length > 0 }));
  } catch {
    findings.push(makeFinding('github.projects', 'NOT_ACCESSIBLE', {
      evidence: 'GitHub GraphQL projectsV2 query',
      reason: 'Project inventory failed or the token lacks project read scope; absence is not inferred.',
      risk: 'Project state remains unknown.',
      recommendedAction: 'Inspect Projects in GitHub or grant the minimum `read:project` scope.',
      todoClassification: 'BLOCKED_BY_ACCESS',
    }));
  }

  const releases = values.get('github.releases');
  if (releases) findings.push(dataFinding('github.releases', releases.value.map((item) => ({ tag: item.tag_name, name: item.name, draft: item.draft, prerelease: item.prerelease })), `GitHub REST API: ${releases.path}`));
  const tags = values.get('github.tags');
  if (tags) findings.push(dataFinding('github.tags', tags.value.map((item) => item.name), `GitHub REST API: ${tags.path}`));
  const workflows = values.get('github.workflows');
  if (workflows) findings.push(dataFinding('github.workflows', workflows.value.map((item) => ({ name: item.name, state: item.state, path: item.path })), `GitHub REST API: ${workflows.path}`));
  const runs = values.get('github.workflowRuns');
  if (runs) findings.push(dataFinding('github.workflowRuns', (runs.value?.workflow_runs ?? []).map((item) => ({
    id: item.id, name: item.name, headSha: item.head_sha, status: item.status, conclusion: item.conclusion, createdAt: item.created_at, url: item.html_url,
  })), `GitHub REST API: ${base}/actions/runs`));

  if (!identity) {
    findings.push(makeFinding('github.wiki', 'NOT_ACCESSIBLE', {
      evidence: 'Wiki inventory requires repository identity.', reason: 'The repository metadata could not be read.',
      risk: 'Wiki state is unknown.', recommendedAction: 'Re-run after repository API access is available.', todoClassification: 'BLOCKED_BY_ACCESS',
    }));
  } else if (identity.has_wiki === false) {
    findings.push(dataFinding('github.wiki', false, `GitHub REST API: ${base}`, { reason: 'Repository metadata reports Wiki disabled.' }));
  } else {
    try {
      const refs = await git.wikiRefs(repo);
      if (!refs.ok) throw new Error(refs.stderr || 'Wiki repository was not reachable');
      const files = await git.wikiFiles(repo);
      findings.push(dataFinding('github.wiki', { enabled: true, pages: files.map((name) => basename(name, '.md')) }, `Git Wiki repository: https://github.com/${repo}.wiki.git`, { present: true }));
    } catch {
      findings.push(makeFinding('github.wiki', 'NOT_ACCESSIBLE', {
        evidence: `Git Wiki repository: https://github.com/${repo}.wiki.git`,
        reason: 'Wiki metadata says it is enabled, but the Wiki repository could not be read; this does not prove that it is empty.',
        risk: 'Existing Wiki pages and ownership cannot be determined.',
        recommendedAction: 'Initialize or grant read access to the Wiki, then rerun the dry-run publisher.',
        todoClassification: 'BLOCKED_BY_ACCESS',
        humanApprovalRequired: true,
      }));
    }
  }

  return { repository: repo, generatedAt: new Date().toISOString(), findings };
}

export function formatHuman(report) {
  const lines = [`GitHub Governance Doctor — ${report.repository}`, `Generated: ${report.generatedAt}`, ''];
  for (const item of report.findings) {
    lines.push(`${item.status.padEnd(22)} ${item.checkId}`);
    if (item.data !== undefined) {
      const value = Array.isArray(item.data) || (item.data && typeof item.data === 'object')
        ? JSON.stringify(item.data)
        : String(item.data);
      lines.push(`  Observed: ${value}`);
    }
    lines.push(`  ${item.reason}`);
    lines.push(`  Evidence: ${item.evidence}`);
    if (item.recommendedAction !== 'No action required.') lines.push(`  Next: ${item.recommendedAction}`);
  }
  return lines.join('\n');
}

function help() {
  return [
    'Usage: node scripts/governance/github-doctor.mjs [--json] [--repo owner/name]',
    '',
    'Read-only inventory of local governance files and observable GitHub repository state.',
    'Requires an already authenticated GitHub CLI for remote checks; credentials are never printed.',
    'Options: --json  emit machine-readable JSON; --repo owner/name  choose a repository; --help  show this help.',
  ].join('\n');
}

export function parseArgs(argv) {
  const options = { json: false, repo: REPO_DEFAULT, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--repo' && argv[index + 1]) options.repo = argv[++index];
    else throw new Error(`Unknown or incomplete option: ${arg}`);
  }
  validateRepo(options.repo);
  return options;
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    process.stdout.write(`${help()}\n`);
    return;
  }
  const report = await runDoctor({ repo: options.repo });
  process.stdout.write(`${options.json ? JSON.stringify(report, null, 2) : formatHuman(report)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`GitHub Governance Doctor: ${error.message}\nRun with --help for usage.\n`);
    process.exitCode = 1;
  });
}
