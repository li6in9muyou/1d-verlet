import { describe, test, expect } from "vitest";
import {
  doCollide,
  doDt,
  doSprings,
  boundLowerAndUpperY,
} from "./verlet-sketch";

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

describe("doCollide - Parameter Order Invariance", () => {
  const TEST_HALF_SIZE = 6;

  // Helper function to create a test box
  const createTestBox = (y, prevY, m, name) => ({
    y,
    prevY,
    m,
    name,
    size: TEST_HALF_SIZE * 2,
  });

  // Test Case 1: Equal masses moving towards each other
  test("should produce same result when parameters are swapped (equal masses)", () => {
    const elapsed = 1;

    // Original order
    const box1_orig = createTestBox(100, 105, 10, "box1_orig");
    const box2_orig = createTestBox(108, 103, 10, "box2_orig");
    doCollide(elapsed, box1_orig, box2_orig);

    // Swapped order
    const box1_swapped = createTestBox(100, 105, 10, "box1_swapped");
    const box2_swapped = createTestBox(108, 103, 10, "box2_swapped");
    doCollide(elapsed, box2_swapped, box1_swapped); // Swapped parameters

    // Expect the final states to be the same for the corresponding boxes
    expect(box1_swapped.y).toBeCloseTo(box1_orig.y);
    expect(box1_swapped.prevY).toBeCloseTo(box1_orig.prevY);
    expect(box2_swapped.y).toBeCloseTo(box2_orig.y);
    expect(box2_swapped.prevY).toBeCloseTo(box2_orig.prevY);
  });

  // Test Case 2: Unequal masses (lighter hits heavier)
  test("should produce same result when parameters are swapped (lighter hits heavier)", () => {
    const elapsed = 1;

    // Original order
    const box1_orig = createTestBox(100, 105, 5, "box1_orig"); // m=5
    const box2_orig = createTestBox(108, 103, 15, "box2_orig"); // m=15
    doCollide(elapsed, box1_orig, box2_orig);

    // Swapped order
    const box1_swapped = createTestBox(100, 105, 5, "box1_swapped");
    const box2_swapped = createTestBox(108, 103, 15, "box2_swapped");
    doCollide(elapsed, box2_swapped, box1_swapped); // Swapped parameters

    // Expect the final states to be the same for the corresponding boxes
    expect(box1_swapped.y).toBeCloseTo(box1_orig.y);
    expect(box1_swapped.prevY).toBeCloseTo(box1_orig.prevY);
    expect(box2_swapped.y).toBeCloseTo(box2_orig.y);
    expect(box2_swapped.prevY).toBeCloseTo(box2_orig.prevY);
  });

  // Test Case 3: Unequal masses (heavier hits lighter)
  test("should produce same result when parameters are swapped (heavier hits lighter)", () => {
    const elapsed = 1;

    // Original order
    const box1_orig = createTestBox(100, 105, 15, "box1_orig"); // m=15
    const box2_orig = createTestBox(108, 103, 5, "box2_orig"); // m=5
    doCollide(elapsed, box1_orig, box2_orig);

    // Swapped order
    const box1_swapped = createTestBox(100, 105, 15, "box1_swapped");
    const box2_swapped = createTestBox(108, 103, 5, "box2_swapped");
    doCollide(elapsed, box2_swapped, box1_swapped); // Swapped parameters

    // Expect the final states to be the same for the corresponding boxes
    expect(box1_swapped.y).toBeCloseTo(box1_orig.y);
    expect(box1_swapped.prevY).toBeCloseTo(box1_orig.prevY);
    expect(box2_swapped.y).toBeCloseTo(box2_orig.y);
    expect(box2_swapped.prevY).toBeCloseTo(box2_orig.prevY);
  });

  // Test Case 4: One stationary (moving hits stationary, equal mass)
  test("should produce same result when parameters are swapped (one stationary, equal mass)", () => {
    const elapsed = 1;

    // Original order
    const box1_orig = createTestBox(100, 105, 10, "box1_orig"); // m=10, v=-5
    const box2_orig = createTestBox(108, 108, 10, "box2_orig"); // m=10, v=0
    doCollide(elapsed, box1_orig, box2_orig);

    // Swapped order
    const box1_swapped = createTestBox(100, 105, 10, "box1_swapped");
    const box2_swapped = createTestBox(108, 108, 10, "box2_swapped");
    doCollide(elapsed, box2_swapped, box1_swapped); // Swapped parameters

    // Expect the final states to be the same for the corresponding boxes
    expect(box1_swapped.y).toBeCloseTo(box1_orig.y);
    expect(box1_swapped.prevY).toBeCloseTo(box1_orig.prevY);
    expect(box2_swapped.y).toBeCloseTo(box2_orig.y);
    expect(box2_swapped.prevY).toBeCloseTo(box2_orig.prevY);
  });

  // Test Case 5: One stationary (moving hits stationary, lighter hits heavier)
  test("should produce same result when parameters are swapped (one stationary, lighter hits heavier)", () => {
    const elapsed = 1;

    // Original order
    const box1_orig = createTestBox(100, 105, 5, "box1_orig"); // m=5, v=-5
    const box2_orig = createTestBox(108, 108, 15, "box2_orig"); // m=15, v=0
    doCollide(elapsed, box1_orig, box2_orig);

    // Swapped order
    const box1_swapped = createTestBox(100, 105, 5, "box1_swapped");
    const box2_swapped = createTestBox(108, 108, 15, "box2_swapped");
    doCollide(elapsed, box2_swapped, box1_swapped); // Swapped parameters

    // Expect the final states to be the same for the corresponding boxes
    expect(box1_swapped.y).toBeCloseTo(box1_orig.y);
    expect(box1_swapped.prevY).toBeCloseTo(box1_orig.prevY);
    expect(box2_swapped.y).toBeCloseTo(box2_orig.y);
    expect(box2_swapped.prevY).toBeCloseTo(box2_orig.prevY);
  });

  // Test Case 6: One stationary (moving hits stationary, heavier hits lighter)
  test("should produce same result when parameters are swapped (one stationary, heavier hits lighter)", () => {
    const elapsed = 1;

    // Original order
    const box1_orig = createTestBox(100, 105, 15, "box1_orig"); // m=15, v=-5
    const box2_orig = createTestBox(108, 108, 5, "box2_orig"); // m=5, v=0
    doCollide(elapsed, box1_orig, box2_orig);

    // Swapped order
    const box1_swapped = createTestBox(100, 105, 15, "box1_swapped");
    const box2_swapped = createTestBox(108, 108, 5, "box2_swapped");
    doCollide(elapsed, box2_swapped, box1_swapped); // Swapped parameters

    // Expect the final states to be the same for the corresponding boxes
    expect(box1_swapped.y).toBeCloseTo(box1_orig.y);
    expect(box1_swapped.prevY).toBeCloseTo(box1_orig.prevY);
    expect(box2_swapped.y).toBeCloseTo(box2_orig.y);
    expect(box2_swapped.prevY).toBeCloseTo(box2_orig.prevY);
  });

  // Test Case 7: Boxes are already separating but still overlapping
  test("should produce same result when parameters are swapped (separating but overlapping)", () => {
    const elapsed = 1;

    // Original order
    const box1_orig = createTestBox(100, 98, 10, "box1_orig"); // v=2
    const box2_orig = createTestBox(108, 110, 10, "box2_orig"); // v=-2
    doCollide(elapsed, box1_orig, box2_orig);

    // Swapped order
    const box1_swapped = createTestBox(100, 98, 10, "box1_swapped");
    const box2_swapped = createTestBox(108, 110, 10, "box2_swapped");
    doCollide(elapsed, box2_swapped, box1_swapped); // Swapped parameters

    // Expect the final states to be the same for the corresponding boxes
    expect(box1_swapped.y).toBeCloseTo(box1_orig.y);
    expect(box1_swapped.prevY).toBeCloseTo(box1_orig.prevY);
    expect(box2_swapped.y).toBeCloseTo(box2_orig.y);
    expect(box2_swapped.prevY).toBeCloseTo(box2_orig.prevY);
  });
});

