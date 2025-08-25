import { describe, expect, test } from "vitest";
import {
  afterSpringForces,
  afterGravity,
  afterAirDrag,
  getSpringEndpointY,
  MIN_Y_ANCHOR,
  MAX_Y_ANCHOR,
} from "./forces";
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

  test("gravity adds acceleration to all boxes", () => {
    const before = { boxes: [yv(10, 0, 0), yv(20, 0, 1)], gravityAcc: 2 };
    const after = afterGravity(before);
    expect(after.boxes).toStrictEqual([yv(10, 0, 2), yv(20, 0, 3)]);
  });

  test("air drag applies quadratic drag opposite velocity", () => {
    const before = {
      boxes: [yv(0, 3, 0), yv(0, -4, 0)],
      dt: 1,
      dragCoeff: 2,
      masses: [2, 4],
    };
    const after = afterAirDrag(before);
    // v1 = +3 => drag = 2*9=18, direction = -1 => accel = -18/2 = -9
    // v2 = -4 => drag = 2*16=32, direction = +1 => accel = +32/4 = +8
    expect(after.boxes).toStrictEqual([yv(0, 3, -9), yv(0, -4, 8)]);
  });

  test("spring endpoint with MIN_Y_ANCHOR uses 0 as anchor Y", () => {
    const w = { HEIGHT: 100, boxes: [yv(50, 0, 0)] };
    const [boxY, anchorY] = getSpringEndpointY(w as any, {
      one: MIN_Y_ANCHOR,
      two: 0,
      k: 1,
      restingLen: 10,
    });
    expect(boxY).toBe(50);
    expect(anchorY).toBe(0);
  });

  test("spring endpoint with MAX_Y_ANCHOR uses HEIGHT as anchor Y", () => {
    const w = { HEIGHT: 120, boxes: [yv(70, 0, 0)] };
    const [boxY, anchorY] = getSpringEndpointY(w as any, {
      one: 0,
      two: MAX_Y_ANCHOR,
      k: 1,
      restingLen: 10,
    });
    expect(boxY).toBe(70);
    expect(anchorY).toBe(120);
  });
});
