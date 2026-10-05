import { EDGE_LABEL, type Shop } from "@/data/shops";

/** 師匠の店。師匠を持たない店（総本山・資本系）や、師匠の id が見つからない場合は null */
export function masterOf<T extends Shop>(shop: Shop, shops: T[]): T | null {
  return shop.parent ? shops.find((s) => s.id === shop.parent) ?? null : null;
}

/** 弟子の店を創業年の昇順で返す */
export function disciplesOf<T extends Shop>(shop: Shop, shops: T[]): T[] {
  return shops.filter((s) => s.parent === shop.id).sort((a, b) => a.founded - b.founded);
}

/** 詳細パネルの「世代」の文言。gen は系図の配置で付く世代（総本山が 0、資本系は null） */
export function generationLabel(gen: number | null): string {
  if (gen === null) return "なし（修行のつながりがないお店）";
  if (gen === 0) return "初代（総本山。すべての始まりのお店）";
  return `第${gen + 1}世代`;
}

/** 詳細パネルの「関係」の文言。師匠との関係がない店は、資本系か総本山かで分ける */
export function relationLabel(shop: Shop): string {
  if (shop.edge) return EDGE_LABEL[shop.edge];
  return shop.lineage === "capital" ? "会社が開いたお店（修行のつながりはない）" : "始まりのお店（師匠はいない）";
}
