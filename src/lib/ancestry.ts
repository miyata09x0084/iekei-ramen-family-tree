import type { LineageKey, Pref, Shop } from "@/data/shops";

/** 指定の店から吉村家まで遡った id の集合（自身を含む） */
export function ancestry(id: string, byId: Map<string, Shop>): Set<string> {
  const ids = new Set<string>();
  let n = byId.get(id);
  while (n) {
    ids.add(n.id);
    n = n.parent ? byId.get(n.parent) : undefined;
  }
  return ids;
}

export interface FilterState {
  lineages: Set<LineageKey>;
  prefs: Set<Pref>;
  year: number;
  query: string;
}

export function matches(n: Shop, f: FilterState): boolean {
  if (f.lineages.size && !f.lineages.has(n.lineage)) return false;
  if (f.prefs.size && !f.prefs.has(n.pref)) return false;
  if (f.query && !(n.name + n.sub + n.city).includes(f.query)) return false;
  return true;
}

/** 検索語の正規化。前後の空白を落とし、屋号と補足の間の空白も詰めて name + sub と比べられるようにする */
export function normalizeQuery(v: string): string {
  return v.trim().replace(/\s+/g, "");
}
