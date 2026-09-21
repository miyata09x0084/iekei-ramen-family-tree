#!/bin/bash
#
# Stop hook: 型チェック → lint → ビルド → テスト を順に実行する。
#
# settings.json で asyncRewake を指定しているため背景で走る。応答は待たされず、
# 失敗したときだけ exit 2 で Claude を起こして差し戻す。
# さらに、前回成功時から検証対象が1バイトも変わっていなければ即座に抜ける
# （質問だけの往復や /clear では走らない）。
#
# 手元で同じことをするなら:
#   npx tsc --noEmit && npm run lint && npm run build && npm test --if-present

set -uo pipefail

input=$(cat)

# 差し戻しで走り直した Stop では再検証しない
if [[ "$(printf '%s' "$input" | jq -r '.stop_hook_active' 2>/dev/null)" == "true" ]]; then
  exit 0
fi

# スクリプトの位置からプロジェクトルートを決める（.claude/hooks/ の2つ上）
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root" || exit 0

[[ -f package.json ]] || exit 0

# 依存が入っていない状態で落としても直しようがないので黙って通す
if [[ ! -d node_modules ]]; then
  echo "node_modules がないため検証をスキップしました（npm install を実行してください）" >&2
  exit 0
fi

# 状態は .git/ の下に置く。コミット対象にならないので .gitignore を足さずに済む
state="$(git rev-parse --git-dir 2>/dev/null || echo .git)/claude-verify"
mkdir -p "$state"

# 背景実行なので、前回の検証が終わる前に次が始まりうる。重複は後勝ちにせず捨てる
exec 9>"$state/lock"
flock -n 9 || exit 0

# 検証結果を左右するファイルの内容ハッシュ。前回成功時と同じなら走らせる意味がない
TARGETS=(src package.json package-lock.json tsconfig.json next.config.ts eslint.config.mjs)
fingerprint=$(
  find "${TARGETS[@]}" -type f -print0 2>/dev/null |
    LC_ALL=C sort -z | xargs -0 sha1sum 2>/dev/null | sha1sum | cut -d' ' -f1
)
if [[ -n "$fingerprint" && -f "$state/last-ok" && "$fingerprint" == "$(<"$state/last-ok")" ]]; then
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

printf '%s' "$fingerprint" > "$state/last-ok"
exit 0
