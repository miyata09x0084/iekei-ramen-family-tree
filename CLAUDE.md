# ツギイエ

趣味のサイドプロジェクト。施策は定期作業・返信・締め切りを生まないものを選ぶ（[ADR 0001](docs/adr/0001-issue-triage-with-github-project.md)、[ADR 0004](docs/adr/0004-renewal-to-tsugiie.md)）。

## コンセプト

**次の一杯を、理由つきで決める。食べた店から系譜をたどり、出典つきで確かめられる。**

issue を入れるか捨てるか迷ったら、この一文に合うほうを選ぶ。

- 主役の利用者は、家系を 10 店ほど食べて好みの傾向があり、次にどの店へ行くかを根拠をもって決めたい人。初心者には各系統の代表店から入る導線を置く
- 「理由つき」は、提案の根拠が系譜上の関係（同じ系統、師匠筋、まだ行っていない系統の代表店）で、出典で確かめられること。他人の評価点は使わない
- 「確かめられる」は、どこまで確かかが分かること。諸説ありの関係は両方の出典を示し、資本系で系譜に属さないことも出典つきで示せば答えになる

やらないこと:

- 数は測るが約束しない。成功指標は見直しの材料で、達成を目標にしない
- 他人の評価は扱わない。味メモは本人だけが見るもので、店の評価として公開しない
- 返信義務と締め切りを生まない。誤りの報告は「対応する」とだけ書き、日数は約束しない

## 使うスキル

同じ場面で発火するスキルが複数あるため、場面ごとに 1 つに決めている。スキル側に「必ず使う」と書かれていても、この表を優先する。

| 場面 | 使う | 使わない |
|---|---|---|
| issue に着手し、どう作るかを詰める | `/grill-with-docs` の作法 → Plan モード。ユーザーが打っていなければ、中身の `grilling` と `domain-modeling` を呼ぶ | `superpowers:brainstorming`、`superpowers:writing-plans` |
| TDD | ユーザースキルの `tdd` | `superpowers:test-driven-development` |
| デバッグ | ユーザースキルの `diagnosing-bugs` | `superpowers:systematic-debugging` |
| 手元のレビュー | ユーザースキルの `code-review`（規約と仕様の 2 観点） | `coderabbit:code-review`、`superpowers:requesting-code-review` |
| UI のレビュー（アクセシビリティ・操作性） | `web-design-guidelines`。速さを見るときは `vercel-react-best-practices` | — |
| 完了を宣言する前 | `superpowers:verification-before-completion` | — |
| PR の説明文を書く | ユーザースキルの `pr`（Summary / Evidence / Merge Danger の 3 節）。`.github/pull_request_template.md` は置かず、形はこのスキルに一本化する | — |

設計文書（spec・計画書）はリポジトリに残さない。計画は Plan モードで使い捨てにし、残すのは ADR と PR の説明文だけにする（[ADR 0003](docs/adr/0003-issue-lifecycle-and-refinement-depth.md)）。

## 読むもの

- issue を登録する・詰める・着手する順を動かすとき → `docs/adr/` の 0001〜0004
- 店・系譜・系統・記録・提案などの言葉を issue・画面・コードで使うとき → `CONTEXT.md`
- 要件 ID（F-01〜）、画面 ID（S-01〜、M-01〜）、文言 ID（T-01〜）、提案ルールの正を確かめるとき → `docs/spec/` の企画・要件定義書と基本設計書（外部設計）。2026-10-08 の凍結版で、当時からの変更点は ADR 0004
- 構成と店舗データの編集方法を知りたいとき → `CONTRIBUTING.md` の「主要ファイル」と「店舗データの編集」

## コマンド

PR の前に `npm test`、`npm run lint`、`npm run build` を通す。この 3 つは main の必須チェック（CI）と同じ。

PR を作るのは「PR を出して」と頼まれたときだけ。「実施して」「進めて」はコミットまでで止め、PR を出すかを聞く。
