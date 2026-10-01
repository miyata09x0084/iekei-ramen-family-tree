// Claude Code の PreToolUse hook が使う判定。事故の防止が目的で、回避の防止ではない。
// 引用符の中に書かれたコマンド（bash -c "git reset --hard" など）は見ない。

/** 引用符で囲まれた部分を空にする。コミットメッセージや PR 本文の中身で止めないため */
function stripQuoted(command) {
  return command.replace(/'[^']*'|"(?:[^"\\]|\\.)*"/g, '""');
}

/** git の全体オプションのうち、次の語を値として取るもの */
const GLOBAL_OPTIONS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace"]);

/** コマンド文字列から git の呼び出しを { sub, args } の配列で取り出す */
function gitInvocations(command) {
  const invocations = [];
  for (const segment of stripQuoted(command).split(/&&|\|\||[;|\n()`]/)) {
    const tokens = segment.trim().split(/\s+/);
    let i = tokens.indexOf("git");
    if (i === -1) continue;
    i += 1;
    while (i < tokens.length && tokens[i].startsWith("-")) {
      i += GLOBAL_OPTIONS_WITH_VALUE.has(tokens[i]) ? 2 : 1;
    }
    if (i < tokens.length) invocations.push({ sub: tokens[i], args: tokens.slice(i + 1) });
  }
  return invocations;
}

/** -f や -xdf のように、短いフラグのまとまりに指定の 1 文字が含まれるか */
function hasShortFlag(args, letter) {
  return args.some((a) => /^-[A-Za-z]+$/.test(a) && a.includes(letter));
}

/** フラグと -- を除いた引数 */
function positionals(args) {
  return args.filter((a) => !a.startsWith("-"));
}

/** git push を止める理由。止めないなら null */
function pushReason(args, currentBranch) {
  const [, ...refspecs] = positionals(args);
  const forced =
    args.some((a) => /^--force(-with-lease|-if-includes)?(=.*)?$/.test(a)) ||
    hasShortFlag(args, "f") ||
    refspecs.some((r) => r.startsWith("+"));
  if (forced) return "force push はリモートの履歴を書き換えます";

  // refspec がなければ今のブランチが行き先になる。src:dst なら dst を見る
  const destinations = refspecs.length === 0 ? ["HEAD"] : refspecs.map((r) => r.split(":").pop());
  const toMain = destinations
    .map((d) => (d === "HEAD" ? currentBranch : d.replace(/^refs\/heads\//, "")))
    .includes("main");
  return toMain ? "main への直 push はできません。作業ブランチから PR を作ってください" : null;
}

/** 1 つの git 呼び出しを止める理由。止めないなら null */
function reasonFor({ sub, args }, currentBranch) {
  switch (sub) {
    case "push":
      return pushReason(args, currentBranch);
    case "reset":
      return args.includes("--hard") ? "git reset --hard は未コミットの変更を消します" : null;
    case "clean":
      return args.includes("--force") || hasShortFlag(args, "f")
        ? "git clean -f は未追跡のファイルを消します"
        : null;
    case "branch": {
      const forcedDelete =
        hasShortFlag(args, "D") ||
        ((args.includes("--delete") || hasShortFlag(args, "d")) &&
          (args.includes("--force") || hasShortFlag(args, "f")));
      return forcedDelete ? "git branch -D は未マージのブランチを消します" : null;
    }
    case "checkout":
    case "restore": {
      // git restore --staged . はステージを外すだけで、作業ツリーは変えない
      const stagedOnly =
        sub === "restore" &&
        (args.includes("--staged") || hasShortFlag(args, "S")) &&
        !(args.includes("--worktree") || hasShortFlag(args, "W"));
      return positionals(args).includes(".") && !stagedOnly
        ? `git ${sub} . は未コミットの変更をまとめて消します`
        : null;
    }
    default:
      return null;
  }
}

/**
 * 止めるべき git コマンドが含まれていれば理由を返す。なければ null。
 * currentBranch は、引数にブランチ名のない git push の行き先を決めるために使う。
 */
export function findDangerousGit(command, currentBranch) {
  for (const invocation of gitInvocations(command)) {
    const reason = reasonFor(invocation, currentBranch);
    if (reason) return reason;
  }
  return null;
}
