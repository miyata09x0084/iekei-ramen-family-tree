import { describe, expect, it } from "vitest";
import { computeLayout } from "@/lib/layout";
import { layoutBounds, silhouette } from "@/lib/og";
import { FIXTURE, pick } from "@/lib/shops.fixture";

const layout = computeLayout(FIXTURE);

describe("silhouette: 影絵の座標", () => {
  const box = { width: 1000, height: 300, pad: 20 };
  const s = silhouette(layout, box);
  const inBox = (x: number, y: number) => x >= 0 && x <= box.width && y >= 0 && y <= box.height;

  it("全店の丸印と系線の端点が枠内に収まる", () => {
    expect(s.marks).toHaveLength(FIXTURE.length);
    s.marks.forEach((m) => expect(inBox(m.x, m.y)).toBe(true));
    s.lines.forEach((l) => {
      expect(inBox(l.x1, l.y1)).toBe(true);
      expect(inBox(l.x2, l.y2)).toBe(true);
    });
  });

  it("枠の幅と高さを両方使い切る（縦横比は保たない）", () => {
    const xs = s.marks.map((m) => m.x), ys = s.marks.map((m) => m.y);
    expect(Math.min(...xs)).toBe(box.pad);
    expect(Math.max(...xs)).toBe(box.width - box.pad);
    expect(Math.min(...ys)).toBe(box.pad);
    expect(Math.max(...ys)).toBe(box.height - box.pad);
  });

  it("弟子の丸印は師匠より下にあり、2 店の間に系線が通る", () => {
    const child = pick((x) => x.parent !== null, "弟子");
    const mc = s.marks.find((m) => m.id === child.id)!, mp = s.marks.find((m) => m.id === child.parent)!;
    expect(mc.y).toBeGreaterThan(mp.y);
    const drop = s.lines.find((l) => l.kind === "drop" && l.x1 === mc.x && l.x2 === mc.x)!;
    expect(drop.y1).toBeGreaterThan(mp.y);
    expect(drop.y2).toBeLessThanOrEqual(mc.y); // 丸印の中心まで引き、丸印を上に重ねて隠す
  });

  it("諸説ありの系線は点線、営業中の丸印は塗りつぶし", () => {
    const disputed = pick((x) => x.edge === "disputed", "諸説あり");
    expect(s.lines.find((l) => l.kind === "drop" && l.id === disputed.id)!.dashed).toBe(true);
    const open = pick((x) => x.status === "open" && x.lineage !== "root", "営業中");
    expect(s.marks.find((m) => m.id === open.id)!.filled).toBe(true);
  });
});

describe("layoutBounds: 影絵の描画範囲", () => {
  it("資本系を含む全店の丸印が、余白ぶん内側に収まる", () => {
    const pad = 10;
    const b = layoutBounds(layout, pad);
    layout.nodes.forEach((n) => {
      expect(n.x - pad).toBeGreaterThanOrEqual(b.x);
      expect(n.x + pad).toBeLessThanOrEqual(b.x + b.width);
      expect(n.y - pad).toBeGreaterThanOrEqual(b.y);
      expect(n.y + pad).toBeLessThanOrEqual(b.y + b.height);
    });
  });

  it("余白を広げると、その分だけ四辺が外に出る", () => {
    const narrow = layoutBounds(layout, 0);
    const wide = layoutBounds(layout, 10);
    expect(wide.x).toBe(narrow.x - 10);
    expect(wide.y).toBe(narrow.y - 10);
    expect(wide.width).toBe(narrow.width + 20);
    expect(wide.height).toBe(narrow.height + 20);
  });
});
