/**
 * 全店の外観画像の位置に、Google ストリートビューの画像があるかを確かめる。
 * Street View Static API の metadata は無料で枠も消費しないので、住所を直すたびに気軽に回せる。
 *
 *   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=... npm run check:exterior
 *
 * 店ごとに status と撮影日・pano_id を出し、画像が無い店（status が OK でない）があれば exit 1。
 * pano_id は、住所だと地点がずれる店の exterior.pano に貼って固定するのに使う。
 */
import { NODES } from "../src/data/shops";

const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!key) {
  console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY が無い。.env.local に置くか、コマンドの前に付けて実行する");
  process.exit(2);
}

interface Metadata {
  status: string;
  pano_id?: string;
  date?: string;
  copyright?: string;
}

async function metadataOf(location: string, pano: string | undefined): Promise<Metadata> {
  const params = new URLSearchParams({ source: "outdoor", key });
  if (pano) params.set("pano", pano);
  else params.set("location", location);
  const res = await fetch(`https://maps.googleapis.com/maps/api/streetview/metadata?${params}`);
  return (await res.json()) as Metadata;
}

const missing: string[] = [];
for (const shop of NODES) {
  const meta = await metadataOf(shop.exterior.location, shop.exterior.pano);
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
