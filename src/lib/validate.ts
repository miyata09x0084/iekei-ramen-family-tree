import type { Shop } from "@/data/shops";

/**
 * 店舗データが系譜として整合しているかを検証し、違反を文言の配列で返す。
 * 違反がなければ空配列。1 件目で止めず全件を集めるので、店を一気に足したときも原因の店を全部名指しできる。
 *
 * 規則 3 が CONTEXT.md「系譜の整合」の定義そのもの。1・2・4 は #39 で決めた、系譜を辿る前提となる追加の検査。
 *   1. id が一意
 *   2. 総本山（lineage "root"）はちょうど 1 店で、師匠と関係が空
 *      資本系は師匠と関係が空。それ以外は両方が非空
 *   3. 資本系を除く全店が師匠をたどって総本山に到達し、同じ店を二度通らない
 *   4. 創業年が師匠より前でない（本人か師匠が概算なら除く）
 *   5. 全店に出典が 1 件以上あり、各出典は媒体名が非空で URL が http(s) で始まる（#44）。
 *      出典カードの画像（image）があれば https で始まる絶対 URL（http だと混在コンテンツで表示が落ちる。#60）
 */
export function validateShops(shops: Shop[]): string[] {
  const errors: string[] = [];

  // 1. id の一意性
  const seen = new Set<string>();
  for (const s of shops) {
    if (seen.has(s.id)) errors.push(`id "${s.id}" が重複している`);
    seen.add(s.id);
  }
  const byId = new Map(shops.map((s) => [s.id, s]));

  // 2. 総本山・資本系・それ以外で、師匠と関係の有無を確かめる
  const roots = shops.filter((s) => s.lineage === "root");
  if (roots.length === 0) errors.push(`総本山（lineage "root"）の店がない`);
  if (roots.length > 1) errors.push(`総本山（lineage "root"）が複数ある: ${roots.map((s) => s.id).join(", ")}`);
  for (const s of shops) {
    const standalone = s.lineage === "root" || s.lineage === "capital";
    const kind = s.lineage === "root" ? "総本山" : "資本系";
    if (standalone) {
      if (s.parent !== null) errors.push(`${kind} "${s.id}" に師匠（parent）がある`);
      if (s.edge !== null) errors.push(`${kind} "${s.id}" に関係（edge）がある`);
    } else {
      if (s.parent === null) errors.push(`"${s.id}" に師匠（parent）がない`);
      if (s.edge === null) errors.push(`"${s.id}" に関係（edge）がない`);
    }
  }

  // 3. 系譜の整合: 師匠をたどって総本山に到達し、同じ店を二度通らない
  for (const s of shops) {
    if (s.lineage === "capital" || s.parent === null) continue;
    const visited = new Set<string>([s.id]);
    let cur: Shop | undefined = s;
    while (cur.parent !== null) {
      const master = byId.get(cur.parent);
      if (!master) {
        errors.push(`"${cur.id}" の師匠 "${cur.parent}" が一覧にない`);
        break;
      }
      if (visited.has(master.id)) {
        errors.push(`"${s.id}" の系譜が循環している: ${[...visited, master.id].join(" → ")}`);
        break;
      }
      visited.add(master.id);
      cur = master;
    }
    if (cur.parent === null && cur.lineage !== "root") {
      errors.push(`"${s.id}" の系譜が総本山に到達しない（"${cur.id}" で途切れる）`);
    }
  }

  // 4. 創業年が師匠より前でない（概算の店は除く）
  for (const s of shops) {
    if (s.approx || s.parent === null) continue;
    const master = byId.get(s.parent);
    if (!master || master.approx) continue;
    if (s.founded < master.founded) {
      errors.push(`"${s.id}" の創業年 ${s.founded} が師匠 "${master.id}" の ${master.founded} より前`);
    }
  }

  // 5. 出典: 総本山・資本系を含む全店に 1 件以上。URL は http(s) で始まる絶対 URL（相対パスやメモの混入を防ぐ）
  for (const s of shops) {
    if (s.sources.length === 0) errors.push(`"${s.id}" に出典（sources）がない`);
    for (const src of s.sources) {
      if (src.title.trim() === "") errors.push(`"${s.id}" の出典 "${src.url}" に媒体名（title）がない`);
      if (!/^https?:\/\//.test(src.url)) errors.push(`"${s.id}" の出典 "${src.url}" が http(s) で始まらない`);
      if (src.image !== undefined && !/^https:\/\//.test(src.image)) errors.push(`"${s.id}" の出典カードの画像 "${src.image}" が https で始まらない`);
    }
  }

  return errors;
}

/** 店舗データの読み込み時に呼ぶ。違反があれば Error で止める。原因の店がある違反はその id を文言に含む（総本山が 1 店もない場合だけ id がない） */
export function assertShopsValid(shops: Shop[]): void {
  const errors = validateShops(shops);
  if (errors.length === 0) return;
  throw new Error(`店舗データが系譜として整合していない（${errors.length} 件）:\n` + errors.map((e) => `  - ${e}`).join("\n"));
}
