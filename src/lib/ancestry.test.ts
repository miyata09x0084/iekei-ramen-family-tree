import { describe, expect, it } from "vitest";
import { ancestry, matches, normalizeQuery, type FilterState } from "@/lib/ancestry";
import { FIXTURE, FIXTURE_BY_ID, pick } from "@/lib/shops.fixture";

const root = pick((s) => s.lineage === "root", "総本山");
const capital = pick((s) => s.lineage === "capital", "資本系");
const branch = pick((s) => s.lineage === "honmoku" && s.parent === root.id, "系統の分岐点");
const grandchild = pick((s) => s.parent === branch.id, "分岐点の弟子");

const empty = (over: Partial<FilterState> = {}): FilterState =>
  ({ lineages: new Set(), prefs: new Set(), year: 9999, query: "", ...over });

describe("ancestry: 総本山までの系譜", () => {
  it("自身を含み、師匠をたどって総本山で終わる", () => {
    expect([...ancestry(grandchild.id, FIXTURE_BY_ID)]).toEqual([grandchild.id, branch.id, root.id]);
  });
  it("総本山は自身だけ", () => {
    expect([...ancestry(root.id, FIXTURE_BY_ID)]).toEqual([root.id]);
  });
  it("資本系は師匠を持たないので自身だけ", () => {
    expect([...ancestry(capital.id, FIXTURE_BY_ID)]).toEqual([capital.id]);
  });
  it("知らない id は空", () => {
    expect(ancestry("no-such-shop", FIXTURE_BY_ID).size).toBe(0);
  });
});

describe("matches: 絞り込み", () => {
  it("何も指定しなければ全店に一致する", () => {
    expect(FIXTURE.every((s) => matches(s, empty()))).toBe(true);
  });
  it("系統で絞ると、その系統の店だけ一致する", () => {
    const f = empty({ lineages: new Set(["honmoku"]) });
    expect(FIXTURE.filter((s) => matches(s, f)).map((s) => s.lineage)).toEqual(
      FIXTURE.filter((s) => s.lineage === "honmoku").map(() => "honmoku"),
    );
  });
  it("都県で絞ると、その都県の店だけ一致する", () => {
    const f = empty({ prefs: new Set([root.pref]) });
    expect(FIXTURE.filter((s) => matches(s, f)).every((s) => s.pref === root.pref)).toBe(true);
    expect(FIXTURE.filter((s) => matches(s, f)).length).toBe(FIXTURE.filter((s) => s.pref === root.pref).length);
  });
  it("検索語は屋号・補足・市区のいずれかに部分一致すればよい", () => {
    expect(matches(root, empty({ query: root.name.slice(0, 2) }))).toBe(true);
    expect(matches(root, empty({ query: root.city.slice(0, 2) }))).toBe(true);
    expect(matches(root, empty({ query: "該当しない語" }))).toBe(false);
  });
  it("系統と都県は両方満たす必要がある", () => {
    const f = empty({ lineages: new Set([branch.lineage]), prefs: new Set([branch.pref]) });
    expect(matches(branch, f)).toBe(true);
    const other = FIXTURE.find((s) => s.lineage !== branch.lineage);
    expect(other && matches(other, f)).toBe(false);
  });
  it("年は matches では見ない（表示状態の判定で扱う）", () => {
    expect(matches(grandchild, empty({ year: 0 }))).toBe(true);
  });
});

describe("normalizeQuery: 検索語の正規化", () => {
  it("前後の空白を落とす", () => {
    expect(normalizeQuery("  吉村家 ")).toBe("吉村家");
  });
  it("屋号と補足の間の空白（全角・半角・複数）も落とす", () => {
    expect(normalizeQuery("吉村家 横浜駅西口")).toBe("吉村家横浜駅西口");
    expect(normalizeQuery("吉村家　横浜駅西口")).toBe("吉村家横浜駅西口");
    expect(normalizeQuery("吉村家  \t横浜")).toBe("吉村家横浜");
  });
  it("空文字は空文字のまま", () => {
    expect(normalizeQuery("   ")).toBe("");
  });
});
