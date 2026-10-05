# 家系ラーメン家系図

**▶ https://iekei-ramen-family-tree.vercel.app** — ブラウザで開くだけで使えます（PC・スマホ対応、インストール不要）

吉村家を頂点に、関東の家系ラーメン27店・6世代の修行系譜を、縦書き屋号の伝統的な系図様式で辿れる Web アプリです。

[![家系図の画面。吉村家を選ぶと右に詳細パネルが開き、Google マップへのリンクが表示される](docs/screenshot.jpg)](https://iekei-ramen-family-tree.vercel.app)

## 使い方

| やりたいこと | 操作 |
|---|---|
| 系図を眺める | ドラッグで移動、ホイール / ピンチで拡大縮小。右下の `⊡` で全体表示に戻る |
| ある店の系譜を知る | 屋号にカーソルを合わせると、吉村家までの系譜が浮かび上がる |
| 店の詳細を見る | 屋号を押すと右にパネルが開く。所在地・創業年・世代・師匠と弟子の一覧 |
| **店の場所を調べる** | パネルの **「Google マップで開く ↗」** で Google マップが別タブで開く |
| 系統・都県で絞る | 上部のチップ（直系 / 本牧家系 / 六角家系 … 、神奈川 / 東京 / 千葉）を押す |
| 屋号で探す | 左上の検索欄に入力 |
| 歴史を追う | 年スライダーを動かすか **「1974年から再生」** で、暖簾が広がる様子をアニメーションで見る |

### 凡例の読み方

| 印 | 意味 |
|---|---|
| 赤の二重丸 | 直系（吉村家認定） |
| 紫の点線二重丸 | 元直系（認定を離脱） |
| 単色の丸 | 修行・独立（色は系統を表す） |
| 白抜きの丸 | 閉店・本店閉店 |
| 実線 | 暖簾分け・修行 |
| 点線 | 諸説あり |

町田商店などの資本系は修行の系譜に属さないため、系図の右に別置きしています。

## データについて

系譜は公開情報を編集したものです。創業年は概算（「頃」表記）を含み、系譜上の位置づけに諸説ある店は点線で示しています。誤りや追加したい店があれば [Issue](https://github.com/miyata09x0084/iekei-ramen-family-tree/issues) でお知らせください。

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
- `src/components/TreeCanvas.tsx` — D3 が SVG を専有する描画面。React は class の付け替えだけを伝える
- `src/components/Keizu.tsx` — 絞り込み・検索・年スライダー・選択の状態管理
- `src/components/DetailPanel.tsx` / `Legend.tsx`
- `src/lib/site.ts` — 正とする URL・サイト名・説明文。`metadataBase` / sitemap / robots はここから作る
- `src/app/opengraph-image.tsx` — OGP 画像（1200×630）。`src/lib/og.ts` が系図を影絵の座標に変換し、`src/lib/og-font.ts` がビルド時に筆文字フォントを Google Fonts から取る
- `src/app/sitemap.ts` / `robots.ts` — 静的出力でもビルド時に `out/sitemap.xml` / `out/robots.txt` になる（`dynamic = "force-static"`）

### データの編集

`src/data/shops.ts` の `NODES` 配列に店舗を追加・修正してください。型が付いているので、値の誤りはビルド時に検出されます。型で拾えない店舗データの誤りは `src/lib/validate.ts` が読み込み時に検証し、`next dev` と `next build` が原因の店の id を名指しするエラーで止まります。検証するのは、系譜の整合（資本系を除く全店が師匠をたどって総本山に到達し、同じ店を二度通らない）、id の一意性、師匠と関係の有無（総本山と資本系は両方が空、それ以外は両方が非空。総本山は 1 店だけ）、創業年が師匠より前でないこと（概算の店は除く）の 4 つです。

```ts
{ id: "example", name: "屋号", sub: "地名", pref: "神奈川", city: "横浜市", founded: 2020, approx: true,
  parent: "yoshimura", lineage: "direct", status: "open", edge: "direct", note: "解説",
  mapQuery: "屋号 本店 横浜市中区○○1-2-3" }
```

- `parent`: 師匠となる店の `id`（資本系は `null`）
- `lineage`: `direct` / `honmoku` / `rokkaku` / `ichi` / `oudou` / `musashi` / `indep` / `capital`
- `edge`: `direct`（直系認定）/ `former`（元直系）/ `trained`（修行・独立）/ `disputed`（諸説あり）
- `status`: `open` / `closed` / `main-closed`
- `mapQuery`（任意）: 詳細パネルの「Google マップで開く」で検索する文字列。`店名 + 住所` を基本とし、
  多店舗ブランドは屋号だけにして全店舗を地図に出す。省略すると `店名 + sub（無ければ city）` で組み立てる。
  本店閉店（`main-closed`）の店は暖簾を継承する店舗を指す。
  URL は `src/data/shops.ts` の `mapUrl()` が `https://www.google.com/maps/search/?api=1&query=...` 形式で生成する。
  place ID（`?q=place_id:...`）は店舗の移転・改装で失効すると「一致する検索結果はありません」になるため使わない
