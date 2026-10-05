import type { LineageKey } from "@/data/shops";
import type { Layout } from "@/lib/layout";
import { markStyle, type MarkStyle } from "@/lib/view";

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
  id: string; // drop は弟子の id
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
 * 系図を OGP の影絵（系線と丸印だけの図）の座標に変換する。
 * 描くのは系譜に属する店だけで、右に別置きする資本系は含めない。
 * 屋号を描かないので世代間の縦距離は要らず、縦横を別々に縮めて枠を使い切る
 * （丸印は半径を別に持つので潰れない）。系線は computeLayout の path 文字列を使わず、
 * 丸印の位置から引き直す。
 */
export function silhouette(layout: Layout, box: SilhouetteBox): Silhouette {
  const inTree = layout.nodes.filter((n) => n.gen !== null);
  const xs = inTree.map((n) => n.x), ys = inTree.map((n) => n.y);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const sx = (box.width - box.pad * 2) / (Math.max(...xs) - minX);
  const sy = (box.height - box.pad * 2) / (Math.max(...ys) - minY);
  const px = (x: number) => (x - minX) * sx + box.pad;
  const py = (y: number) => (y - minY) * sy + box.pad;

  const marks = inTree.map((n) => ({ id: n.id, x: px(n.x), y: py(n.y), lineage: n.lineage, ...markStyle(n) }));

  const lines: SilhouetteLine[] = [];
  layout.links.forEach((l) => {
    if (l.kind === "drop") return; // bus の側で師匠と弟子をまとめて引く
    const master = l.parent, disciples = l.children;
    const busY = (py(master.y) + py(disciples[0].y)) / 2; // 横棒は師匠と弟子の中間
    const barXs = [master, ...disciples].map((n) => px(n.x));
    lines.push({ kind: "bus", id: l.id, x1: px(master.x), y1: py(master.y), x2: px(master.x), y2: busY, lineage: null, dashed: false });
    lines.push({ kind: "bus", id: `${l.id}:bar`, x1: Math.min(...barXs), y1: busY, x2: Math.max(...barXs), y2: busY, lineage: null, dashed: false });
    disciples.forEach((d) =>
      lines.push({ kind: "drop", id: d.id, x1: px(d.x), y1: busY, x2: px(d.x), y2: py(d.y), lineage: d.lineage, dashed: d.edge === "disputed" }),
    );
  });

  return { marks, lines };
}
