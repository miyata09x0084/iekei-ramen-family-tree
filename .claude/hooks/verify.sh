#!/bin/bash
#
# Stop hook: 型チェック → lint → ビルド → テスト を順に実行する。
# 1つでも落ちたら exit 2 で Claude に差し戻し、出力をそのまま伝える。
#
# 手元で同じことをするなら:
#   npx tsc --noEmit && npm run lint && npm run build && npm test --if-present

set -uo pipefail

input=$(cat)

# 再帰防止。差し戻しで走り直した Stop ではもう検証しない
if [[ "$(printf '%s' "$input" | jq -r '.stop_hook_active' 2>/dev/null)" == "true" ]]; then
  exit 0
fi

# スクリプトの位置からプロジェクトルートを決める（.claude/hooks/ の2つ上）
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root" || exit 0

# npm プロジェクトでなければ何もしない
[[ -f package.json ]] || exit 0

# 依存が入っていない状態で落としても直しようがないので黙って通す
if [[ ! -d node_modules ]]; then
  echo "node_modules がないため検証をスキップしました（npm install を実行してください）" >&2
  exit 0
fi

run() {
  local label="$1"; shift
  local out
  if ! out=$("$@" 2>&1); then
    {
      echo "$label に失敗しました。コミット前に直してください。"
      echo "--- $* ---"
      # 全部返すと長いので末尾だけ
      printf '%s\n' "$out" | tail -40
    } >&2
    exit 2
  fi
}

run "型チェック" npx tsc --noEmit
run "lint" npm run lint
run "ビルド" npm run build
# test スクリプトが無い間は --if-present が何もせず通す
run "テスト" npm test --if-present

exit 0
