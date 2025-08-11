import { describe, expect, test } from "vitest";
import { afterApplyingForce } from "./springs";
import { yv } from "./ii-utils";

describe("springs", () => {
  test("zero length", () => {
    const after = afterApplyingForce({
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
    const after = afterApplyingForce({
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
