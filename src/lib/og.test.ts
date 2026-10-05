import { describe, expect, it } from "vitest";
import { computeLayout } from "@/lib/layout";
import { silhouette } from "@/lib/og";
import { FIXTURE, pick } from "@/lib/shops.fixture";

const layout = computeLayout(FIXTURE);
const inTree = FIXTURE.filter((s) => s.lineage !== "capital");

describe("silhouette: 影絵の座標", () => {
  const box = { width: 1000, height: 300, pad: 20 };
  const s = silhouette(layout, box);
  const at = (id: string) => s.marks.find((m) => m.id === id)!;

  it("系譜に属する店だけを描き、資本系は含めない", () => {
    expect(s.marks.map((m) => m.id)).toEqual(inTree.map((x) => x.id));
  });

  it("枠の幅と高さを両方使い切る（縦横比は保たない）", () => {
    const xs = s.marks.map((m) => m.x), ys = s.marks.map((m) => m.y);
    expect(Math.min(...xs)).toBeCloseTo(box.pad);
    expect(Math.max(...xs)).toBeCloseTo(box.width - box.pad);
    expect(Math.min(...ys)).toBeCloseTo(box.pad);
    expect(Math.max(...ys)).toBeCloseTo(box.height - box.pad);
  });

  it("師匠と弟子の上下、兄弟の左右の並びは系図のまま", () => {
    const child = pick((x) => x.parent !== null, "弟子");
    expect(at(child.id).y).toBeGreaterThan(at(child.parent!).y);
    const before = layout.nodes.filter((n) => n.gen === 1).sort((a, b) => a.x - b.x).map((n) => n.id);
    const after = [...s.marks].filter((m) => before.includes(m.id)).sort((a, b) => a.x - b.x).map((m) => m.id);
    expect(after).toEqual(before);
  });

  it("弟子ごとに降り線が 1 本あり、弟子の丸印に届く。師匠の丸印からは幹が出る", () => {
    const disciples = inTree.filter((x) => x.parent !== null);
    const drops = s.lines.filter((l) => l.kind === "drop");
    expect(drops.map((l) => l.id).sort()).toEqual(disciples.map((x) => x.id).sort());
    drops.forEach((l) => {
      const mc = at(l.id), mp = at(disciples.find((x) => x.id === l.id)!.parent!);
      expect([l.x1, l.x2]).toEqual([mc.x, mc.x]);
      expect(l.y2).toBe(mc.y); // 丸印の中心まで引き、丸印を上に重ねて隠す
      expect(l.y1).toBeGreaterThan(mp.y);
      expect(l.y1).toBeLessThan(mc.y);
      // 師匠の丸印から降り線の始まる高さまで幹が通り、その高さの横棒が師匠と弟子の x をまたぐ
      const buses = s.lines.filter((b) => b.kind === "bus");
      expect(buses.some((b) => b.x1 === mp.x && b.x2 === mp.x && b.y1 === mp.y && b.y2 === l.y1)).toBe(true);
      expect(buses.some((b) => b.y1 === l.y1 && b.y2 === l.y1 && b.x1 <= Math.min(mp.x, mc.x) && b.x2 >= Math.max(mp.x, mc.x))).toBe(true);
    });
  });

  it("系線の端点も枠内に収まる", () => {
    const inBox = (x: number, y: number) => x >= 0 && x <= box.width && y >= 0 && y <= box.height;
    expect(s.lines.length).toBeGreaterThan(0);
    s.lines.forEach((l) => {
      expect(inBox(l.x1, l.y1)).toBe(true);
      expect(inBox(l.x2, l.y2)).toBe(true);
    });
  });

  it("降り線は弟子の系統と関係を持ち、幹と横棒は持たない", () => {
    // FIXTURE に「影響を受けて開いたお店」は無いので、ここだけ 1 店足す
    const inspired = { ...pick((x) => x.edge === "trained", "修行・独立"), id: "eikyo", edge: "inspired" as const };
    const lines = silhouette(computeLayout([...FIXTURE, inspired]), box).lines;
    const drop = (id: string) => lines.find((l) => l.kind === "drop" && l.id === id)!;
    const disputed = pick((x) => x.edge === "disputed", "諸説あり");
    expect(drop(disputed.id)).toMatchObject({ edge: "disputed", lineage: disputed.lineage });
    expect(drop(inspired.id)).toMatchObject({ edge: "inspired", lineage: inspired.lineage });
    lines.filter((l) => l.kind === "bus").forEach((l) => expect(l).toMatchObject({ edge: null, lineage: null }));
  });
});
