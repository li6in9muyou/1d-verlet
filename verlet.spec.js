import { describe, test, expect } from "vitest";
import { doCollide, doDt, boundLowerAndUpperY } from "./verlet-sketch";

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

describe("doCollide", () => {
  const TEST_HALF_SIZE = 6;

  // Helper function to create a test box
  const createTestBox = (y, prevY, m, name) => ({
    y,
    prevY,
    m,
    name,
    size: TEST_HALF_SIZE * 2,
  });

  test("should do nothing if boxes are not colliding", () => {
    const box1 = createTestBox(100, 90, 10, "box1");
    const box2 = createTestBox(200, 190, 10, "box2");
    const elapsed = 1;

    const initialBox1 = { ...box1 };
    const initialBox2 = { ...box2 };

    doCollide(elapsed, box1, box2);

    expect(box1.y).toBeCloseTo(initialBox1.y);
    expect(box1.prevY).toBeCloseTo(initialBox1.prevY);
    expect(box2.y).toBeCloseTo(initialBox2.y);
    expect(box2.prevY).toBeCloseTo(initialBox2.prevY);
  });

  test("should resolve collision and update velocities for equal masses moving towards each other", () => {
    const box1 = createTestBox(100, 105, 10, "box1"); // y=100, prevY=105 => moving up (velocity = -5)
    const box2 = createTestBox(108, 103, 10, "box2"); // y=108, prevY=103 => moving down (velocity = 5)
    const elapsed = 1;

    // Initial overlap: (108 - 100) - 2 * 6 = 8 - 12 = -4 (overlap of 4)
    // Expected velocities after elastic collision (equal masses, swap velocities):
    // box1_next_v = 5
    // box2_next_v = -5

    doCollide(elapsed, box1, box2);

    // After collision, box1 should move down, box2 should move up
    // The overlap resolution pushes them apart first.
    // Overlap = 4. Push per box = 4 / (10+10) * 10 = 2
    // box1.y should be 100 - 2 = 98 (since box1.y < box2.y, box1 moves up)
    // box2.y should be 108 + 2 = 110 (since box1.y < box2.y, box2 moves down)

    // Then prevY is set based on the new velocities
    // box1.prevY = box1.y - box1_next_v * elapsed = 98 - 5 * 1 = 93
    // box2.prevY = box2.y - box2_next_v * elapsed = 110 - (-5) * 1 = 115

    expect(box1.y).toBeCloseTo(98);
    expect(box1.prevY).toBeCloseTo(93);
    expect(box2.y).toBeCloseTo(110);
    expect(box2.prevY).toBeCloseTo(115);
  });

  test("should resolve collision for unequal masses (lighter hits heavier)", () => {
    const box1 = createTestBox(100, 105, 5, "box1"); // m=5, v=-5
    const box2 = createTestBox(108, 103, 15, "box2"); // m=15, v=5
    const elapsed = 1;

    // Initial overlap: 4
    // v1_initial = -5, v2_initial = 5
    // v1_final = ((-5)*(5-15) + 2*15*5) / (5+15) = ((-5)*(-10) + 150) / 20 = (50 + 150) / 20 = 200 / 20 = 10
    // v2_final = ((5)*(15-5) + 2*5*(-5)) / (5+15) = (5*10 - 50) / 20 = (50 - 50) / 20 = 0

    doCollide(elapsed, box1, box2);

    // Overlap = 4. totalMass = 20
    // iPush (for box1) = (4 * 15) / 20 = 60 / 20 = 3
    // jPush (for box2) = (4 * 5) / 20 = 20 / 20 = 1
    // box1.y should be 100 - 3 = 97
    // box2.y should be 108 + 1 = 109

    // box1.prevY = box1.y - v1_final * elapsed = 97 - 10 * 1 = 87
    // box2.prevY = box2.y - v2_final * elapsed = 109 - 0 * 1 = 109

    expect(box1.y).toBeCloseTo(97);
    expect(box1.prevY).toBeCloseTo(87);
    expect(box2.y).toBeCloseTo(109);
    expect(box2.prevY).toBeCloseTo(109);
  });

  test("should resolve collision for unequal masses (heavier hits lighter)", () => {
    const box1 = createTestBox(100, 105, 15, "box1"); // m=15, v=-5
    const box2 = createTestBox(108, 103, 5, "box2"); // m=5, v=5
    const elapsed = 1;

    // Initial overlap: 4
    // v1_initial = -5, v2_initial = 5
    // v1_final = ((-5)*(15-5) + 2*5*5) / (15+5) = ((-5)*10 + 50) / 20 = (-50 + 50) / 20 = 0
    // v2_final = ((5)*(5-15) + 2*15*(-5)) / (15+5) = (5*(-10) - 150) / 20 = (-50 - 150) / 20 = -200 / 20 = -10

    doCollide(elapsed, box1, box2);

    // Overlap = 4. totalMass = 20
    // iPush (for box1) = (4 * 5) / 20 = 1
    // jPush (for box2) = (4 * 15) / 20 = 3
    // box1.y should be 100 - 1 = 99
    // box2.y should be 108 + 3 = 111

    // box1.prevY = box1.y - v1_final * elapsed = 99 - 0 * 1 = 99
    // box2.prevY = box2.y - v2_final * elapsed = 111 - (-10) * 1 = 121

    expect(box1.y).toBeCloseTo(99);
    expect(box1.prevY).toBeCloseTo(99);
    expect(box2.y).toBeCloseTo(111);
    expect(box2.prevY).toBeCloseTo(121);
  });

  test("should resolve collision when one box is stationary (moving hits stationary, equal mass)", () => {
    const box1 = createTestBox(100, 105, 10, "box1"); // m=10, v=-5
    const box2 = createTestBox(108, 108, 10, "box2"); // m=10, v=0
    const elapsed = 1;

    // Initial overlap: 4
    // v1_initial = -5, v2_initial = 0
    // v1_final = ((-5)*(10-10) + 2*10*0) / (10+10) = 0 / 20 = 0
    // v2_final = ((0)*(10-10) + 2*10*(-5)) / (10+10) = -100 / 20 = -5

    doCollide(elapsed, box1, box2);

    // Overlap = 4. totalMass = 20
    // iPush (for box1) = (4 * 10) / 20 = 2
    // jPush (for box2) = (4 * 10) / 20 = 2
    // box1.y should be 100 - 2 = 98
    // box2.y should be 108 + 2 = 110

    // box1.prevY = box1.y - v1_final * elapsed = 98 - 0 * 1 = 98
    // box2.prevY = box2.y - v2_final * elapsed = 110 - (-5) * 1 = 115

    expect(box1.y).toBeCloseTo(98);
    expect(box1.prevY).toBeCloseTo(98);
    expect(box2.y).toBeCloseTo(110);
    expect(box2.prevY).toBeCloseTo(115);
  });

  test("should resolve collision when one box is stationary (moving hits stationary, lighter hits heavier)", () => {
    const box1 = createTestBox(100, 105, 5, "box1"); // m=5, v=-5
    const box2 = createTestBox(108, 108, 15, "box2"); // m=15, v=0
    const elapsed = 1;

    // Initial overlap: 4
    // v1_initial = -5, v2_initial = 0
    // v1_final = ((-5)*(5-15) + 2*15*0) / (5+15) = ((-5)*(-10)) / 20 = 50 / 20 = 2.5
    // v2_final = ((0)*(15-5) + 2*5*(-5)) / (5+15) = -50 / 20 = -2.5

    doCollide(elapsed, box1, box2);

    // Overlap = 4. totalMass = 20
    // iPush (for box1) = (4 * 15) / 20 = 3
    // jPush (for box2) = (4 * 5) / 20 = 1
    // box1.y should be 100 - 3 = 97
    // box2.y should be 108 + 1 = 109

    // box1.prevY = box1.y - v1_final * elapsed = 97 - 2.5 * 1 = 94.5
    // box2.prevY = box2.y - v2_final * elapsed = 109 - (-2.5) * 1 = 111.5

    expect(box1.y).toBeCloseTo(97);
    expect(box1.prevY).toBeCloseTo(94.5);
    expect(box2.y).toBeCloseTo(109);
    expect(box2.prevY).toBeCloseTo(111.5);
  });

  test("should resolve collision when one box is stationary (moving hits stationary, heavier hits lighter)", () => {
    const box1 = createTestBox(100, 105, 15, "box1"); // m=15, v=-5
    const box2 = createTestBox(108, 108, 5, "box2"); // m=5, v=0
    const elapsed = 1;

    // Initial overlap: 4
    // v1_initial = -5, v2_initial = 0
    // v1_final = ((-5)*(15-5) + 2*5*0) / (15+5) = ((-5)*10) / 20 = -50 / 20 = -2.5
    // v2_final = ((0)*(5-15) + 2*15*(-5)) / (15+5) = -150 / 20 = -7.5

    doCollide(elapsed, box1, box2);

    // Overlap = 4. totalMass = 20
    // iPush (for box1) = (4 * 5) / 20 = 1
    // jPush (for box2) = (4 * 15) / 20 = 3
    // box1.y should be 100 - 1 = 99
    // box2.y should be 108 + 3 = 111

    // box1.prevY = box1.y - v1_final * elapsed = 99 - (-2.5) * 1 = 101.5
    // box2.prevY = box2.y - v2_final * elapsed = 111 - (-7.5) * 1 = 118.5

    expect(box1.y).toBeCloseTo(99);
    expect(box1.prevY).toBeCloseTo(101.5);
    expect(box2.y).toBeCloseTo(111);
    expect(box2.prevY).toBeCloseTo(118.5);
  });

  test("should handle collision where boxes are already separating but still overlapping", () => {
    const box1 = createTestBox(100, 98, 10, "box1"); // y=100, prevY=98 => v=2 (moving down)
    const box2 = createTestBox(108, 110, 10, "box2"); // y=108, prevY=110 => v=-2 (moving up)
    const elapsed = 1;

    // Initial overlap: (108 - 100) - 12 = -4 (overlap of 4)
    // They are moving apart, but the current `doCollide` will still apply push.
    // v1_initial = 2, v2_initial = -2
    // v1_final = ((2)*(10-10) + 2*10*(-2)) / (10+10) = -40 / 20 = -2
    // v2_final = ((-2)*(10-10) + 2*10*2) / (10+10) = 40 / 20 = 2

    doCollide(elapsed, box1, box2);

    // Overlap = 4. Push per box = 2
    // box1.y should be 100 - 2 = 98 (since box1.y < box2.y, box1 moves up)
    // box2.y should be 108 + 2 = 110 (since box1.y < box2.y, box2 moves down)

    // box1.prevY = box1.y - v1_final * elapsed = 98 - (-2) * 1 = 100
    // box2.prevY = box2.y - v2_final * elapsed = 110 - 2 * 1 = 108

    expect(box1.y).toBeCloseTo(98);
    expect(box1.prevY).toBeCloseTo(100);
    expect(box2.y).toBeCloseTo(110);
    expect(box2.prevY).toBeCloseTo(108);
  });
});
