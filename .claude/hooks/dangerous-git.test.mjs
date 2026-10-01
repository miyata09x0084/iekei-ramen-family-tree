import { describe, expect, it } from "vitest";
import { findDangerousGit } from "./dangerous-git.mjs";

const BRANCH = "chore/48-git-guardrails";

describe("findDangerousGit: 作業ツリーやブランチを消すコマンドを止める", () => {
  it.each([
    ["git reset --hard", "reset --hard"],
    ["git reset --hard HEAD~1", "reset --hard"],
    ["git clean -f", "clean"],
    ["git clean -fd", "clean"],
    ["git clean -xdf", "clean"],
    ["git clean --force", "clean"],
    ["git branch -D feat/19-web-analytics", "branch -D"],
    ["git branch --delete --force feat/19-web-analytics", "branch -D"],
    ["git checkout .", "checkout ."],
    ["git checkout -- .", "checkout ."],
    ["git checkout main -- .", "checkout ."],
    ["git restore .", "restore ."],
    ["git restore --staged --worktree .", "restore ."],
  ])("%s", (command, word) => {
    expect(findDangerousGit(command, BRANCH)).toContain(word);
  });
});

describe("findDangerousGit: force push を止める", () => {
  it.each([
    "git push --force",
    "git push -f origin chore/48-git-guardrails",
    "git push origin chore/48-git-guardrails --force-with-lease",
    "git push --force-with-lease=chore/48-git-guardrails origin chore/48-git-guardrails",
    "git push --force-if-includes origin chore/48-git-guardrails",
    "git push origin +chore/48-git-guardrails",
  ])("%s", (command) => {
    expect(findDangerousGit(command, BRANCH)).toContain("force push");
  });
});

describe("findDangerousGit: main への直 push を止める", () => {
  it.each([
    "git push origin main",
    "git push -u origin main",
    "git push origin HEAD:main",
    "git push origin chore/48-git-guardrails:main",
    "git push origin refs/heads/main",
  ])("%s", (command) => {
    expect(findDangerousGit(command, BRANCH)).toContain("main");
  });

  it.each(["git push", "git push origin", "git push origin HEAD", "git push origin 2>&1", "git push origin @"])(
    "今のブランチが main のときの %s",
    (command) => {
      expect(findDangerousGit(command, "main")).toContain("main");
    },
  );
});

describe("findDangerousGit: 別の場所で打つ git push は、その場所のブランチで判定する", () => {
  // 今いる場所は作業ブランチで、../main-tree は main にいる
  const branchIn = (dirs) => (dirs.at(-1) === "../main-tree" ? "main" : BRANCH);

  it.each([
    "cd ../main-tree && git push",
    "cd ../main-tree\ngit push origin HEAD",
    "git -C ../main-tree push",
  ])("%s", (command) => {
    expect(findDangerousGit(command, BRANCH, branchIn)).toContain("main");
  });

  it("移動先が作業ブランチなら通す", () => {
    expect(findDangerousGit("cd ../other-tree && git push", BRANCH, branchIn)).toBeNull();
  });
});

describe("findDangerousGit: 前後に別のコマンドや全体オプションがあっても止める", () => {
  it.each([
    "git add -A && git reset --hard",
    "git status; git clean -fd",
    "git -C ../other reset --hard",
    "git -c core.editor=true reset --hard",
    "cd src\ngit checkout .",
    "git status & git reset --hard",
    "git reset --hard>/dev/null",
    "git reset \\\n  --hard",
    "cat > n.md <<'EOF'\ndon't\nEOF\ngit reset --hard && echo 'done'",
  ])("%s", (command) => {
    expect(findDangerousGit(command, BRANCH)).not.toBeNull();
  });
});

describe("findDangerousGit: 通すコマンド", () => {
  it.each([
    "git push",
    "git push -u origin chore/48-git-guardrails",
    "git push origin HEAD",
    "git push origin fix/main-menu",
    "git status",
    "git commit -m \"#48 git reset --hard と git push --force を止める\"",
    "git commit -m 'git clean -fd を止める'",
    "git reset --soft HEAD~1",
    "git reset HEAD README.md",
    "git clean -n",
    "git branch -d feat/19-web-analytics",
    "git checkout main",
    "git checkout -b fix/x",
    "git checkout -- README.md",
    "git restore README.md",
    "git restore --staged .",
    "npm test",
    "gh pr create --title \"x\" --body \"git push origin main はしない\"",
  ])("%s", (command) => {
    expect(findDangerousGit(command, BRANCH)).toBeNull();
  });

  it("heredoc の本文に書かれたコマンドでは止めない", () => {
    const command = "cat > notes.md <<'EOF'\ngit reset --hard は危険\nEOF";
    expect(findDangerousGit(command, BRANCH)).toBeNull();
  });

  it("複数行の引用符の中に書かれたコマンドでは止めない", () => {
    const command = 'git commit -m "$(cat <<\'EOF\'\n#48 hook を追加\n\ngit reset --hard を止める\nEOF\n)"';
    expect(findDangerousGit(command, BRANCH)).toBeNull();
  });
});
