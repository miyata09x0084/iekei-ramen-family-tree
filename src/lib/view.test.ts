import { describe, expect, it } from "vitest";
import { computeLayout, type Link } from "@/lib/layout";
import { ancestry, type FilterState } from "@/lib/ancestry";
import { isLitLink, linkVisibility, markStyle, visibility } from "@/lib/view";
import { FIXTURE, FIXTURE_BY_ID, pick } from "@/lib/shops.fixture";

const root = pick((s) => s.lineage === "root", "総本山");
const branch = pick((s) => s.lineage === "honmoku" && s.parent === root.id, "系統の分岐点");
const grandchild = pick((s) => s.parent === branch.id, "分岐点の弟子");
const layout = computeLayout(FIXTURE);
const drop = (childId: string) => layout.links.find((l): l is Extract<Link, { kind: "drop" }> => l.kind === "drop" && l.id === childId)!;
const bus = (parentId: string) => layout.links.find((l): l is Extract<Link, { kind: "bus" }> => l.kind === "bus" && l.parent.id === parentId)!;
const empty = (over: Partial<FilterState> = {}): FilterState =>
  ({ lineages: new Set(), prefs: new Set(), year: 9999, query: "", ...over });

describe("markStyle: 丸印の見た目", () => {
  it("直系は実線の輪、元直系は点線の輪、それ以外は輪なし", () => {
    expect(markStyle(pick((s) => s.edge === "direct", "直系")).ring).toBe("solid");
    expect(markStyle(pick((s) => s.edge === "former", "元直系")).ring).toBe("dashed");
    expect(markStyle(pick((s) => s.edge === "trained", "修行・独立")).ring).toBeNull();
    expect(markStyle(pick((s) => s.edge === "disputed", "諸説あり")).ring).toBeNull();
    expect(markStyle(root).ring).toBeNull();
  });
  it("営業中だけ塗りつぶす。閉店と本店閉店は白抜き", () => {
    expect(markStyle(pick((s) => s.status === "open", "営業中")).filled).toBe(true);
    expect(markStyle(pick((s) => s.status === "closed", "閉店")).filled).toBe(false);
    expect(markStyle(pick((s) => s.status === "main-closed", "本店閉店")).filled).toBe(false);
  });
});

describe("isLitLink: ホバーで光る系線", () => {
  const lit = ancestry(grandchild.id, FIXTURE_BY_ID);
  it("系譜上の弟子へ降りる drop 線は光る", () => {
    expect(isLitLink(drop(grandchild.id), lit)).toBe(true);
    expect(isLitLink(drop(branch.id), lit)).toBe(true);
  });
  it("系譜に含まれない店への drop 線は光らない", () => {
    const other = pick((s) => s.parent === root.id && s.id !== branch.id, "総本山の別の弟子");
    expect(isLitLink(drop(other.id), lit)).toBe(false);
  });
  it("bus 線は師匠が光り、かつ弟子のどれかが光っていれば光る", () => {
    expect(isLitLink(bus(root.id), lit)).toBe(true);
    expect(isLitLink(bus(branch.id), lit)).toBe(true);
    expect(isLitLink(bus(root.id), new Set([root.id]))).toBe(false);
  });
});

describe("visibility: 年と絞り込みによる店の表示状態", () => {
  it("表示年より後に創業した店は hidden。同年は表示する", () => {
    const v = visibility(FIXTURE, empty({ year: branch.founded }));
    expect(v.hidden.has(branch.id)).toBe(false);
    expect(v.hidden.has(grandchild.id)).toBe(grandchild.founded > branch.founded);
    FIXTURE.forEach((s) => expect(v.hidden.has(s.id)).toBe(s.founded > branch.founded));
  });
  it("絞り込みに合わない店は dim。hidden の店は dim にしない", () => {
    const v = visibility(FIXTURE, empty({ lineages: new Set(["honmoku"]), year: branch.founded }));
    expect(v.dim.has(root.id)).toBe(true);
    expect(v.dim.has(branch.id)).toBe(false);
    FIXTURE.forEach((s) => expect(v.hidden.has(s.id) && v.dim.has(s.id)).toBe(false));
  });
  it("何も絞らず最終年なら hidden も dim も空", () => {
    const v = visibility(FIXTURE, empty());
    expect(v.hidden.size).toBe(0);
    expect(v.dim.size).toBe(0);
  });
});

describe("linkVisibility: 系線の表示状態", () => {
  const none = { hidden: new Set<string>(), dim: new Set<string>() };
  it("何も隠れていなければ future も dim も false", () => {
    layout.links.forEach((l) => expect(linkVisibility(l, none)).toEqual({ future: false, dim: false }));
  });
  it("drop 線は弟子が hidden なら future", () => {
    expect(linkVisibility(drop(grandchild.id), { ...none, hidden: new Set([grandchild.id]) }).future).toBe(true);
    expect(linkVisibility(drop(branch.id), { ...none, hidden: new Set([grandchild.id]) }).future).toBe(false);
  });
  it("drop 線は弟子と師匠の両方が dim のときだけ dim", () => {
    expect(linkVisibility(drop(grandchild.id), { ...none, dim: new Set([grandchild.id, branch.id]) }).dim).toBe(true);
    expect(linkVisibility(drop(grandchild.id), { ...none, dim: new Set([grandchild.id]) }).dim).toBe(false);
  });
  it("bus 線は全弟子が hidden のときだけ future", () => {
    const kids = FIXTURE.filter((s) => s.parent === root.id).map((s) => s.id);
    expect(kids.length).toBeGreaterThan(1);
    expect(linkVisibility(bus(root.id), { ...none, hidden: new Set(kids) }).future).toBe(true);
    expect(linkVisibility(bus(root.id), { ...none, hidden: new Set([kids[0]]) }).future).toBe(false);
  });
  it("bus 線は全弟子が dim のときだけ dim", () => {
    const kids = FIXTURE.filter((s) => s.parent === root.id).map((s) => s.id);
    expect(linkVisibility(bus(root.id), { ...none, dim: new Set(kids) }).dim).toBe(true);
    expect(linkVisibility(bus(root.id), { ...none, dim: new Set([kids[0]]) }).dim).toBe(false);
  });
});
