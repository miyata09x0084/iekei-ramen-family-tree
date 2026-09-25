# ADR 0001: issue の優先順位を GitHub Project で管理し、登録直後は Inbox に置く

- 日付: 2026-09-25
- 状態: 採択（決定 3 の自動追加の方式は [ADR 0002](0002-auto-add-with-builtin-project-workflow.md) で変更）

## 背景

open issue が 22 件になり、どれから着手するかを毎回会話の中で決め直していた。優先順位の結論は `data/*-priorities.md` のようなローカルメモに残していたが、git 管理外で、issue 一覧からも辿れず、数日で古くなっていた。

このプロジェクトは趣味のサイドプロジェクトで、定期作業・返信・締め切りを生む仕組みは作らない方針（目標は「家系ファンの定番の参照先」になること）。優先順位の置き場所も、更新が義務にならない形が必要だった。

## 決定

1. **優先順位の正は GitHub Project「iekei-ramen-family-tree ロードマップ」**（https://github.com/users/miyata09x0084/projects/3 ）とする。ローカルメモは補助であり、食い違ったら Project が正。
2. **Status 列は 6 つ**: Inbox / 着手する順 / 今日 20 分で整理 / 数字待ち / someday / Done。
   - 着手する順は **常に 5 件まで**。6 件目を入れるなら 1 件を someday に落とす。
   - 「優先順」数値フィールドで着手する順の中の順番を持つ。列に入れた時点で末尾番号を付け、並び替えたときだけ振り直す。
3. **新規 issue は GitHub Actions で自動的に Project に追加し、Status を Inbox にする**（`.github/workflows/add-to-project.yml`）。登録時に人が判断することはない。
4. **トリアージは「次に触るとき」に行う**。定期日は設けない。振り分けの基準は次の 2 軸。
   - 作った後の手間が増える、または楽しくない → someday か close
   - 数字を見ないと決められない → 数字待ち（しきい値と判定日を本文に書く。書けないなら someday）
   - やる価値がある → 「ねらい / やること / やらないこと / 完了条件」に書き直し、ラベルを `idea` から `enhancement` + `P1` に変えてから着手する順に入れる
5. **`idea` ラベルのままの issue は着手する順に入れない**。書き直しが着手の入場券。
6. **ラベルは 2 段階**: `P1` = 着手する順、それ以外 = someday。P2 / P3 は使わない。

## 検討した代替案

| 案 | 見送った理由 |
|---|---|
| pinned issue にチェックリストで書く | 順位の入れ替えが本文編集になり、列の移動より重い。自動追加もできない |
| `data/*-priorities.md` を git 管理に入れる | issue 一覧から辿れず、更新を忘れて古くなる実績があった |
| README にロードマップ節を足す | 訪問者向けページに開発者向けの細かい順位が混ざる |
| Project の内蔵ワークフロー「Item added to project → Status」だけで済ませる | ユーザー所有 Project への自動追加（auto-add）が内蔵では使えず、結局 Actions が要る。Status 設定も Actions 側に寄せた方が設定が 1 か所で済む |
| Milestone や期限で管理する | 締め切りが義務感を生み、趣味プロジェクトの方針に反する |

## 結果

- 登録は雑でよくなる（1 行で issue を切れば Inbox に入る）。判断は着手する順に入れる 1 回だけ。
- 手作業として残るのは「Inbox を見て振り分ける」のみ。
- Actions からユーザー所有 Project を操作するには `GITHUB_TOKEN` では権限が足りないため、`project` スコープ付きの classic PAT を repo secret `ADD_TO_PROJECT_PAT` に登録する必要がある。PAT の有効期限が切れると自動追加が止まるので、止まっていたら手で Project に追加する（止まっても issue 自体は失われない）。
- Project の Status オプションを API（`updateProjectV2Field`）で書き換えるとオプション ID が振り直され、既存アイテムの Status が消える。列を増減するときは Web UI から行うか、書き換え後に全アイテムの Status を再設定する。
