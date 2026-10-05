import { describe, expect, it } from "vitest";
import type { Shop } from "@/data/shops";
import { assertShopsValid, validateShops } from "@/lib/validate";
import { FIXTURE, pick } from "@/lib/shops.fixture";

const root = pick((s) => s.lineage === "root", "総本山");
const capital = pick((s) => s.lineage === "capital", "資本系");
const branch = pick((s) => s.lineage === "honmoku" && s.parent === root.id, "系統の分岐点");
const grandchild = pick((s) => s.parent === branch.id, "分岐点の弟子");
const approx = pick((s) => s.approx === true, "概算の店");

/** fixture の 1 店だけを差し替えた配列を返す。他の店はそのまま */
function replace(id: string, patch: Partial<Shop>): Shop[] {
  return FIXTURE.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

/** 違反の文言のうち、指定の id を含むものだけを返す */
function naming(errors: string[], id: string): string[] {
  return errors.filter((e) => e.includes(id));
}

describe("validateShops: 整合した店舗データ", () => {
  it("fixture は違反なし", () => {
    expect(validateShops(FIXTURE)).toEqual([]);
  });
});

describe("validateShops: 系譜の整合", () => {
  it("師匠の id が一覧にない店を名指しする", () => {
    const errors = validateShops(replace(grandchild.id, { parent: "no-such-shop" }));
    expect(naming(errors, grandchild.id)).not.toEqual([]);
    expect(naming(errors, "no-such-shop")).not.toEqual([]);
  });
  it("循環している店を名指しする（分岐点の師匠をその弟子にする）", () => {
    const errors = validateShops(replace(branch.id, { parent: grandchild.id }));
    expect(naming(errors, branch.id)).not.toEqual([]);
    expect(naming(errors, grandchild.id)).not.toEqual([]);
  });
  it("総本山が 2 店あれば違反", () => {
    const errors = validateShops(replace(branch.id, { lineage: "root", parent: null, edge: null }));
    expect(naming(errors, branch.id)).not.toEqual([]);
  });
  it("総本山が 1 店もなければ違反（弟子の師匠が見つからない違反とは別に報告する）", () => {
    const errors = validateShops(FIXTURE.filter((s) => s.id !== root.id));
    expect(errors.some((e) => e.includes("総本山") && e.includes("ない"))).toBe(true);
  });
});

describe("validateShops: id の一意性", () => {
  it("重複した id を名指しする", () => {
    const errors = validateShops([...FIXTURE, { ...grandchild }]);
    expect(naming(errors, grandchild.id)).not.toEqual([]);
  });
});

describe("validateShops: 師匠と関係の有無", () => {
  it("資本系に師匠があれば違反", () => {
    expect(naming(validateShops(replace(capital.id, { parent: root.id })), capital.id)).not.toEqual([]);
  });
  it("資本系に関係があれば違反", () => {
    expect(naming(validateShops(replace(capital.id, { edge: "trained" })), capital.id)).not.toEqual([]);
  });
  it("総本山に師匠や関係があれば違反", () => {
    expect(naming(validateShops(replace(root.id, { parent: branch.id })), root.id)).not.toEqual([]);
    expect(naming(validateShops(replace(root.id, { edge: "direct" })), root.id)).not.toEqual([]);
  });
  it("総本山と資本系以外で師匠が空なら違反", () => {
    expect(naming(validateShops(replace(grandchild.id, { parent: null })), grandchild.id)).not.toEqual([]);
  });
  it("総本山と資本系以外で関係が空なら違反", () => {
    expect(naming(validateShops(replace(grandchild.id, { edge: null })), grandchild.id)).not.toEqual([]);
  });
});

describe("validateShops: 創業年", () => {
  it("師匠より前に創業した店を名指しする", () => {
    const errors = validateShops(replace(grandchild.id, { founded: branch.founded - 1 }));
    expect(naming(errors, grandchild.id)).not.toEqual([]);
  });
  it("師匠と同じ年の創業は違反にしない", () => {
    expect(validateShops(replace(grandchild.id, { founded: branch.founded }))).toEqual([]);
  });
  it("概算の店は創業年を検証しない", () => {
    expect(approx.parent).not.toBeNull();
    expect(validateShops(replace(approx.id, { founded: 1900 }))).toEqual([]);
  });
  it("師匠が概算の店なら弟子の創業年を検証しない", () => {
    const shops = replace(branch.id, { approx: true }).map((s) =>
      s.id === grandchild.id ? { ...s, founded: branch.founded - 1 } : s,
    );
    expect(validateShops(shops)).toEqual([]);
  });
});

describe("validateShops: 出典", () => {
  it("出典が 1 件もない店を名指しする", () => {
    const errors = validateShops(replace(grandchild.id, { sources: [] }));
    expect(naming(errors, grandchild.id)).not.toEqual([]);
  });
  it("総本山と資本系にも出典が要る", () => {
    expect(naming(validateShops(replace(root.id, { sources: [] })), root.id)).not.toEqual([]);
    expect(naming(validateShops(replace(capital.id, { sources: [] })), capital.id)).not.toEqual([]);
  });
  it("URL が http(s) で始まらない出典を、店の id と URL で名指しする", () => {
    const errors = validateShops(replace(grandchild.id, { sources: [{ title: "媒体", url: "example.com/page", kind: "primary" }] }));
    expect(naming(errors, grandchild.id)).not.toEqual([]);
    expect(naming(errors, "example.com/page")).not.toEqual([]);
  });
  it("http の URL は違反にしない（公式サイトが http のみの店があるため）", () => {
    expect(validateShops(replace(grandchild.id, { sources: [{ title: "媒体", url: "http://example.com/page", kind: "primary" }] }))).toEqual([]);
  });
  it("媒体名が空の出典を名指しする", () => {
    const errors = validateShops(replace(grandchild.id, { sources: [{ title: "", url: "https://example.com/", kind: "primary" }] }));
    expect(naming(errors, grandchild.id)).not.toEqual([]);
  });
});

describe("assertShopsValid: 読み込み時の停止", () => {
  it("整合していれば何もしない", () => {
    expect(() => assertShopsValid(FIXTURE)).not.toThrow();
  });
  it("違反があれば、すべての原因の店の id を含む Error を投げる", () => {
    const broken = replace(capital.id, { edge: "trained" }).map((s) =>
      s.id === grandchild.id ? { ...s, parent: null } : s,
    );
    expect(() => assertShopsValid(broken)).toThrow(Error);
    try {
      assertShopsValid(broken);
    } catch (e) {
      const message = (e as Error).message;
      expect(message).toContain(capital.id);
      expect(message).toContain(grandchild.id);
    }
  });
});
