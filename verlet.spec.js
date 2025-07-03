import { describe, test, expect, beforeAll } from "vitest";
import { boundLowerAndUppserY } from "./verlet-sketch";

beforeAll(() => {
  global.window = {};
});

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
    boundLowerAndUppserY(box, TEST_LOWER, TEST_UPPER);
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
    boundLowerAndUppserY(box, TEST_LOWER, TEST_UPPER);
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
    boundLowerAndUppserY(box, TEST_LOWER, TEST_UPPER);
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
    boundLowerAndUppserY(box, TEST_LOWER, TEST_UPPER);
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
    boundLowerAndUppserY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_UPPER - TEST_HALF_SIZE);
    expect(box.prevY).toBe(box.y + initialV);
  });

  test("should not change position if at lower bound and moving away", () => {
    const box = {
      y: TEST_LOWER + TEST_HALF_SIZE,
      prevY: TEST_LOWER + TEST_HALF_SIZE - 5,
      size: TEST_HALF_SIZE * 2,
    };
    boundLowerAndUppserY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_LOWER + TEST_HALF_SIZE);
    expect(box.prevY).toBe(TEST_LOWER + TEST_HALF_SIZE - 5);
  });

  test("should not change position if at upper bound and moving away", () => {
    const box = {
      y: TEST_UPPER - TEST_HALF_SIZE,
      prevY: TEST_UPPER - TEST_HALF_SIZE + 5,
      size: TEST_HALF_SIZE * 2,
    };
    boundLowerAndUppserY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_UPPER - TEST_HALF_SIZE);
    expect(box.prevY).toBe(TEST_UPPER - TEST_HALF_SIZE + 5);
  });

  test("should handle zero velocity at lower bound", () => {
    const box = {
      y: TEST_LOWER + TEST_HALF_SIZE,
      prevY: TEST_LOWER + TEST_HALF_SIZE,
      size: TEST_HALF_SIZE * 2,
    };
    boundLowerAndUppserY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_LOWER + TEST_HALF_SIZE);
    expect(box.prevY).toBe(TEST_LOWER + TEST_HALF_SIZE);
  });

  test("should handle zero velocity at upper bound", () => {
    const box = {
      y: TEST_UPPER - TEST_HALF_SIZE,
      prevY: TEST_UPPER - TEST_HALF_SIZE,
      size: TEST_HALF_SIZE * 2,
    };
    boundLowerAndUppserY(box, TEST_LOWER, TEST_UPPER);
    expect(box.y).toBe(TEST_UPPER - TEST_HALF_SIZE);
    expect(box.prevY).toBe(TEST_UPPER - TEST_HALF_SIZE);
  });
});
