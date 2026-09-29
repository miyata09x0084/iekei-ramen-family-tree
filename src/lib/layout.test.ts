import { describe, expect, it } from "vitest";
import { computeLayout } from "@/lib/layout";
import { ancestry } from "@/lib/ancestry";
import { FIXTURE, FIXTURE_BY_ID, pick } from "@/lib/shops.fixture";

const layout = computeLayout(FIXTURE);
const root = pick((s) => s.lineage === "root", "総本山");
const inTree = FIXTURE.filter((s) => s.lineage !== "capital");
const capitals = FIXTURE.filter((s) => s.lineage === "capital");
const placed = new Map(layout.nodes.map((n) => [n.id, n]));

describe("computeLayout: 系図の配置", () => {
  it("全店に座標が付き、入力と同じ順で返る", () => {
    expect(layout.nodes.map((n) => n.id)).toEqual(FIXTURE.map((s) => s.id));
    layout.nodes.forEach((n) => { expect(Number.isFinite(n.x)).toBe(true); expect(Number.isFinite(n.y)).toBe(true); });
  });
  it("root は総本山", () => {
    expect(layout.root.id).toBe(root.id);
  });
  it("世代 gen は系譜の長さ − 1（総本山が 0）", () => {
    inTree.forEach((s) => expect(placed.get(s.id)!.gen).toBe(ancestry(s.id, FIXTURE_BY_ID).size - 1));
  });
  it("generations は最大世代 + 1", () => {
    const maxGen = Math.max(...inTree.map((s) => placed.get(s.id)!.gen!));
    expect(layout.generations).toBe(maxGen + 1);
  });
  it("世代が深いほど y が大きい（下に描かれる）", () => {
    inTree.filter((s) => s.parent).forEach((s) => {
      expect(placed.get(s.id)!.y).toBeGreaterThan(placed.get(s.parent!)!.y);
    });
  });
  it("資本系は gen が null で、木のどの店よりも右に置かれる", () => {
    const maxX = Math.max(...inTree.map((s) => placed.get(s.id)!.x));
    expect(layout.capitals.map((c) => c.id)).toEqual(capitals.map((c) => c.id));
    layout.capitals.forEach((c) => { expect(c.gen).toBeNull(); expect(c.x).toBeGreaterThan(maxX); });
  });
  it("同じ師匠を持つ兄弟は創業年の昇順に左から並ぶ", () => {
    const byParent = new Map<string, typeof inTree>();
    inTree.filter((s) => s.parent).forEach((s) => byParent.set(s.parent!, [...(byParent.get(s.parent!) ?? []), s]));
    let checkedSiblings = 0;
    byParent.forEach((sibs) => {
      if (sibs.length < 2) return;
      checkedSiblings++;
      const sorted = [...sibs].sort((a, b) => a.founded - b.founded);
      const xs = sorted.map((s) => placed.get(s.id)!.x);
      expect(xs).toEqual([...xs].sort((a, b) => a - b));
    });
    expect(checkedSiblings).toBeGreaterThan(0);
  });
  it("系線は「子を持つ店ごとに bus 1 本」と「師匠を持つ店ごとに drop 1 本」", () => {
    const parents = new Set(inTree.filter((s) => s.parent).map((s) => s.parent!));
    expect(layout.links.filter((l) => l.kind === "bus").map((l) => l.parent.id).sort()).toEqual([...parents].sort());
    expect(layout.links.filter((l) => l.kind === "drop").map((l) => l.id).sort())
      .toEqual(inTree.filter((s) => s.parent).map((s) => s.id).sort());
  });
  it("drop 線は師匠と弟子を正しく結ぶ", () => {
    layout.links.filter((l) => l.kind === "drop").forEach((l) => {
      expect(l.parent.id).toBe(FIXTURE_BY_ID.get(l.child.id)!.parent);
    });
  });
});
