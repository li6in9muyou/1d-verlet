import { describe, test, expect } from "vitest";
import { afterMove } from "./ii-verlet";

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
        s = afterMove(s);
      }

      const expectedY = START_Y + START_V * T + 0.5 * acc * T * T;
      expect(s.boxes[0].y).toBeCloseTo(expectedY, 0);
    },
  );
});
