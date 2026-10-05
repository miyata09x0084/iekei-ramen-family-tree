import { describe, expect, it } from "vitest";
import { EDGE_LABEL } from "@/data/shops";
import { disciplesOf, generationLabel, masterOf, relationLabel } from "@/lib/relations";
import { FIXTURE, pick } from "@/lib/shops.fixture";

const root = pick((s) => s.lineage === "root", "総本山");
const capital = pick((s) => s.lineage === "capital", "資本系");
const branch = pick((s) => s.lineage === "honmoku" && s.parent === root.id, "系統の分岐点");
const grandchild = pick((s) => s.parent === branch.id, "分岐点の弟子");

describe("masterOf: 師匠", () => {
  it("師匠の店を返す", () => {
    expect(masterOf(grandchild, FIXTURE)?.id).toBe(branch.id);
  });
  it("総本山と資本系は師匠を持たない", () => {
    expect(masterOf(root, FIXTURE)).toBeNull();
    expect(masterOf(capital, FIXTURE)).toBeNull();
  });
  it("師匠の id が一覧にないときは null（例外にしない）", () => {
    expect(masterOf({ ...grandchild, parent: "no-such-shop" }, FIXTURE)).toBeNull();
  });
});

describe("disciplesOf: 弟子", () => {
  it("同じ師匠を持つ店を創業年の昇順で返す（配列上の順序に依らない）", () => {
    const kids = disciplesOf(root, FIXTURE);
    expect(kids.length).toBeGreaterThan(1);
    expect(kids.every((k) => k.parent === root.id)).toBe(true);
    expect(kids.map((k) => k.founded)).toEqual([...kids.map((k) => k.founded)].sort((a, b) => a - b));
    // fixture は兄弟を創業年の降順で並べているので、並び替えを外すとこのテストが落ちる
    expect(FIXTURE.filter((s) => s.parent === root.id).map((k) => k.id)).not.toEqual(kids.map((k) => k.id));
  });
  it("弟子がいない店は空", () => {
    expect(disciplesOf(capital, FIXTURE)).toEqual([]);
  });
});

describe("generationLabel: 世代の文言", () => {
  it("総本山は初代、以降は第 n 世代（gen + 1）", () => {
    expect(generationLabel(0)).toBe("初代（総本山。すべての始まりのお店）");
    expect(generationLabel(1)).toBe("第2世代");
    expect(generationLabel(4)).toBe("第5世代");
  });
  it("資本系（gen が null）は世代なし", () => {
    expect(generationLabel(null)).toBe("なし（修行のつながりがないお店）");
  });
});

describe("relationLabel: 関係の文言", () => {
  it("師匠との関係があれば EDGE_LABEL の文言", () => {
    expect(relationLabel(pick((s) => s.edge === "direct", "直系"))).toBe(EDGE_LABEL.direct);
    expect(relationLabel(pick((s) => s.edge === "former", "元直系"))).toBe(EDGE_LABEL.former);
    expect(relationLabel(pick((s) => s.edge === "disputed", "諸説あり"))).toBe(EDGE_LABEL.disputed);
  });
  it("資本系は会社が開いたお店、総本山は始まりのお店", () => {
    expect(relationLabel(capital)).toBe("会社が開いたお店（修行のつながりはない）");
    expect(relationLabel(root)).toBe("始まりのお店（師匠はいない）");
  });
});
