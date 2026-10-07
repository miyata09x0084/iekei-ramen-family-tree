import type { Source } from "@/data/shops";
import { sortSources } from "@/lib/certainty";

/**
 * 出典カード（CONTEXT.md）に出す出典。丼の画像を持つ出典のうち、一次 → 二次 → 三次の順で先頭の 1 件。
 * validate.ts が全店に 1 件以上を保証するので、null は validate を通らないデータ（テスト等）でだけ起きる。
 */
export function cardSourceOf(sources: Source[]): Source | null {
  return sortSources(sources).find((s) => s.image !== undefined) ?? null;
}
