import { expect, test } from "vitest";

// #27 の検証用。CI が赤になりマージできないことを確かめるために、わざと失敗させている。マージしない。
test("わざと失敗させる", () => {
  expect(true).toBe(false);
});
