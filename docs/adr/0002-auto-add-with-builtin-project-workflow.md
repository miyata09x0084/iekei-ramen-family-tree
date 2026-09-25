# ADR 0002: 新規 issue の自動追加を GitHub Actions から Project の内蔵ワークフローに変更する

- 日付: 2026-09-25
- 状態: 採択（ADR 0001 の決定 3 を置き換える）

## 背景

ADR 0001 では新規 issue を GitHub Actions（`actions/add-to-project`）で Project に追加し、Status を Inbox にしていた。ユーザー所有の Project を Actions から操作するには `project` スコープ付きの PAT が要り、次の問題があった。

- PAT には有効期限がある。切れると自動追加が止まり、更新作業が定期的に発生する。「継続運用を作らない」方針に反する
- 期限なしの classic PAT にすると、`project` と `repo` の広い権限を持つトークンを secret に置き続けることになる
- 実際、secret の登録がこのセッション内の対話入力の制約で空文字になり、初回実行が `Input required and not supplied: github-token` で失敗した。設定の置き場所が増えるほど、この種の事故が起きる

## 決定

1. **Project の内蔵ワークフローで自動追加する**。Project の Workflows 設定で「Auto-add to project」を有効にし、対象リポジトリを `miyata09x0084/iekei-ramen-family-tree`、フィルタを `is:issue is:open` にする。
2. **内蔵ワークフロー「Item added to project」で Status を Inbox にする**。
3. `.github/workflows/add-to-project.yml` と repo secret `ADD_TO_PROJECT_PAT` は削除する。
4. GitHub Actions は #27 のテスト・lint・build（`GITHUB_TOKEN` で完結するもの）にのみ使う。Project 操作のための PAT は今後も置かない。

## 検討した代替案

| 案 | 見送った理由 |
|---|---|
| 期限なしの classic PAT で Actions を続ける | 広い権限のトークンを常設することになる。設定が Actions・secret・Project の 3 か所に分かれる |
| fine-grained PAT（最長 1 年）で Actions を続ける | 年 1 回の更新作業が発生する |
| `/idea` などローカルのスキルから `gh api graphql` で追加する | Web UI やスマホから issue を作ったときに漏れる |

## 結果

- PAT・secret・Actions のいずれにも依存しない。有効期限の概念がなくなる
- 無料プランでは auto-add ワークフローは Project ごとに 1 つまで。このプロジェクトでは 1 つで足りる
- 設定は Project の Web UI にあり、git 管理外になる。設定内容はこの ADR が記録として代わりを務める
- フィルタの対象は issue のみ。PR は Project に入れない
