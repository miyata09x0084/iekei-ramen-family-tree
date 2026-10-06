# 家系ラーメン家系図

[![CI](https://github.com/miyata09x0084/iekei-ramen-family-tree/actions/workflows/ci.yml/badge.svg)](https://github.com/miyata09x0084/iekei-ramen-family-tree/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/Data-CC_BY_4.0-lightgrey.svg)](LICENSE-DATA)

**▶ https://iekei-ramen-family-tree.vercel.app** — ブラウザで開くだけで使えます（PC・スマホ対応、インストール不要）

吉村家を頂点に、関東の家系ラーメン 28 店・7 世代の修行系譜を、縦書き屋号の伝統的な系図様式で辿れる Web サイトです。

*An interactive family tree of Iekei ramen shops in the Kanto region, tracing 28 shops across 7 generations back to Yoshimuraya.*

[![家系図の画面。吉村家を選ぶと右に詳細パネルが開き、Google マップへのリンクが表示される](docs/screenshot.jpg)](https://iekei-ramen-family-tree.vercel.app)

## 何ができるか

お店の名前にカーソルを合わせると吉村家までのつながりが光り、押すと場所・できた年・師匠と弟子・出典が読めます。1 店ずつ固定の URL（`/shops/店のid`）があるので、ブログや SNS で「この店の系譜」を指して引用できます。

<details>
<summary>操作の一覧</summary>

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

</details>

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

## データの方針

- **全店に出典を付けています。** 出典は「公式」（公式発信・店主本人の語り・有価証券報告書）、「新聞・雑誌」（報道）、「ネット」（Wikipedia・グルメサイト・ブログ）の 3 つに分け、その最上位から「確か」「ほぼ確か」「未確認」の 3 段階を機械的に導いています。手で確度を付けることはしません
- 出典で裏付けられない創業年は「頃」と表記し、師匠の店に諸説ある店は点線で示しています
- 店舗ページと詳細パネルの上部の画像は「出典カード」で、出典の記事が持つ画像をそのまま参照しています（取り込みません）。店の写真ではなく記事のプレビューで、その店の丼が写っていると確かめた出典にだけ付け、全店に 1 枚ずつあります
- 味の評価はしません。載せるのは系譜と、その根拠だけです
- お店の営業状況や場所は変わることがあります。屋号・ロゴは各店に帰属します

## 誤りの報告・店の情報提供

誤りに気づいたときや、載っていない店をご存じのときは、[issue](https://github.com/miyata09x0084/iekei-ramen-family-tree/issues/new/choose) で教えてください。「誤りの報告」と「店の情報提供」のフォームがあります。公式サイト・店主の発信・新聞や雑誌の記事など、出典の URL を添えてもらえると、そのまま反映できます。

趣味で作っているので、お返事は約束できませんが、いただいた内容は必ず目を通します。

## 開発

Next.js（App Router / TypeScript）+ D3.js。静的出力（`output: 'export'`）なので任意の静的ホスティングに置けます。本番は Vercel でホストしており、`main` への push で自動デプロイされます。

```sh
npm install
npm run dev     # http://localhost:3000
npm run build   # out/ に静的サイトを出力
npm run lint
npm test        # Vitest
```

コードや店舗データに手を入れるときは [CONTRIBUTING.md](CONTRIBUTING.md) を見てください。主要ファイル、店舗データの書き方、PR の条件があります。

## ライセンス

- コード: [MIT](LICENSE)
- 店舗データ（`src/data/shops.ts` の内容）: [CC BY 4.0](LICENSE-DATA)

データを使うときは、次のように出典を書いてください。

> 「家系ラーメン家系図」（https://iekei-ramen-family-tree.vercel.app 、CC BY 4.0）をもとに作成
