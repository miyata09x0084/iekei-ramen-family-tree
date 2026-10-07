import { describe, expect, it } from "vitest";
import type { Source } from "@/data/shops";
import { cardSourceOf } from "@/lib/source-card";

const primary: Source = { title: "公式サイト", url: "https://example.com/official", kind: "primary" };
const secondary: Source = { title: "新聞", url: "https://example.com/news", kind: "secondary" };
const secondaryWithImage: Source = { ...secondary, url: "https://example.com/news2", image: "https://example.com/news2.jpg" };
const tertiaryWithImage: Source = { title: "ブログ", url: "https://example.com/blog", kind: "tertiary", image: "https://example.com/blog.jpg" };

describe("cardSourceOf: 出典カードに出す出典を 1 件選ぶ", () => {
  it("画像を持つ出典のうち、一次 → 二次 → 三次の順で先頭の 1 件を返す", () => {
    expect(cardSourceOf([tertiaryWithImage, primary, secondaryWithImage])).toBe(secondaryWithImage);
  });
  it("画像を持つ出典がなければ null（系統色の面を出す）", () => {
    expect(cardSourceOf([primary, secondary])).toBeNull();
    expect(cardSourceOf([])).toBeNull();
  });
});
