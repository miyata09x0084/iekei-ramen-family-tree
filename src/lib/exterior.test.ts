import { describe, expect, it } from "vitest";
import { exteriorAlt, exteriorCaption, exteriorImageUrl } from "@/lib/exterior";
import { pick } from "@/lib/shops.fixture";

const open = pick((s) => s.status === "open" && s.sub !== "", "営業中で補足のある店");
const closed = pick((s) => s.status === "closed", "閉店した店");
const mainClosed = pick((s) => s.status === "main-closed", "本店閉店の店");

describe("exteriorImageUrl: ストリートビューの画像 URL", () => {
  it("キーが空なら null（キー未設定の環境では画像を出さない）", () => {
    expect(exteriorImageUrl(open, "")).toBeNull();
    expect(exteriorImageUrl(open, undefined)).toBeNull();
  });
  it("住所をエンコードして location に渡し、キーを付ける", () => {
    const url = new URL(exteriorImageUrl({ ...open, exterior: { location: "横浜市西区岡野1-6-4" } }, "KEY")!);
    expect(url.origin + url.pathname).toBe("https://maps.googleapis.com/maps/api/streetview");
    expect(url.searchParams.get("location")).toBe("横浜市西区岡野1-6-4");
    expect(url.searchParams.get("key")).toBe("KEY");
  });
  it("屋外のパノラマだけを使い、画像が無いときは 404 を返させる", () => {
    const url = new URL(exteriorImageUrl(open, "KEY")!);
    expect(url.searchParams.get("source")).toBe("outdoor");
    expect(url.searchParams.get("return_error_code")).toBe("true");
    expect(url.searchParams.get("size")).toBe("640x400");
  });
  it("pano があれば location の代わりに pano を渡す", () => {
    const url = new URL(exteriorImageUrl({ ...open, exterior: { location: "どこか", pano: "PANO-ID" } }, "KEY")!);
    expect(url.searchParams.get("pano")).toBe("PANO-ID");
    expect(url.searchParams.has("location")).toBe(false);
  });
  it("heading は指定したときだけ付く", () => {
    expect(new URL(exteriorImageUrl(open, "KEY")!).searchParams.has("heading")).toBe(false);
    const url = new URL(exteriorImageUrl({ ...open, exterior: { location: "どこか", heading: 120 } }, "KEY")!);
    expect(url.searchParams.get("heading")).toBe("120");
  });
});

describe("exteriorCaption: 画像の出典と注記", () => {
  it("営業中の店は画像の出典だけ", () => {
    expect(exteriorCaption(open)).toBe("画像: Google ストリートビュー");
  });
  it("閉店した店は、かつてあった場所の今の様子だと添える", () => {
    expect(exteriorCaption(closed)).toBe("画像: Google ストリートビュー（かつてお店があった場所の、今の様子）");
  });
  it("本店閉店の店は、名前を受け継ぐ店だと添える", () => {
    expect(exteriorCaption(mainClosed)).toBe("画像: Google ストリートビュー（名前を受け継いだお店）");
  });
});

describe("exteriorAlt: 画像の代替テキスト", () => {
  it("屋号（補足）の外観", () => {
    expect(exteriorAlt(open)).toBe(`${open.name}（${open.sub}）の外観`);
  });
});
