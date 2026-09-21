# 参加の手引き

**このプロジェクトがいちばん必要としているのは、コードではなく「その店を知っている人」です。**

系譜の記録は、一人では正確になりません。「ここ違うよ」の一言が、このプロジェクトにとって最も価値のある貢献です。

まずは [プロジェクトコンセプト](./docs/CONCEPT.md) を読むと、何を大事にしているかがわかります。

---

## 参加のしかたは3つ

### 1. 教える（コード不要・いちばん歓迎）

Git も GitHub の作法も要りません。フォームを埋めるだけです。

| 見つけたもの | ここから |
|---|---|
| 系譜が違う / 店が抜けている / 閉店した | [**データの修正・追加**](https://github.com/miyata09x0084/iekei-ramen-family-tree/issues/new?template=data-correction.yml) |
| 動かない・表示が崩れる | [**不具合の報告**](https://github.com/miyata09x0084/iekei-ramen-family-tree/issues/new?template=bug.yml) |
| こうなったら面白い | [**アイデアの提案**](https://github.com/miyata09x0084/iekei-ramen-family-tree/issues/new?template=idea.yml) |

**わかる範囲だけで構いません。** 「創業年は覚えていないけど、店主が○○家出身だと店で聞いた」でも十分に価値があります。こちらで裏取りします。

### 2. 議論する

方針の決めごとは Issue の上でやっています。既存の Issue にコメントするだけでも、優先順位を決める材料になります。とくに意見が欲しいのは:

- [#2](https://github.com/miyata09x0084/iekei-ramen-family-tree/issues/2) 東海・関西の収録（確度「中」の店の裏取り）
- [#20](https://github.com/miyata09x0084/iekei-ramen-family-tree/issues/20) 検索仕様（カナ・全角半角の正規化をやるか）

### 3. 自分で直す（Pull Request）

→ [開発環境](#開発環境) へ

---

## データを直すときのルール

系譜データはこのプロジェクトの本体です。ルールは1つに集約できます。

> **確信のないことを、断定調で書かない。**

具体的には:

| 状況 | どうするか |
|---|---|
| 系譜に諸説ある | `edge: "disputed"` にする（系図で点線になる） |
| 創業年が概算 | `approx: true` を付ける（「頃」表記になる） |
| 裏取りできない | **入れない。** 数合わせで足さない |
| 出典が一次情報でない | Issue / PR の本文に、どこまで確認できたかを書く |

**27軒の正確な系図は、200軒の怪しい系図より価値があります。** 空欄のままにする判断を、こちらは歓迎します。

### 出典の書き方

Issue や PR に、次のどれかを書いてください。強い順です。

1. 店・店主の公式発信（公式サイト、公式 SNS、店内の掲示）
2. 取材記事・書籍（媒体名と、わかれば掲載年）
3. 複数の個人ブログ・まとめで記述が一致している（URL を2つ以上）
4. 自分が店で直接聞いた（「いつ頃」「誰から」を添えてください）

4 も立派な出典です。むしろ**このプロジェクトでしか残らない情報**なので、遠慮なく書いてください。その場合はデータ側で `disputed` 扱いにしたうえで、裏取りを続けます。

### 載せないもの

- 味の優劣、点数、ランキング、「おすすめ」
- 店の経営事情、閉店の理由の推測、係争中の事柄
- 店主の私生活など非公開の情報
- 伝聞の域を出ない対立の話（「あの店とあの店は仲が悪い」など）

詳しくは [コンセプトの「やらないこと」](./docs/CONCEPT.md#やらないこと) を見てください。

---

## 開発環境

```sh
npm install
npm run dev     # http://localhost:3000
npm run build   # out/ に静的サイトを出力
npm run lint
```

Next.js（App Router / TypeScript）+ D3.js。静的出力（`output: 'export'`）です。

### ファイルの役割

| ファイル | 役割 |
|---|---|
| `src/data/shops.ts` | **店舗データと型**。データの修正はここだけで完結する |
| `src/lib/layout.ts` | d3.tree による座標計算と系線の生成（純粋関数） |
| `src/lib/ancestry.ts` | 系譜の遡り、絞り込み判定 |
| `src/components/TreeCanvas.tsx` | D3 が SVG を専有する描画面。React は class の付け替えだけを伝える |
| `src/components/Keizu.tsx` | 絞り込み・検索・年スライダー・選択の状態管理 |
| `src/components/DetailPanel.tsx` / `Legend.tsx` | 詳細パネルと凡例 |

### 店を1軒足す

`src/data/shops.ts` の `NODES` 配列に追加します。型が付いているので、値の誤りはビルド時に検出されます。

```ts
{ id: "example", name: "屋号", sub: "地名", pref: "神奈川", city: "横浜市", founded: 2020, approx: true,
  parent: "yoshimura", lineage: "direct", status: "open", edge: "direct", note: "解説",
  mapQuery: "屋号 本店 横浜市中区○○1-2-3" },
```

| フィールド | 値 |
|---|---|
| `parent` | 師匠となる店の `id`（資本系は `null`） |
| `lineage` | `direct` / `honmoku` / `rokkaku` / `ichi` / `oudou` / `musashi` / `indep` / `capital` |
| `edge` | `direct`（直系認定）/ `former`（元直系）/ `trained`（修行・独立）/ `disputed`（諸説あり） |
| `status` | `open` / `closed` / `main-closed` |
| `approx` | 創業年が概算なら `true` |
| `mapQuery` | 任意。`店名 + 住所` が基本 |

**`mapQuery` の注意点:**

- 多店舗ブランドは**屋号だけ**にして、全店舗が地図に出るようにする
- 本店閉店（`main-closed`）の店は、**暖簾を継承している店舗**を指す
- **place ID（`?q=place_id:...`）は使わない。** 店舗の移転・改装で失効すると「一致する検索結果はありません」になる（[1eabd4e](https://github.com/miyata09x0084/iekei-ramen-family-tree/commit/1eabd4e) 参照）

### 壊しやすいところ

`parent` の打ち間違い**1文字**で画面が真っ白になります。`src/lib/layout.ts` の `d3.stratify()` が例外を投げるためです。

- `parent` が存在しない id を指す → `missing: <id>`
- root（`parent: null`）が0件または2件以上 → `no root` / `multiple roots`
- 親子関係に循環がある → `cycle`（加えて `ancestry()` が無限ループする）

**PR を出す前に `npm run build` を通してください。** 自動検証は [#20](https://github.com/miyata09x0084/iekei-ramen-family-tree/issues/20) で整備中です。

---

## Pull Request の出しかた

1. リポジトリを fork して、ブランチを切る
2. 変更する。**1つの PR では1つのことをする**（データ追加と UI 改修を混ぜない）
3. `npm run lint` と `npm run build` を通す
4. PR を出す。テンプレートの項目を埋める

### 見ているところ

| 変更 | レビューで見ること |
|---|---|
| データ | 出典。確度に応じた `disputed` / `approx` の付け方 |
| UI | スマホ幅（375px）で破綻しないか。`prefers-reduced-motion` を尊重しているか |
| 描画 | D3 の責務と React の責務が混ざっていないか |
| 全体 | 静的出力（`output: 'export'`）のまま維持できるか |

### コミットメッセージ

日本語で、**何をしたか**を一行で。

```
武蔵家の系譜を新中野起点に修正
スマホでチップのタップ領域を44pxに拡大
```

### 寄稿の扱い

Pull Request や Issue で提供された内容は、このリポジトリのライセンス（コードは [MIT](./LICENSE)、系譜データは [CC BY-SA 4.0](./LICENSE-DATA.md)）で公開されます。PR を出すことで、これに同意したものとして扱います。

**他所から本文をそのまま転記しないでください。** 記事や書籍の文章をコピーすると、このライセンスで再配布できなくなります。事実を確認したうえで、自分の言葉で書いてください。

---

## 困ったら

- 作法がわからない → **気にせず Issue を立ててください。** 形式が整っていないことを理由に閉じたりしません
- 書きかけで出していい → いいです。PR のタイトルに `WIP:` と付けてください
- 返事がない → 数日待っても反応がなければ、Issue に一言ください

議論の作法は [行動規範](./CODE_OF_CONDUCT.md) にまとめています。
