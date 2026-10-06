import type { Source } from "@/data/shops";
import { sortSources } from "@/lib/certainty";

/**
 * 出典カード（CONTEXT.md）に出す出典。画像を持つ出典のうち、一次 → 二次 → 三次の順で先頭の 1 件。
 * なければ null で、画面は系統色と系統名の面を出す。
 */
export function cardSourceOf(sources: Source[]): Source | null {
  return sortSources(sources).find((s) => s.image !== undefined) ?? null;
}
