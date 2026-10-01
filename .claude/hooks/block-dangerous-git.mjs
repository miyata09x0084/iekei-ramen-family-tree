// PreToolUse hook の入口。stdin で受けた Bash コマンドを判定し、止めるなら終了コード 2 を返す。
// 入力を読めなかったときは、素通しにせず止める。
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { findDangerousGit } from "./dangerous-git.mjs";

function block(reason) {
  console.error(
    `BLOCKED: ${reason}。この hook（.claude/hooks/）はユーザーが設定したものです。` +
      "必要な場合は、ユーザーに「! <コマンド>」で実行してもらってください。",
  );
  process.exit(2);
}

/** 今のブランチ名。取れなければ空文字 */
function currentBranch(cwd) {
  try {
    return execFileSync("git", ["symbolic-ref", "--short", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  block("hook の入力を JSON として読めませんでした");
}

const command = input?.tool_input?.command;
if (typeof command !== "string") block("hook の入力に実行するコマンドがありません");

const reason = findDangerousGit(command, currentBranch(input.cwd));
if (reason) block(reason);
