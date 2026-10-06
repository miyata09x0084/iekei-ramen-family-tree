# 家系ラーメン家系図

**▶ https://iekei-ramen-family-tree.vercel.app** — ブラウザで開くだけで使えます（PC・スマホ対応、インストール不要）

吉村家を頂点に、関東の家系ラーメン28店・7世代の修行系譜を、縦書き屋号の伝統的な系図様式で辿れる Web アプリです。

[![家系図の画面。吉村家を選ぶと右に詳細パネルが開き、Google マップへのリンクが表示される](docs/screenshot.jpg)](https://iekei-ramen-family-tree.vercel.app)

## 使い方

| やりたいこと | 操作 |
|---|---|
| 系図を眺める | ドラッグで移動、ホイール / ピンチで拡大縮小。右下の `⊡` で全体表示に戻る |
| ある店のつながりを知る | お店の名前にカーソルを合わせると、吉村家までのつながりが光る |
| 店の詳細を見る | お店の名前を押すと右にパネルが開く。場所・できた年・世代・師匠と弟子の一覧 |
| **店の場所を調べる** | パネルの **「Google マップで開く ↗」** で Google マップが別タブで開く |
| **1 店を指して共有する** | パネルの **「このお店のページ」** を開き、その URL（`/shops/店のid`）を貼る。吉村家までのつながり・師匠・弟子・出典が文章で読め、「系図でこのお店を見る」で系図に戻れる。全店は右下の「お店の一覧」から |
| 系統・地域で絞る | 上部のチップ（直系 / 本牧家系 / 六角家系 … 、神奈川 / 東京 / 千葉）を押す |
| お店の名前で探す | 左上の検索欄に入力 |
| 歴史を追う | 年スライダーを動かすか **「1974年からもう一度見る」** で、お店が増えていく様子をアニメーションで見る |

### 印の意味

| 印 | 意味 |
|---|---|
| 赤の二重丸 | 直系（吉村家が認めたお店） |
| 紫の点線二重丸 | 元直系（前は直系だったお店） |
| 単色の丸 | 修行して独立したお店（色は系統を表す） |
| 白抜きの丸 | 閉店したお店（本店だけ閉店も含む） |
| 実線 | 師匠から弟子へ |
| 点線 | 諸説あり（はっきりしない） |
| 細かい点線 | 影響だけ（修行はしていない） |

町田商店などの資本系は修行の系譜に属さないため、系図の右に別置きしています。

## データについて

系譜は公開情報を編集したものです。全店に出典を付け、お店の名前を押して開く詳細パネルの「出典」から原文を確かめられます。出典は「公式」（公式発信・店主本人の語り・有価証券報告書）、「新聞・雑誌」（報道）、「ネット」（Wikipedia・グルメサイト・ブログ）に分けて表示し、その最上位から「確かさ」を導いています。公式が 1 件でもあれば「確か」、新聞・雑誌までなら「ほぼ確か」、ネットだけなら「未確認」です。出典で裏付けられない創業年は概算（「頃」表記）とし、師匠の店に諸説ある店は点線で示しています。誤りや追加したい店があれば [Issue](https://github.com/miyata09x0084/iekei-ramen-family-tree/issues) でお知らせください。

---

## 開発

Next.js（App Router / TypeScript）+ D3.js。静的出力（`output: 'export'`）なので任意の静的ホスティングに置けます。
本番は Vercel（Hobby）でホストしており、`main` への push で自動デプロイされます。

```sh
npm install
npm run dev     # http://localhost:3000
npm run build   # out/ に静的サイトを出力
npm run lint
npm test        # Vitest
```

PR を立てると GitHub Actions（`.github/workflows/ci.yml`）が test / lint / build を自動実行します。3 つすべてが成功しないと `main` にはマージできません。

Claude Code で作業するときは、`.claude/settings.json` の hook が破壊的な git コマンドを実行前に止めます。止めるのは force push、`main` への直 push、`git reset --hard`、`git clean -f`、`git branch -D`、`git checkout .` / `git restore .` です。判定は `.claude/hooks/dangerous-git.mjs` にあり、止められたコマンドが必要なときは、自分のターミナルか Claude Code の入力欄の `! <コマンド>` で実行します。hook が判定の途中で失敗したときも、素通しにせず止めます。

この hook は事故の防止が目的で、回避の防止ではありません。次のものは見ません: 引用符で囲んだ引数（`git push origin "main"`）や `sh -c "..."` の中身、heredoc の本文、パス付きの `/usr/bin/git`、`git push --all` / `--mirror`、ブランチの削除（`git push origin --delete`）。

### 構成

- `src/data/shops.ts` — 店舗データと型（`Shop`）、系統・関係・状態のラベル
- `src/lib/layout.ts` — d3.tree による座標計算と系線の生成（純粋関数）
- `src/lib/ancestry.ts` — 系譜の遡り、絞り込み判定
- `src/lib/validate.ts` — 店舗データの系譜の整合の検証（読み込み時に呼ばれ、壊れていればビルドが止まる）
- `src/lib/exterior.ts` / `src/components/ExteriorImage.tsx` — 店の外観画像（Google ストリートビュー）の URL・画像の出典と、それを出す部品。店舗ページと詳細パネルで使う。
  画像は保存せず Google から都度読み込む。環境変数 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`（Street View Static API のキー）が無いビルドでは画像を出さない。
  キーは Google Cloud で「API の制限: Street View Static API のみ」「ウェブサイトの制限: `https://iekei-ramen-family-tree.vercel.app/*`」を付け、Vercel の環境変数とローカルの `.env.local` に置く。
  無料枠は月 10,000 リクエスト（1 店を開くたびに 1 リクエスト）。超えると画像が出なくなるだけで、ページは壊れない。
  `npm run check:exterior` が全店の位置にストリートビューの画像があるかを（無料の metadata API で）確かめる
- `src/components/TreeCanvas.tsx` — D3 が SVG を専有する描画面。React は class の付け替えだけを伝える
- `src/components/Keizu.tsx` — 絞り込み・検索・年スライダー・選択の状態管理
- `src/components/DetailPanel.tsx` / `Legend.tsx`
- `src/app/shops/[id]/page.tsx` — 店舗ページ。`generateStaticParams` で全店ぶんを `out/shops/<id>.html` に出す。`src/app/shops/page.tsx` は系統ごとの一覧
- `src/lib/shop-page.ts` — 店舗ページの URL・題名・説明文・世代・訂正 issue の URL（純粋関数）。`/?shop=<id>` で系図を開くと、`Keizu.tsx` がその店を選択済みで表示する
- `src/lib/site.ts` — 正とする URL・サイト名・説明文・OGP 画像の 1 行。`metadataBase` / sitemap / robots はここから作る
- `src/app/og.png/route.tsx` — OGP 画像（1200×630）。ビルド時に `out/og.png` になる。題字と、系線・丸印だけの系図（資本系は除く）。`src/lib/og.ts` が系図をその座標に変換し、`src/lib/og-font.ts` がビルド時に筆文字フォントを Google Fonts から取る
- `src/app/sitemap.ts` / `robots.ts` — 静的出力でもビルド時に `out/sitemap.xml` / `out/robots.txt` になる（`dynamic = "force-static"`）

### データの編集

`src/data/shops.ts` の `NODES` 配列に店舗を追加・修正してください。型が付いているので、値の誤りはビルド時に検出されます。型で拾えない店舗データの誤りは `src/lib/validate.ts` が読み込み時に検証し、`next dev` と `next build` が原因の店の id を名指しするエラーで止まります。検証するのは、系譜の整合（資本系を除く全店が師匠をたどって総本山に到達し、同じ店を二度通らない）、id の一意性、師匠と関係の有無（総本山と資本系は両方が空、それ以外は両方が非空。総本山は 1 店だけ）、創業年が師匠より前でないこと（概算の店は除く）、全店に出典が 1 件以上あり、媒体名が空でなく、URL が http(s) で始まること、全店に外観画像の位置（`exterior`）があることの 6 つです。

```ts
{ id: "example", name: "屋号", sub: "地名", pref: "神奈川", city: "横浜市", founded: 2020, approx: true,
  parent: "yoshimura", lineage: "direct", status: "open", edge: "direct", note: "解説",
  sources: [{ title: "屋号 公式サイト", url: "https://example.com/about", kind: "primary", note: "創業年・師匠" }],
  mapQuery: "屋号 本店 横浜市中区○○1-2-3",
  exterior: { location: "神奈川県横浜市中区○○1-2-3" } }
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
- `exterior`: 外観画像の位置。全店に必須。`location` は Google ストリートビューに渡す住所（都道府県から番地まで。店名は含めない）。
  本店閉店（`main-closed`）の店は名前を受け継ぐ店舗、資本系は本店、閉店した店はあった場所を指す。
  住所だと地点や向きがずれる店だけ、`pano`（パノラマ ID。あれば `location` より優先）か `heading`（向き、度）で上書きする。
  住所を入れたら `npm run check:exterior` で画像があるかを確かめる
