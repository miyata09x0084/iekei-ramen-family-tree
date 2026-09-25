import { sendGAEvent } from "@next/third-parties/google";
import type { LineageKey, Pref } from "@/data/shops";

// GA4 に送るイベントの全種類。検索語などの自由入力文字列は型として受け付けない
// （送れるのは収録データ由来の固定値と真偽値のみ）
export type TrackEvent =
  | { name: "shop_select"; shop_id: string; lineage: LineageKey }
  | { name: "map_open"; shop_id: string }
  | { name: "filter_lineage"; key: LineageKey }
  | { name: "filter_pref"; key: Pref }
  | { name: "search"; hit: boolean }
  | { name: "replay" }
  | { name: "zoom_fit" };

export function track({ name, ...params }: TrackEvent) {
  // 測定 ID 未設定（ローカル等）では GA 自体を読み込まないので送らない
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  sendGAEvent("event", name, params);
}
