import { afterOfflineSimulate, getStats } from "./ii-verlet";
import { describe, expect, test } from "vitest";
import all from "./interesting-suitcases";

describe("long simulate results", () => {
  test("conserve energy", () => {
    const cases = all.filter((s) => s.dragCoeff === 0);
    const expected = cases.map((c) => getStats(c).totalEnergy);
    const actual = cases.map(
      (c) => getStats(afterOfflineSimulate(100, c)).totalEnergy,
    );
    const relativeError = actual
      .map((a, idx) => (a - expected[idx]) / a)
      .map((x) => Math.abs(x).toFixed(4));
    expect(relativeError).toStrictEqual(new Array(all.length).fill("0.0000"));
  });
});
