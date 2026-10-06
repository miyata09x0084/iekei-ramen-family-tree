import { describe, expect, it } from "vitest";
import type { Shop } from "@/data/shops";
import { photoAlt, photoCaption, photoSrc, type ShopWithPhoto } from "@/lib/photo";
import { pick } from "@/lib/shops.fixture";

const withSub = pick((s) => s.sub !== "" && s.status === "open", "補足のある営業中の店");
const closed = pick((s) => s.status === "closed", "閉店した店");

const PHOTO = { takenAt: "2026-10-06", menu: "ラーメン並" };
function withPhoto(shop: Shop): ShopWithPhoto {
  return { ...shop, photo: PHOTO };
}

describe("photoSrc: どんぶり写真のファイルの URL", () => {
  it("public/shops/<id>.jpg を指す /shops/<id>.jpg", () => {
    expect(photoSrc(withPhoto(withSub))).toBe(`/shops/${withSub.id}.jpg`);
  });
});

describe("photoAlt: 画像の代替テキスト", () => {
  it("屋号（補足）の + メニュー名", () => {
    expect(photoAlt(withPhoto(withSub))).toBe(`${withSub.name}（${withSub.sub}）のラーメン並`);
  });
});

describe("photoCaption: 写真の下の説明", () => {
  it("メニュー名と、撮影日を / 区切りで", () => {
    expect(photoCaption(withPhoto(withSub))).toBe("ラーメン並（2026/10/06 撮影）");
  });
  it("閉店した店でも、店の状態は書かない（営業の欄が担う）", () => {
    expect(photoCaption(withPhoto(closed))).toBe("ラーメン並（2026/10/06 撮影）");
  });
});
