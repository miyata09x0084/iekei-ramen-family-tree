# 家系ラーメン家系図

趣味のサイドプロジェクト。施策は定期作業・返信・締め切りを生まないものを選ぶ（[ADR 0001](docs/adr/0001-issue-triage-with-github-project.md)）。

## コンセプト

**食べた 1 店から吉村家までの系譜を、出典と確度つきで確かめられる。**

issue を入れるか捨てるか迷ったら、この一文に合うほうを選ぶ。

- 主役の利用者は、家系を 1〜2 店食べて「この店はどこから来たのか」が気になった人
- 「確かめられる」は、どこまで確かかが分かること。諸説ありの区間や、資本系で系譜に属さないことも、出典つきで示せば答えになる
- 入口は 1 店。系図は、その店の系譜を映す地図

やらないこと:

- 数を追わない。足す単位は地域ではなく、1 店の系譜
- 味の評価とおすすめは扱わない
- 反応の数を追わない。うまくいったかは、気になった店の系譜を自分で確かめられたかで判断する

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

- issue を登録する・詰める・着手する順を動かすとき → `docs/adr/` の 0001〜0003
- 店・系譜・系統などの言葉を issue・画面・コードで使うとき → `CONTEXT.md`
- 構成と店舗データの編集方法を知りたいとき → `README.md` の「開発」

## コマンド

PR の前に `npm test`、`npm run lint`、`npm run build` を通す。この 3 つは main の必須チェック（CI）と同じ。
