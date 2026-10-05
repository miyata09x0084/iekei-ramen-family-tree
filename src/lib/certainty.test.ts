import { describe, expect, it } from "vitest";
import type { Source } from "@/data/shops";
import { certaintyOf, sourcesByKind } from "@/lib/certainty";

const primary: Source = { title: "公式サイト", url: "https://example.com/official", kind: "primary" };
const secondary: Source = { title: "新聞", url: "https://example.com/news", kind: "secondary" };
const tertiary: Source = { title: "Wikipedia", url: "https://example.com/wiki", kind: "tertiary" };

describe("certaintyOf: 出典の種別から確度を導く", () => {
  it("一次情報が 1 件でもあれば「確定」", () => {
    expect(certaintyOf([tertiary, secondary, primary])).toBe("confirmed");
  });
  it("二次情報まででは「報道による」", () => {
    expect(certaintyOf([tertiary, secondary])).toBe("reported");
  });
  it("三次情報だけなら「未確認」", () => {
    expect(certaintyOf([tertiary, tertiary])).toBe("unverified");
  });
  it("出典が空でも「未確認」（validate が止めるので画面には出ないが、落ちない）", () => {
    expect(certaintyOf([])).toBe("unverified");
  });
});

describe("sourcesByKind: 一次 → 二次 → 三次の順に並べる", () => {
  it("データに書いた順に関わらず種別順になる", () => {
    expect(sourcesByKind([tertiary, secondary, primary])).toEqual([primary, secondary, tertiary]);
  });
  it("同じ種別の中では書いた順を保つ", () => {
    const t2: Source = { ...tertiary, url: "https://example.com/wiki2" };
    expect(sourcesByKind([tertiary, primary, t2])).toEqual([primary, tertiary, t2]);
  });
  it("元の配列を変えない", () => {
    const input = [tertiary, primary];
    sourcesByKind(input);
    expect(input).toEqual([tertiary, primary]);
  });
});
