set -e
T="$PWD/.tmp/isp.index"
rm -f "$T"
export GIT_INDEX_FILE="$T"
git read-tree HEAD
WHOLE="BLUEPRINT.md docs/architecture/ISP_NETWORK.md docs/architecture/README.md docs/decisions/ADR-0018-isp-network-operations.md docs/decisions/M02-02-domain-assignments.md docs/milestones/M51.md docs/research/mwx-isp-into-xv-migration-matrix.md docs/tasks/M51/M51-01.md docs/tasks/M51/M51-02.md docs/tasks/M51/M51-03.md docs/tasks/M51/M51-04.md docs/tasks/M51/M51-05.md docs/tasks/M51/M51-06.md docs/tasks/M51/M51-07.md docs/tasks/M51/M51-08.md scripts/check-isp-migration-matrix.mjs scripts/check-m51-01-d20-boundary.mjs test/planning/m51-01-d20-boundary.test.mjs test/planning/m51-02-mwx-isp-migration.test.mjs"
for f in $WHOLE; do
   oid=$(GIT_INDEX_FILE="$PWD/.git/index" git ls-files -s -- "$f" | awk '{print $2; exit}')
  if [ -z "$oid" ]; then echo "MISSING INDEX ENTRY: $f"; exit 1; fi
  git update-index --add --cacheinfo "100644,$oid,$f"
done
git ls-files -s -- TODO.md README.md MASTER_DESIGN.md docs/planning/DOMAIN_COVERAGE.md docs/decisions/README.md package.json >/dev/null
while IFS=$'\t' read -r oid path; do
  git update-index --add --cacheinfo "100644,$oid,$path"
done < <(node .tmp/isp-blobs.mjs)
TREE=$(git write-tree)
echo "TREE=$TREE"
git diff-tree -r --name-status HEAD "$TREE"
