# 貢献のしかた

家系ラーメン家系図は、ひとりで趣味として作っているサイトです。手伝ってもらえると助かることと、その受け方を書きます。

## 歓迎すること

- **誤りの報告**。系図や店舗ページの情報が違うと気づいたら、[誤りの報告](https://github.com/miyata09x0084/iekei-ramen-family-tree/issues/new?template=correction.yml)の issue で教えてください。これが一番助かります
- **店の情報提供**。載っていない店や系譜のつながりは、[店の情報提供](https://github.com/miyata09x0084/iekei-ramen-family-tree/issues/new?template=shop-info.yml)の issue で。出典（公式サイト・店主の発信・新聞や雑誌の記事の URL）が必要です
- **PR**。コードの改善も、店舗データの修正も歓迎します。店舗データの PR は出典が 1 件以上ないとビルドが止まります（下記「店舗データの編集」）

このサイトは味の評価をしません。収録する店の範囲を広げる予定も、約束はしていません。

## issue の扱い

いただいた issue は必ず読みますが、お返事は約束できません。優先順位は非公開の GitHub Project で管理し、着手するときに issue を「ねらい / やること / 完了条件」の形に書き直します。仕組みは [ADR 0001](docs/adr/0001-issue-triage-with-github-project.md) にあります。

## 開発環境

Next.js（App Router / TypeScript）+ D3.js。静的出力（`output: 'export'`）なので任意の静的ホスティングに置けます。

```sh
npm install
npm run dev     # http://localhost:3000
npm run build   # out/ に静的サイトを出力
npm run lint
npm test        # Vitest
```

PR を立てると GitHub Actions（`.github/workflows/ci.yml`）が test / lint / build を自動実行します。3 つすべてが成功しないと `main` にはマージできません。

## 主要ファイル

- `src/data/shops.ts` — 店舗データと型（`Shop`）、系統・関係・状態のラベル
- `src/lib/validate.ts` — 店舗データの系譜の整合の検証。読み込み時に呼ばれ、壊れていればビルドが止まる
- `src/lib/layout.ts` — d3.tree による座標計算と系線の生成（純粋関数）
- `src/components/TreeCanvas.tsx` — D3 が SVG を専有する描画面。React は class の付け替えだけを伝える
- `src/app/shops/[id]/page.tsx` — 店舗ページ。`generateStaticParams` で全店ぶんを静的に出す

用語（系譜・系統・師匠・出典・確度など）は [CONTEXT.md](CONTEXT.md) に揃えています。

## 店舗データの編集

`src/data/shops.ts` の `NODES` 配列に店舗を追加・修正してください。型が付いているので、値の誤りはビルド時に検出されます。型で拾えない店舗データの誤りは `src/lib/validate.ts` が読み込み時に検証し、`next dev` と `next build` が原因の店の id を名指しするエラーで止まります。検証するのは、系譜の整合（資本系を除く全店が師匠をたどって総本山に到達し、同じ店を二度通らない）、id の一意性、師匠と関係の有無（総本山と資本系は両方が空、それ以外は両方が非空。総本山は 1 店だけ）、創業年が師匠より前でないこと（概算の店は除く）、全店に出典が 1 件以上あり、媒体名が空でなく、URL が http(s) で始まることの 5 つです。

```ts
{ id: "example", name: "屋号", sub: "地名", pref: "神奈川", city: "横浜市", founded: 2020, approx: true,
  parent: "yoshimura", lineage: "direct", status: "open", edge: "direct", note: "解説",
  sources: [{ title: "屋号 公式サイト", url: "https://example.com/about", kind: "primary", note: "創業年・師匠" }],
  mapQuery: "屋号 本店 横浜市中区○○1-2-3" }
```

- `parent`: 師匠となる店の `id`（資本系は `null`）
- `lineage`: `direct` / `honmoku` / `rokkaku` / `ichi` / `oudou` / `musashi` / `indep` / `capital`
- `edge`: `direct`（直系認定）/ `former`（元直系）/ `trained`（修行・独立）/ `disputed`（諸説あり）/ `inspired`（影響。師弟関係なし）
- `status`: `open` / `closed` / `main-closed`
- `sources`: 出典。1 件以上が必須で、詳細パネルの「出典」に媒体名のリンクとして並ぶ。`title` は媒体名＋ページ名（例: `Wikipedia「吉村家」`）、
  `url` は実際に開いて主張が書かれていることを確かめた URL（https を基本とし、証明書不一致で開けない公式サイトだけ http）、`note`（任意）はその出典が裏付ける項目（例: `創業年・師匠`）。
  `kind` は出典の種別で、`primary`（店・運営会社・吉村家の公式発信、店主本人のインタビューや連載、有価証券報告書）/ `secondary`（新聞・雑誌・地域メディアの取材記事）/ `tertiary`（Wikipedia、グルメサイトのデータ、まとめ、個人ブログ）。
  詳細パネルの「確度」は `src/lib/certainty.ts` が最上位の `kind` から導く（一次あり → 確定、二次まで → 報道による、三次だけ → 未確認）ので、手で付けない。出典の並びも一次 → 二次 → 三次に揃えるので、配列の順は気にしなくてよい。
  裏付けが取れない創業年は `approx: true`、師匠は `edge: "disputed"` にする。
  全店の出典を開いて確かめ直したら、`SOURCES_CHECKED_AT`（店舗ページの「出典を確かめた日」）をその日に直す。店ごとの日付は持たない
- `mapQuery`（任意）: 詳細パネルの「Google マップで開く」で検索する文字列。`店名 + 住所` を基本とし、
  多店舗ブランドは屋号だけにして全店舗を地図に出す。省略すると `店名 + sub（無ければ city）` で組み立てる。
  本店閉店（`main-closed`）の店は暖簾を継承する店舗を指す。
  URL は `src/data/shops.ts` の `mapUrl()` が `https://www.google.com/maps/search/?api=1&query=...` 形式で生成する。
  place ID（`?q=place_id:...`）は店舗の移転・改装で失効すると「一致する検索結果はありません」になるため使わない

## Claude Code で作業する人へ

- `.claude/settings.json` の hook が、破壊的な git コマンド（force push、`main` への直 push、`git reset --hard` など）を実行前に止めます
- 止められたコマンドが必要なときは、自分のターミナルか Claude Code の入力欄の `! <コマンド>` で実行してください
- 何を止めて何を見ないかは `.claude/hooks/dangerous-git.mjs` の先頭コメントにあります
