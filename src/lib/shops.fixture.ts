import type { Shop } from "@/data/shops";

/**
 * テスト専用の架空の店舗データ。実データ（src/data/shops.ts）とは独立させ、
 * 店を追加しても期待値が変わらないようにする。
 *
 * テストは id ではなく属性で店を探す（例: edge === "former" の店）ので、
 * 次の条件を満たしていれば屋号や id は自由に決めてよい。
 *
 * 必ず 1 店ずつ含める:
 *   - 総本山        lineage "root",  parent null, edge null, founded 1974
 *   - 直系          edge "direct",   lineage "direct", 師匠は総本山
 *   - 元直系        edge "former",   師匠は総本山
 *   - 系統の分岐点  lineage "honmoku", edge "trained", 師匠は総本山
 *   - 分岐点の弟子  lineage "honmoku", edge "trained", 師匠は分岐点（= 3 世代目）
 *   - 諸説あり      edge "disputed", lineage "indep"
 *   - 本店閉店      status "main-closed"
 *   - 資本系        lineage "capital", parent null, edge null
 * さらに:
 *   - status "closed" の店を 1 店、approx: true の店を 1 店
 *   - sub が空文字の店と空でない店の両方
 *   - pref が 2 種類以上
 *   - 同じ師匠を持つ兄弟を、配列上は創業年の降順で並べる（弟子の並び替えを検証するため）
 */
export const FIXTURE: Shop[] = [
  { id: "sohonzan", name: "総本山家", sub: "本店", pref: "神奈川", city: "横浜市", founded: 1974, parent: null, lineage: "root", status: "open", edge: null, note: "", sources: [{ title: "架空の出典", url: "https://example.com/" }] },
  // 総本山の弟子 3 店。創業年の降順に並べる（disciplesOf の並び替えを検証するため）
  { id: "moto", name: "元直系家", sub: "駅前", pref: "東京", city: "町田市", founded: 1998, approx: true, parent: "sohonzan", lineage: "direct", status: "open", edge: "former", note: "", sources: [{ title: "架空の出典", url: "https://example.com/" }] },
  { id: "chokkei", name: "直系家", sub: "", pref: "神奈川", city: "川崎市", founded: 1990, parent: "sohonzan", lineage: "direct", status: "open", edge: "direct", note: "", sources: [{ title: "架空の出典", url: "https://example.com/" }] },
  { id: "bunki", name: "分岐家", sub: "本牧", pref: "神奈川", city: "横浜市", founded: 1985, parent: "sohonzan", lineage: "honmoku", status: "main-closed", edge: "trained", note: "", sources: [{ title: "架空の出典", url: "https://example.com/" }] },
  // 3 世代目と、直系家の弟子 2 店
  { id: "deshi", name: "弟子家", sub: "", pref: "千葉", city: "船橋市", founded: 2003, parent: "bunki", lineage: "honmoku", status: "open", edge: "trained", note: "", sources: [{ title: "架空の出典", url: "https://example.com/" }] },
  { id: "heiten", name: "閉店家", sub: "駅裏", pref: "神奈川", city: "川崎市", founded: 2001, parent: "chokkei", lineage: "direct", status: "closed", edge: "trained", note: "", sources: [{ title: "架空の出典", url: "https://example.com/" }] },
  { id: "shosetsu", name: "諸説家", sub: "", pref: "東京", city: "八王子市", founded: 2010, parent: "chokkei", lineage: "indep", status: "open", edge: "disputed", note: "", sources: [{ title: "架空の出典", url: "https://example.com/" }] },
  // 資本系。師匠を持たず木の外に置かれる
  { id: "shihon", name: "資本家", sub: "", pref: "東京", city: "新宿区", founded: 2015, parent: null, lineage: "capital", status: "open", edge: null, note: "", sources: [{ title: "架空の出典", url: "https://example.com/" }] },
];

export const FIXTURE_BY_ID = new Map(FIXTURE.map((s) => [s.id, s]));

/** 属性で 1 店を取り出す。見つからなければテストを止める */
export function pick(pred: (s: Shop) => boolean, label: string): Shop {
  const s = FIXTURE.find(pred);
  if (!s) throw new Error(`fixture に ${label} の店がない`);
  return s;
}