describe("doSprings", () => {
  // Helper to create a box object for tests
  const createBox = (name, y, m, acc = 0) => ({
    name,
    y,
    prevY: y, // prevY not directly used by doSprings, but good practice
    m,
    acc,
  });

  // Test Case 1: Springs at resting length exert no force and thus no acceleration
  test("should exert no force when spring is at resting length", () => {
    const boxA = createBox("a", 100, 10);
    const boxB = createBox("b", 150, 10); // Distance 50

    const springs = [
      {
        one: "a",
        two: "b",
        k: 0.1,
        restingLen: 50,
      },
    ]; // restingLen matches actualLen

    const initialAccA = boxA.acc;
    const initialAccB = boxB.acc;

    doSprings(springs, [boxA, boxB]);

    expect(boxA.acc).toBeCloseTo(initialAccA);
    expect(boxB.acc).toBeCloseTo(initialAccB);
  });

  // Test Case 2: Springs push or pull boxes depending on whether it's being compressed or extended.

  // Sub-test 2.1: Spring is compressed (boxes are closer than resting length)
  test("should push boxes apart when spring is compressed", () => {
    const boxA = createBox("a", 100, 10);
    const boxB = createBox("b", 140, 10); // Actual length = 40
    const k = 0.1;
    const restingLen = 50;

    const springs = [
      {
        one: "a",
        two: "b",
        k,
        restingLen,
      },
    ];

    const displacement = 40 - 50; // -10 (compressed)
    const expectedForceMagnitude = k * displacement; // 0.1 * -10 = -1

    // ji = i.y - j.y = 100 - 140 = -40
    // iForce = -force * Math.sign(ji) = -(-1) * Math.sign(-40) = 1 * -1 = -1
    // jForce = -iForce = 1

    const expectedAccA = boxA.acc + -1 / boxA.m; // -0.1
    const expectedAccB = boxB.acc + 1 / boxB.m; // 0.1

    doSprings(springs, [boxA, boxB]);

    expect(boxA.acc).toBeCloseTo(expectedAccA); // Box A should be pushed up (negative acc)
    expect(boxB.acc).toBeCloseTo(expectedAccB); // Box B should be pushed down (positive acc)
  });

  // Sub-test 2.2: Spring is extended (boxes are further than resting length)
  test("should pull boxes together when spring is extended", () => {
    const boxA = createBox("a", 100, 10);
    const boxB = createBox("b", 160, 10); // Actual length = 60
    const k = 0.1;
    const restingLen = 50;

    const springs = [
      {
        one: "a",
        two: "b",
        k,
        restingLen,
      },
    ];

    const displacement = 60 - 50; // 10 (extended)
    const expectedForceMagnitude = k * displacement; // 0.1 * 10 = 1

    // ji = i.y - j.y = 100 - 160 = -60
    // iForce = -force * Math.sign(ji) = -(1) * Math.sign(-60) = -1 * -1 = 1
    // jForce = -iForce = -1

    const expectedAccA = boxA.acc + 1 / boxA.m; // 0.1
    const expectedAccB = boxB.acc + -1 / boxB.m; // -0.1

    doSprings(springs, [boxA, boxB]);

    expect(boxA.acc).toBeCloseTo(expectedAccA); // Box A should be pulled down (positive acc)
    expect(boxB.acc).toBeCloseTo(expectedAccB); // Box B should be pulled up (negative acc)
  });

  // Sub-test 2.3: Spring is compressed (box B is above box A)
  test("should push boxes apart when spring is compressed (reversed order)", () => {
    const boxA = createBox("a", 140, 10); // Actual length = 40
    const boxB = createBox("b", 100, 10);
    const k = 0.1;
    const restingLen = 50;

    const springs = [
      {
        one: "a",
        two: "b",
        k,
        restingLen,
      },
    ];

    const displacement = 40 - 50; // -10 (compressed)
    const expectedForceMagnitude = k * displacement; // 0.1 * -10 = -1

    // ji = i.y - j.y = 140 - 100 = 40
    // iForce = -force * Math.sign(ji) = -(-1) * Math.sign(40) = 1 * 1 = 1
    // jForce = -iForce = -1

    const expectedAccA = boxA.acc + 1 / boxA.m; // 0.1
    const expectedAccB = boxB.acc + -1 / boxB.m; // -0.1

    doSprings(springs, [boxA, boxB]);

    expect(boxA.acc).toBeCloseTo(expectedAccA); // Box A should be pushed down (positive acc)
    expect(boxB.acc).toBeCloseTo(expectedAccB); // Box B should be pushed up (negative acc)
  });

  // Sub-test 2.4: Spring is extended (box B is above box A)
  test("should pull boxes together when spring is extended (reversed order)", () => {
    const boxA = createBox("a", 160, 10); // Actual length = 60
    const boxB = createBox("b", 100, 10);
    const k = 0.1;
    const restingLen = 50;

    const springs = [
      {
        one: "a",
        two: "b",
        k,
        restingLen,
      },
    ];

    const displacement = 60 - 50; // 10 (extended)
    const expectedForceMagnitude = k * displacement; // 0.1 * 10 = 1

    // ji = i.y - j.y = 160 - 100 = 60
    // iForce = -force * Math.sign(ji) = -(1) * Math.sign(60) = -1 * 1 = -1
    // jForce = -iForce = 1

    const expectedAccA = boxA.acc + -1 / boxA.m; // -0.1
    const expectedAccB = boxB.acc + 1 / boxB.m; // 0.1

    doSprings(springs, [boxA, boxB]);

    expect(boxA.acc).toBeCloseTo(expectedAccA); // Box A should be pulled up (negative acc)
    expect(boxB.acc).toBeCloseTo(expectedAccB); // Box B should be pulled down (positive acc)
  });

  test("should handle multiple springs and different masses", () => {
    const boxA = createBox("a", 100, 5); // Lighter
    const boxB = createBox("b", 120, 10); // Heavier
    const boxC = createBox("c", 150, 15); // Heaviest

    const springs = [
      {
        one: "a",
        two: "b",
        k: 0.2,
        restingLen: 10,
      }, // Compressed: actual=20, rest=10 => disp=10. Force=0.2*10=2.
      {
        one: "b",
        two: "c",
        k: 0.3,
        restingLen: 40,
      }, // Extended: actual=30, rest=40 => disp=10. Force=0.3*10=3.
    ];

    const expectedAccA = 0.4;
    const expectedAccB = -0.5;
    const expectedAccC = 0.2;

    doSprings(springs, [boxA, boxB, boxC]);

    expect(boxA.acc).toBeCloseTo(expectedAccA);
    expect(boxB.acc).toBeCloseTo(expectedAccB);
    expect(boxC.acc).toBeCloseTo(expectedAccC);
  });
});

