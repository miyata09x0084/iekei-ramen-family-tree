import Image from "next/image";
import { photoAlt, photoCaption, photoSrc, type ShopWithPhoto } from "@/lib/photo";

/**
 * どんぶり写真。店舗ページと詳細パネルの見出し直下に置く。
 * 写真がない店では呼び出し側が hasPhoto で絞って出さない（空の枠や「準備中」は作らない）。
 * next.config の unoptimized により、next/image は素の <img> として出る。width/height は 4:3 の目安で、実寸は CSS が決める（縦長の写真は上下が切れる）
 */
export function ShopPhoto({ shop, priority = false }: { shop: ShopWithPhoto; priority?: boolean }) {
  return (
    <figure className="photo">
      <Image src={photoSrc(shop)} alt={photoAlt(shop)} width={1200} height={900} priority={priority} />
      <figcaption>{photoCaption(shop)}</figcaption>
    </figure>
  );
}
