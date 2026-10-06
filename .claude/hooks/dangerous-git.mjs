// Claude Code の PreToolUse hook が使う判定。破壊的な git コマンドを実行前に止める。
// 設定は .claude/settings.json。止められたコマンドが必要なときは、自分のターミナルか
// Claude Code の入力欄の `! <コマンド>` で実行する。
//
// 止めるもの:
//   force push、main への直 push、git reset --hard、git clean -f、git branch -D、
//   git checkout . / git restore .
//   判定の途中で失敗したときも、素通しにせず止める。
//
// 事故の防止が目的で、回避の防止ではない。次のものは見ない:
//   引用符で囲んだ引数（git push origin "main"）や sh -c "..." の中身、heredoc の本文、
//   パス付きの /usr/bin/git、git push --all / --mirror、ブランチの削除（git push origin --delete）

/** 引用符で囲まれた部分を空にする。コミットメッセージや PR 本文の中身で止めないため */
function stripQuoted(command) {
  return command.replace(/'[^']*'|"(?:[^"\\]|\\.)*"/g, '""');
}

/** 出力のリダイレクト（>/dev/null、2>&1、&>log など）を取り除く。引数に密着していても、引数として数えないため */
function stripRedirects(command) {
  return command.replace(/(?:\d+|&)?>{1,2}(?:&\d+|&-|\s*[^\s;&|()<>]+)?/g, " ");
}

/** git の全体オプションのうち、次の語を値として取るもの */
const GLOBAL_OPTIONS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace"]);

/** 行末の \ による行継続を 1 行につなぐ */
function joinContinuedLines(command) {
  return command.replace(/\\\r?\n/g, " ");
}

/** heredoc の本文を取り除く。開始行の残り（<<EOF の後ろ）は残す */
function stripHeredocBodies(command) {
  return command.replace(
    /(?<!<)<<(?!<)-?[ \t]*(["']?)(\w+)\1([^\n]*)\n(?:[\s\S]*?\n)?[ \t]*\2[ \t]*(?=\n|$)/g,
    "$3",
  );
}

/**
 * コマンドとして読む部分だけを残す。heredoc の本文、引用符の中、リダイレクトを除く。
 * heredoc を先に除くのは、本文中のアポストロフィが引用符の対応を狂わせるため
 */
function commandText(command) {
  return stripRedirects(stripQuoted(stripHeredocBodies(joinContinuedLines(command))));
}

/**
 * コマンド文字列から git の呼び出しを { sub, args, dirs } の配列で取り出す。
 * dirs は、その git が動く場所を変える指定（先行する cd と git -C）を書かれた順に並べたもの
 */
function gitInvocations(command) {
  const invocations = [];
  const cdDirs = [];
  for (const segment of commandText(command).split(/&&|\|\||[;&|\n()`]/)) {
    const tokens = segment.trim().split(/\s+/);
    if (tokens[0] === "cd" && tokens[1]) cdDirs.push(tokens[1]);
    let i = tokens.indexOf("git");
    if (i === -1) continue;
    i += 1;
    const dirs = [...cdDirs];
    while (i < tokens.length && tokens[i].startsWith("-")) {
      if (tokens[i] === "-C" && tokens[i + 1]) dirs.push(tokens[i + 1]);
      i += GLOBAL_OPTIONS_WITH_VALUE.has(tokens[i]) ? 2 : 1;
    }
    if (i < tokens.length) invocations.push({ sub: tokens[i], args: tokens.slice(i + 1), dirs });
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
    .map((d) => (d === "HEAD" || d === "@" ? currentBranch : d.replace(/^refs\/heads\//, "")))
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
 * cd や git -C で場所を変えた git には、branchIn(dirs) が返すその場所のブランチを使う。
 */
export function findDangerousGit(command, currentBranch, branchIn = () => currentBranch) {
  for (const invocation of gitInvocations(command)) {
    const branch = invocation.dirs.length > 0 ? branchIn(invocation.dirs) : currentBranch;
    const reason = reasonFor(invocation, branch);
    if (reason) return reason;
  }
  return null;
}
