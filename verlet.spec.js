import { describe, test, expect } from "vitest";
import { doDt, boundLowerAndUpperY } from "./verlet-sketch";

describe("boundLowerAndUppserY", () => {
  const TEST_HALF_SIZE = 6;
  const TEST_LOWER = 0;
  const TEST_UPPER = 600;

  test("should not change box position if well within bounds", () => {
    const box = {
      y: 300,
      prevY: 295,
      size: TEST_HALF_SIZE * 2,
    };
    boundLowerAndUpperY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(300);
    expect(box.prevY).toBe(295);
  });

  test("should snap box to lower bound if it penetrates from above", () => {
    const box = {
      y: TEST_LOWER + TEST_HALF_SIZE - 2,
      prevY: TEST_LOWER + TEST_HALF_SIZE + 3,
      size: TEST_HALF_SIZE * 2,
    };
    const initialV = box.y - box.prevY;
    boundLowerAndUpperY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_LOWER + TEST_HALF_SIZE);
    expect(box.prevY).toBe(box.y + initialV);
  });

  test("should snap box to upper bound if it penetrates from below", () => {
    const box = {
      y: TEST_UPPER - TEST_HALF_SIZE + 2,
      prevY: TEST_UPPER - TEST_HALF_SIZE - 3,
      size: TEST_HALF_SIZE * 2,
    };
    const initialV = box.y - box.prevY;
    boundLowerAndUpperY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_UPPER - TEST_HALF_SIZE);
    expect(box.prevY).toBe(box.y + initialV);
  });

  test("should snap box to lower bound if it starts below the bound", () => {
    const box = {
      y: TEST_LOWER - 10,
      prevY: TEST_LOWER - 15,
      size: TEST_HALF_SIZE * 2,
    };
    const initialV = box.y - box.prevY;
    boundLowerAndUpperY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_LOWER + TEST_HALF_SIZE);
    expect(box.prevY).toBe(box.y + initialV);
  });

  test("should snap box to upper bound if it starts above the bound", () => {
    const box = {
      y: TEST_UPPER + 10,
      prevY: TEST_UPPER + 15,
      size: TEST_HALF_SIZE * 2,
    };
    const initialV = box.y - box.prevY;
    boundLowerAndUpperY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_UPPER - TEST_HALF_SIZE);
    expect(box.prevY).toBe(box.y + initialV);
  });

  test("should not change position if at lower bound and moving away", () => {
    const box = {
      y: TEST_LOWER + TEST_HALF_SIZE,
      prevY: TEST_LOWER + TEST_HALF_SIZE - 5,
      size: TEST_HALF_SIZE * 2,
    };
    boundLowerAndUpperY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_LOWER + TEST_HALF_SIZE);
    expect(box.prevY).toBe(TEST_LOWER + TEST_HALF_SIZE - 5);
  });

  test("should not change position if at upper bound and moving away", () => {
    const box = {
      y: TEST_UPPER - TEST_HALF_SIZE,
      prevY: TEST_UPPER - TEST_HALF_SIZE + 5,
      size: TEST_HALF_SIZE * 2,
    };
    boundLowerAndUpperY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_UPPER - TEST_HALF_SIZE);
    expect(box.prevY).toBe(TEST_UPPER - TEST_HALF_SIZE + 5);
  });

  test("should handle zero velocity at lower bound", () => {
    const box = {
      y: TEST_LOWER + TEST_HALF_SIZE,
      prevY: TEST_LOWER + TEST_HALF_SIZE,
      size: TEST_HALF_SIZE * 2,
    };
    boundLowerAndUpperY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_LOWER + TEST_HALF_SIZE);
    expect(box.prevY).toBe(TEST_LOWER + TEST_HALF_SIZE);
  });

  test("should handle zero velocity at upper bound", () => {
    const box = {
      y: TEST_UPPER - TEST_HALF_SIZE,
      prevY: TEST_UPPER - TEST_HALF_SIZE,
      size: TEST_HALF_SIZE * 2,
    };
    boundLowerAndUpperY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_UPPER - TEST_HALF_SIZE);
    expect(box.prevY).toBe(TEST_UPPER - TEST_HALF_SIZE);
  });
});

describe("doDt", () => {
  test("should correctly update position for a stationary box with zero acceleration", () => {
    const box = {
      prevY: 100,
      y: 100,
      acc: 0,
    };
    const elapsed = 1;
    doDt(elapsed, box);
    expect(box.y).toBeCloseTo(100);
    expect(box.prevY).toBeCloseTo(100);
  });

  test("should correctly update position for a box with constant velocity (zero acceleration)", () => {
    const box = {
      prevY: 90,
      y: 100,
      acc: 0,
    }; // Initial velocity: (100 - 90) / 1 = 10 units/elapsed
    const elapsed = 1;
    doDt(elapsed, box);
    // nextY = 2 * 100 - 90 + 0 * 1 * 1 = 200 - 90 = 110
    // box.prevY becomes old box.y (100)
    // box.y becomes nextY (110)
    expect(box.y).toBeCloseTo(110);
    expect(box.prevY).toBeCloseTo(100);
  });

  test("should correctly update position for a box with positive acceleration", () => {
    const box = {
      prevY: 100,
      y: 100,
      acc: 10,
    }; // Starts stationary, accelerates downwards
    const elapsed = 1;
    doDt(elapsed, box);
    // nextY = 2 * 100 - 100 + 10 * 1 * 1 = 100 + 10 = 110
    expect(box.y).toBeCloseTo(110);
    expect(box.prevY).toBeCloseTo(100);

    // After another step
    doDt(elapsed, box);
    // nextY = 2 * 110 - 100 + 10 * 1 * 1 = 220 - 100 + 10 = 130
    expect(box.y).toBeCloseTo(130);
    expect(box.prevY).toBeCloseTo(110);
  });

  test("should correctly update position for a box with negative acceleration", () => {
    const box = {
      prevY: 100,
      y: 100,
      acc: -5,
    }; // Starts stationary, accelerates upwards
    const elapsed = 1;
    doDt(elapsed, box);
    // nextY = 2 * 100 - 100 + (-5) * 1 * 1 = 100 - 5 = 95
    expect(box.y).toBeCloseTo(95);
    expect(box.prevY).toBeCloseTo(100);

    // After another step
    doDt(elapsed, box);
    // nextY = 2 * 95 - 100 + (-5) * 1 * 1 = 190 - 100 - 5 = 85
    expect(box.y).toBeCloseTo(85);
    expect(box.prevY).toBeCloseTo(95);
  });

  test("should handle different elapsed times", () => {
    const box = {
      prevY: 100,
      y: 100,
      acc: 10,
    };
    const elapsed = 0.5; // Half the elapsed time
    doDt(elapsed, box);
    // nextY = 2 * 100 - 100 + 10 * 0.5 * 0.5 = 100 + 10 * 0.25 = 100 + 2.5 = 102.5
    expect(box.y).toBeCloseTo(102.5);
    expect(box.prevY).toBeCloseTo(100);
  });

  test("should maintain velocity if acceleration is zero and elapsed is large", () => {
    const box = {
      prevY: 0,
      y: 10,
      acc: 0,
    }; // Velocity = 10
    const elapsed = 5;
    doDt(elapsed, box);
    // nextY = 2 * 10 - 0 + 0 * 5 * 5 = 20
    expect(box.y).toBeCloseTo(20);
    expect(box.prevY).toBeCloseTo(10);
  });
});
