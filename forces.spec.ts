import { describe, expect, test } from "vitest";
import { afterSpringForces } from "./forces";
import { yv } from "./ii-utils";

describe("forces", () => {
  test("equal forces", () => {
    const after = afterSpringForces({
      HEIGHT: NaN,
      boxes: [yv(30, 0, 0), yv(20, 0, 0)],
      masses: [10, 10],
      springs: [
        {
          one: 0,
          two: 1,
          k: 3,
          restingLen: 50,
        },
      ],
    });
    expect(after.boxes).toStrictEqual([yv(30, 0, 12), yv(20, 0, -12)]);
  });

  test("zero length", () => {
    const after = afterSpringForces({
      HEIGHT: NaN,
      boxes: [yv(30, 20, 0), yv(30, 10, 0)],
      masses: [10, 10],
      springs: [
        {
          one: 0,
          two: 1,
          k: 3,
          restingLen: 5,
        },
      ],
    });
    expect(after.boxes).toStrictEqual([yv(30, 20, 0), yv(30, 10, 0)]);
  });

  test("no force at resting len", () => {
    const after = afterSpringForces({
      HEIGHT: NaN,
      boxes: [yv(30, 20, 0), yv(35, 10, 0)],
      masses: [10, 10],
      springs: [
        {
          one: 0,
          two: 1,
          k: 3,
          restingLen: 5,
        },
      ],
    });
    expect(after.boxes).toStrictEqual([yv(30, 20, 0), yv(35, 10, 0)]);
  });
});