describe("doSprings - 3 boxes, 2 springs", () => {
  // Helper to create a box object for tests
  const createBox = (name, y, m, acc = 0) => ({
    name,
    y,
    prevY: y, // prevY not directly used by doSprings, but good practice
    m,
    acc,
  });

  // Test Case 1: One spring at resting length, another compressed
  test("should handle one resting and one compressed spring", () => {
    const boxA = createBox("a", 100, 10);
    const boxB = createBox("b", 150, 10);
    const boxC = createBox("c", 180, 10);

    const springs = [
      {
        one: "a",
        two: "b",
        k: 0.1,
        restingLen: 50,
      }, // Actual 50, Resting 50 => Displacement 0
      {
        one: "b",
        two: "c",
        k: 0.2,
        restingLen: 40,
      }, // Actual 30, Resting 40 => Displacement -10 (compressed)
    ];

    // Calculations:
    // Spring A-B: Force = 0.1 * (50 - 50) = 0. Accel = 0 for A and B.
    // Spring B-C:
    //   ji = boxB.y - boxC.y = 150 - 180 = -30
    //   actualLen = 30, restingLen = 40, displacement = 30 - 40 = -10
    //   forceMagnitude = 0.2 * -10 = -2
    //   iForce (on B) = -(-2) * Math.sign(-30) = 2 * -1 = -2
    //   jForce (on C) = -iForce = 2
    //   accB_from_BC = -2 / 10 = -0.2
    //   accC_from_BC = 2 / 10 = 0.2

    // Total Accelerations:
    // boxA.acc = 0
    // boxB.acc = 0 + (-0.2) = -0.2
    // boxC.acc = 0.2

    const expectedAccA = 0;
    const expectedAccB = -0.2;
    const expectedAccC = 0.2;

    doSprings(springs, [boxA, boxB, boxC]);

    expect(boxA.acc).toBeCloseTo(expectedAccA);
    expect(boxB.acc).toBeCloseTo(expectedAccB);
    expect(boxC.acc).toBeCloseTo(expectedAccC);
  });

  // Test Case 2: One spring at resting length, another extended
  test("should handle one resting and one extended spring", () => {
    const boxA = createBox("a", 100, 10);
    const boxB = createBox("b", 150, 10);
    const boxC = createBox("c", 220, 10);

    const springs = [
      {
        one: "a",
        two: "b",
        k: 0.1,
        restingLen: 50,
      }, // Actual 50, Resting 50 => Displacement 0
      {
        one: "b",
        two: "c",
        k: 0.2,
        restingLen: 60,
      }, // Actual 70, Resting 60 => Displacement 10 (extended)
    ];

    // Calculations:
    // Spring A-B: Force = 0. Accel = 0 for A and B.
    // Spring B-C:
    //   ji = boxB.y - boxC.y = 150 - 220 = -70
    //   actualLen = 70, restingLen = 60, displacement = 70 - 60 = 10
    //   forceMagnitude = 0.2 * 10 = 2
    //   iForce (on B) = -2 * Math.sign(-70) = -2 * -1 = 2
    //   jForce (on C) = -iForce = -2
    //   accB_from_BC = 2 / 10 = 0.2
    //   accC_from_BC = -2 / 10 = -0.2

    // Total Accelerations:
    // boxA.acc = 0
    // boxB.acc = 0 + 0.2 = 0.2
    // boxC.acc = -0.2

    const expectedAccA = 0;
    const expectedAccB = 0.2;
    const expectedAccC = -0.2;

    doSprings(springs, [boxA, boxB, boxC]);

    expect(boxA.acc).toBeCloseTo(expectedAccA);
    expect(boxB.acc).toBeCloseTo(expectedAccB);
    expect(boxC.acc).toBeCloseTo(expectedAccC);
  });

  // Test Case 3: Both springs are at resting length
  test("should exert no force when both springs are at resting length", () => {
    const boxA = createBox("a", 100, 10);
    const boxB = createBox("b", 150, 10);
    const boxC = createBox("c", 200, 10);

    const springs = [
      {
        one: "a",
        two: "b",
        k: 0.1,
        restingLen: 50,
      }, // Actual 50, Resting 50 => Displacement 0
      {
        one: "b",
        two: "c",
        k: 0.2,
        restingLen: 50,
      }, // Actual 50, Resting 50 => Displacement 0
    ];

    // Calculations:
    // Spring A-B: Force = 0. Accel = 0 for A and B.
    // Spring B-C: Force = 0. Accel = 0 for B and C.

    // Total Accelerations:
    // boxA.acc = 0
    // boxB.acc = 0
    // boxC.acc = 0

    const expectedAccA = 0;
    const expectedAccB = 0;
    const expectedAccC = 0;

    doSprings(springs, [boxA, boxB, boxC]);

    expect(boxA.acc).toBeCloseTo(expectedAccA);
    expect(boxB.acc).toBeCloseTo(expectedAccB);
    expect(boxC.acc).toBeCloseTo(expectedAccC);
  });
});
