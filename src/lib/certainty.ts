import type { Source, SourceKind } from "@/data/shops";

const KIND_ORDER: Record<SourceKind, number> = { primary: 0, secondary: 1, tertiary: 2 };

/** 詳細パネルに並べる順。一次 → 二次 → 三次で、同じ種別の中はデータに書いた順を保つ。元の配列は変えない */
export function sourcesByKind(sources: Source[]): Source[] {
  return [...sources].sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
}

/** 確度。出典の種別から機械的に導き、手では付けない（CONTEXT.md「確度」） */
export type Certainty = "confirmed" | "reported" | "unverified";

export const CERTAINTY_LABEL: Record<Certainty, string> = {
  confirmed: "確定（一次情報あり）",
  reported: "報道による（一次情報なし）",
  unverified: "未確認（Wikipedia・ブログのみ）",
};

/** 出典のうち最も確かな種別で決める。一次が 1 件でもあれば確定、二次までなら報道による、三次だけなら未確認 */
export function certaintyOf(sources: Source[]): Certainty {
  if (sources.some((s) => s.kind === "primary")) return "confirmed";
  if (sources.some((s) => s.kind === "secondary")) return "reported";
  return "unverified";
}
