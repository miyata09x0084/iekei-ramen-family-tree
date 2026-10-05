import { describe, expect, it } from "vitest";
import { correctionIssueUrl, generationOf, shopDescription, shopPath, shopTitle } from "@/lib/shop-page";
import { FIXTURE_BY_ID, pick } from "@/lib/shops.fixture";

const root = pick((s) => s.lineage === "root", "総本山");
const capital = pick((s) => s.lineage === "capital", "資本系");
const branch = pick((s) => s.lineage === "honmoku" && s.parent === root.id, "系統の分岐点");
const grandchild = pick((s) => s.parent === branch.id, "分岐点の弟子");
const withSub = pick((s) => s.sub !== "" && s.parent !== null, "補足のある店");
const noSub = pick((s) => s.sub === "" && s.parent !== null && s.lineage !== "capital", "補足のない店");
const approx = pick((s) => s.approx === true, "概算の店");
const disputed = pick((s) => s.edge === "disputed", "諸説あり");

describe("shopPath: 店舗ページの URL", () => {
  it("/shops/<id>", () => {
    expect(shopPath("budoka")).toBe("/shops/budoka");
  });
});

describe("shopTitle: 店舗ページの題名", () => {
  it("屋号（補足）の系譜と師匠・弟子", () => {
    expect(shopTitle(withSub)).toBe(`${withSub.name}（${withSub.sub}）の系譜と師匠・弟子`);
  });
  it("補足が空なら括弧を付けない", () => {
    expect(shopTitle(noSub)).toBe(`${noSub.name}の系譜と師匠・弟子`);
  });
});

describe("shopDescription: 検索結果とリンクのカードに出る説明文", () => {
  it("修行した店・できた年・場所と、載せている内容を 1 文ずつ", () => {
    expect(shopDescription(grandchild, FIXTURE_BY_ID)).toBe(
      `${grandchild.name}は、${branch.name}で修行して${grandchild.founded}年に${grandchild.city}で開いたお店。${root.name}までのつながりと、師匠・弟子・出典を載せています。`,
    );
  });
  it("概算の年には「頃」を付ける", () => {
    expect(shopDescription(approx, FIXTURE_BY_ID)).toContain(`${approx.founded}年頃に`);
  });
  it("諸説ありの店は、修行先が諸説あることを添える", () => {
    const master = FIXTURE_BY_ID.get(disputed.parent!)!;
    expect(shopDescription(disputed, FIXTURE_BY_ID)).toContain(`${master.name}で修行したと言われ（諸説あり）`);
  });
  it("影響だけの店は「影響を受けて」にする", () => {
    const inspired = { ...grandchild, edge: "inspired" as const };
    expect(shopDescription(inspired, FIXTURE_BY_ID)).toContain(`${branch.name}に影響を受けて`);
  });
  it("総本山は始まりのお店として書き、つながりではなく弟子を載せると言う", () => {
    expect(shopDescription(root, FIXTURE_BY_ID)).toBe(
      `${root.name}は、${root.founded}年に${root.city}で開いた、家系ラーメンの始まりのお店。弟子と出典を載せています。`,
    );
  });
  it("資本系は会社が広げたお店として書く", () => {
    expect(shopDescription(capital, FIXTURE_BY_ID)).toBe(
      `${capital.name}は、${capital.founded}年に${capital.city}で始まった、会社が広げたお店（資本系）。出典を載せています。`,
    );
  });
});

describe("generationOf: 世代（総本山が 0）", () => {
  it("総本山は 0、弟子は師匠の数だけ増える", () => {
    expect(generationOf(root, FIXTURE_BY_ID)).toBe(0);
    expect(generationOf(branch, FIXTURE_BY_ID)).toBe(1);
    expect(generationOf(grandchild, FIXTURE_BY_ID)).toBe(2);
  });
  it("資本系は null（世代なし）", () => {
    expect(generationOf(capital, FIXTURE_BY_ID)).toBeNull();
  });
});

describe("correctionIssueUrl: 訂正を知らせる issue の新規作成 URL", () => {
  it("リポジトリの issues/new に、屋号入りの題名を付ける", () => {
    const url = new URL(correctionIssueUrl(withSub));
    expect(url.origin + url.pathname).toBe("https://github.com/miyata09x0084/iekei-ramen-family-tree/issues/new");
    expect(url.searchParams.get("title")).toBe(`${withSub.name}（${withSub.sub}）の情報の訂正`);
  });
});
