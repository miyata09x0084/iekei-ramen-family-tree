/**
 * 全店の外観画像の位置に、Google ストリートビューの画像があるかを確かめる。
 * Street View Static API の metadata は無料で枠も消費しないので、住所を直すたびに気軽に回せる。
 *
 *   npm run check:exterior   （.env.local の NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を読む）
 *
 * 店ごとに status と撮影日・pano_id を出し、画像が無い店（status が OK でない）があれば exit 1。
 * pano_id は、住所だと地点がずれる店の exterior.pano に貼って固定するのに使う。
 */
import { NODES } from "../src/data/shops";
import { exteriorMetadataUrl } from "../src/lib/exterior";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!apiKey) {
  console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY が無い。.env.local に置くか、コマンドの前に付けて実行する");
  process.exit(2);
}

interface Metadata {
  status: string;
  pano_id?: string;
  date?: string;
}

const missing: string[] = [];
for (const shop of NODES) {
  const res = await fetch(exteriorMetadataUrl(shop.exterior, apiKey));
  const meta = (await res.json()) as Metadata;
  const ok = meta.status === "OK";
  if (!ok) missing.push(shop.id);
  const detail = ok ? `${meta.date ?? "日付なし"}  ${meta.pano_id}` : "";
  console.log(`${ok ? "OK " : "NG "} ${shop.id.padEnd(16)} ${meta.status.padEnd(14)} ${detail}  ${shop.exterior.pano ?? shop.exterior.location}`);
}

console.log(`\n${NODES.length} 店中 ${NODES.length - missing.length} 店に画像あり`);
if (missing.length > 0) {
  console.error(`画像が無い店: ${missing.join(", ")}（住所を直すか、pano を固定する）`);
  process.exit(1);
}
