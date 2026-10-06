import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { NODES } from "@/data/shops";
import { hasPhoto, photoSrc } from "@/lib/photo";

/**
 * 実データと写真ファイルの対応。validate.ts は読み込み時に動くのでファイルの有無を見られない。
 * その代わりにここで、photo を持つ店のファイルが public/ にあること、逆に店に結びつかないファイルがないことを確かめる。
 */
const PUBLIC_DIR = fileURLToPath(new URL("../../public", import.meta.url));
const PHOTO_DIR = `${PUBLIC_DIR}/shops`;

/** public/shops/ にある写真ファイル。.gitkeep などの隠しファイルは除く */
function photoFiles(): string[] {
  if (!existsSync(PHOTO_DIR)) return [];
  return readdirSync(PHOTO_DIR).filter((f) => !f.startsWith("."));
}

describe("どんぶり写真: 店舗データと public/shops/ の対応", () => {
  it("photo を持つ店には public/shops/<id>.jpg がある", () => {
    const missing = NODES.filter(hasPhoto).filter((s) => !existsSync(`${PUBLIC_DIR}${photoSrc(s)}`)).map((s) => s.id);
    expect(missing).toEqual([]);
  });
  it("public/shops/ のファイルはすべて、photo を持つ店の <id>.jpg である", () => {
    const expected = new Set(NODES.filter(hasPhoto).map((s) => `${s.id}.jpg`));
    const orphans = photoFiles().filter((f) => !expected.has(f));
    expect(orphans).toEqual([]);
  });
});
