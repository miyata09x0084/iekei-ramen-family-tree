import type { LineageKey, Shop } from "@/data/shops";
import type { Layout } from "@/lib/layout";
import { markStyle, type MarkStyle } from "@/lib/view";

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 影絵（系線と丸印だけの系図）を収める矩形。屋号は描かないので丸印の位置だけで決める */
export function layoutBounds(layout: Layout, pad: number): Bounds {
  const xs = layout.nodes.map((n) => n.x);
  const ys = layout.nodes.map((n) => n.y);
  const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export interface SilhouetteBox {
  width: number;
  height: number;
  pad: number; // 丸印の中心から枠の端までの最小距離
}

export interface SilhouetteMark extends MarkStyle {
  id: string;
  x: number;
  y: number;
  lineage: LineageKey;
}

export interface SilhouetteLine {
  kind: "bus" | "drop";
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lineage: LineageKey | null; // bus は師匠の幹なので系統色を持たない
  dashed: boolean;
}

export interface Silhouette {
  marks: SilhouetteMark[];
  lines: SilhouetteLine[];
}

/**
 * 系図の座標を OGP の枠に収める。屋号を描かないので世代間の縦距離は要らず、
 * 縦横を別々に縮めて枠を使い切る（丸印は半径を別に持つので潰れない）。
 * 系線は computeLayout の path 文字列を使わず、丸印の位置から引き直す。
 */
export function silhouette(layout: Layout, box: SilhouetteBox): Silhouette {
  const b = layoutBounds(layout, 0);
  const sx = (box.width - box.pad * 2) / b.width;
  const sy = (box.height - box.pad * 2) / b.height;
  const px = (x: number) => (x - b.x) * sx + box.pad;
  const py = (y: number) => (y - b.y) * sy + box.pad;

  const marks = layout.nodes.map((n) => ({ id: n.id, x: px(n.x), y: py(n.y), lineage: n.lineage, ...markStyle(n) }));

  const lines: SilhouetteLine[] = [];
  layout.links.forEach((l) => {
    if (l.kind === "drop") return; // bus の側で親子まとめて引く
    const p = l.parent, children = l.children;
    const busY = (py(p.y) + py(children[0].y)) / 2; // 横棒は師匠と弟子の中間
    const xs = [p.x, ...children.map((c) => c.x)].map(px);
    lines.push({ kind: "bus", id: l.id, x1: px(p.x), y1: py(p.y), x2: px(p.x), y2: busY, lineage: null, dashed: false });
    lines.push({ kind: "bus", id: `${l.id}:bar`, x1: Math.min(...xs), y1: busY, x2: Math.max(...xs), y2: busY, lineage: null, dashed: false });
    children.forEach((c: Shop & { x: number; y: number }) =>
      lines.push({ kind: "drop", id: c.id, x1: px(c.x), y1: busY, x2: px(c.x), y2: py(c.y), lineage: c.lineage, dashed: c.edge === "disputed" }),
    );
  });

  return { marks, lines };
}
