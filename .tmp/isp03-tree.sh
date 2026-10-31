set -euo pipefail
cd "$(dirname "$0")/.."
rm -f .tmp/isp03.index
export GIT_INDEX_FILE="$PWD/.tmp/isp03.index"
git read-tree HEAD
node .tmp/isp03-blobs.mjs
TREE=$(git write-tree)
echo "tree=$TREE"
git diff-tree -r --name-status HEAD "$TREE"
