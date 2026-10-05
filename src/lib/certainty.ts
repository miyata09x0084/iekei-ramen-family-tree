import type { Source, SourceKind } from "@/data/shops";

const KIND_RANK: Record<SourceKind, number> = { primary: 0, secondary: 1, tertiary: 2 };

/** 一次 → 二次 → 三次の順に並べた新しい配列を返す。同じ種別の中はデータの順を保つ */
export function sortSources(sources: Source[]): Source[] {
  return [...sources].sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind]);
}

/** 確度。出典の種別から機械的に導き、手では付けない（CONTEXT.md「確度」） */
export type Certainty = "confirmed" | "reported" | "unverified";

export const CERTAINTY_LABEL: Record<Certainty, string> = {
  confirmed: "確か（公式の発信あり）",
  reported: "ほぼ確か（新聞・雑誌の記事あり）",
  unverified: "未確認（Wikipedia やブログだけ）",
};

/** 出典のうち最も確かな種別で決める。一次が 1 件でもあれば確定、二次までなら報道による、三次だけなら未確認 */
export function certaintyOf(sources: Source[]): Certainty {
  if (sources.some((s) => s.kind === "primary")) return "confirmed";
  if (sources.some((s) => s.kind === "secondary")) return "reported";
  return "unverified";
}
