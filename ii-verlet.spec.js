import {
  afterCrashing,
  afterHittingWall,
  afterMoving,
  getV,
} from "./ii-verlet";
import { describe, expect, test } from "vitest";
import { getV, yv } from "./ii-utils";

describe("afterMove", () => {
  const START_Y = 300;
  const T = 10;
  const dt = 1 / 3000;
  const steps = T / dt;

  const startSpeeds = [0, 1, 5, 10, 50, 70, 100];
  const accelerations = [
    100, 70, 50, 40, 30, 20, 10, 5, 2, 1, 0, 1e-1, 1e-2, 1e-3, 1e-4,
  ];

  // Generate all test combinations
  const testCases = startSpeeds.flatMap((START_V) =>
    accelerations.map((acc) => ({ START_V, acc })),
  );

  test.each(testCases)(
    "basic movement: START_V=$START_V acc=$acc",
    ({ START_V, acc }) => {
      let s = {
        dt,
        boxes: [
          {
            prevY: START_Y - START_V * dt,
            y: START_Y,
            acc,
          },
        ],
      };

      for (let i = 0; i < steps; i++) {
        s = afterMoving(s);
      }

      const expectedY = START_Y + START_V * T + 0.5 * acc * T * T;
      expect(s.boxes[0].y).toBeCloseTo(expectedY, 0);
    },
  );
});

describe("afterHittingWall", () => {
  const testCases = [
    {
      v: -10,
      y: 12,
      expected: {
        v: 10,
        y: 20,
      },
    },
    {
      v: 10,
      y: 50,
      expected: {
        v: 10,
        y: 50,
      },
    },
    {
      v: 10,
      y: 99,
      expected: {
        v: -10,
        y: 89,
      },
    },
    {
      v: -10,
      y: 94,
      expected: {
        v: -10,
        y: 94,
      },
    },
    {
      v: -10,
      y: 6,
      expected: {
        v: 10,
        y: 26,
      },
    },
    {
      v: -10,
      y: 16,
      expected: {
        v: -10,
        y: 16,
      },
    },
    {
      v: 10,
      y: 94,
      expected: {
        v: 10,
        y: 94,
      },
    },
    {
      v: 10,
      y: 104,
      expected: {
        v: -10,
        y: 84,
      },
    },
  ];

  test.each(testCases)(
    "basic movement: v=$v y=$y",
    ({ y, v, expected: exp }) => {
      const s = afterHittingWall({
        MIN_Y: 10,
        MAX_Y: 100,
        boxes: [yv(y, v)],
        sizes: [12],
      });

      expect(s.boxes[0].y).toBeCloseTo(exp.y, 0);
      expect(getV(s.boxes[0])).toBeCloseTo(exp.v, 0);
    },
  );
});

describe("afterCrashing", () => {
  const testCases = [
    {
      what: "head-on, different y",
      pair: [yv(100, 10), yv(106, -10)],
      expected: [
        { y: 100 - 3, v: -10 },
        { y: 106 + 3, v: 10 },
      ],
    },
    {
      what: "head-on, same y",
      pair: [yv(100, 10), yv(100, -10)],
      expected: [
        { y: 100 - 6, v: -10 },
        { y: 100 + 6, v: 10 },
      ],
    },
    {
      what: "rear-end crashing",
      pair: [yv(100, 5), yv(95, 10)],
      expected: [
        { y: 100 + 7 / 3, v: 10 },
        { y: 95 - 2 * (7 / 3), v: 5 },
      ],
    },
    {
      what: "just touching",
      pair: [yv(112, 10), yv(100, 10)],
      expected: [
        { y: 112, v: 10 },
        { y: 100, v: 10 },
      ],
    },
    {
      what: "no crashing",
      pair: [yv(120, 10), yv(100, 10)],
      expected: [
        { y: 120, v: 10 },
        { y: 100, v: 10 },
      ],
    },
  ];

  test.each(testCases)("$what", ({ pair, expected: exp }) => {
    const s = afterCrashing({
      MIN_Y: 10,
      MAX_Y: 100,
      boxes: [...pair],
      sizes: [12, 12],
      masses: [10, 10],
    });

    expect(s.boxes[0].y).toBeCloseTo(exp[0].y, 0);
    expect(getV(s.boxes[0])).toBeCloseTo(exp[0].v, 0);
    expect(s.boxes[1].y).toBeCloseTo(exp[1].y, 0);
    expect(getV(s.boxes[1])).toBeCloseTo(exp[1].v, 0);
  });
});
