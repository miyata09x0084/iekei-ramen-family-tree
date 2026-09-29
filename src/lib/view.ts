import type { Shop } from "@/data/shops";
import type { Link } from "@/lib/layout";
import { matches, type FilterState } from "@/lib/ancestry";

/** 丸印の見た目。ring は直系の認定を示す外輪（元直系は点線）、filled は営業中の塗りつぶし */
export interface MarkStyle {
  ring: "solid" | "dashed" | null;
  filled: boolean;
}

export function markStyle(shop: Shop): MarkStyle {
  const ring = shop.edge === "direct" ? "solid" : shop.edge === "former" ? "dashed" : null;
  return { ring, filled: shop.status === "open" };
}

/** ホバー時に光らせる系線か。lit は光らせる店の id 集合（ancestry の結果） */
export function isLitLink(link: Link, lit: Set<string>): boolean {
  if (link.kind === "drop") return lit.has(link.child.id);
  return lit.has(link.parent.id) && link.children.some((c) => lit.has(c.id));
}

/** 店の表示状態。hidden は表示年より後に創業した店（未来）、dim は絞り込みに合わない店 */
export interface Visibility {
  hidden: Set<string>;
  dim: Set<string>;
}

export function visibility(shops: Shop[], filter: FilterState): Visibility {
  const hidden = new Set<string>(), dim = new Set<string>();
  shops.forEach((s) => {
    if (s.founded > filter.year) hidden.add(s.id);
    else if (!matches(s, filter)) dim.add(s.id);
  });
  return { hidden, dim };
}

/**
 * 系線の表示状態。drop は師匠から弟子 1 店への縦線、bus は師匠から全弟子への幹と横棒。
 * bus は全弟子が消えたときだけ消し、全弟子が薄いときだけ薄くする。
 * 一部の弟子が絞り込みに残っているあいだは幹を濃いまま残し、系譜を追えるようにする。
 */
export function linkVisibility(link: Link, v: Visibility): { future: boolean; dim: boolean } {
  if (link.kind === "drop") {
    return { future: v.hidden.has(link.child.id), dim: v.dim.has(link.child.id) && v.dim.has(link.parent.id) };
  }
  return {
    future: link.children.every((c) => v.hidden.has(c.id)),
    dim: link.children.every((c) => v.dim.has(c.id)),
  };
}
