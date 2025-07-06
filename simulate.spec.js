import { describe, beforeEach, afterEach, test, expect } from "vitest";
import {
  runSimulationStep,
  getStats,
  WORLD,
  SIM_CONFIG,
} from "./verlet-sketch";

describe("End-to-End Tests for runSimulationStep", () => {
  let originalWorld;

  beforeEach(() => {
    // Make a deep copy of the original WORLD object
    originalWorld = JSON.parse(JSON.stringify(WORLD));
  });

  afterEach(() => {
    // Restore the original WORLD object after each test
    Object.assign(WORLD, originalWorld);
  });

  const runStepsAndAssert = (world, config, assertions) => {
    let initialTotalEnergy;
    for (let step = 0; step < 10000; step++) {
      runSimulationStep(world, config);
      const stats = getStats(world.boxes, world.springs);
      if (step === 0) {
        initialTotalEnergy = stats.totalEnergy;
      }
      // General assertion: total energy stays the same
      expect(stats.totalEnergy).toBeCloseTo(initialTotalEnergy, 5);
      assertions(world, stats);
    }
  };

  // Case 1: one box bouncing between lower and upper bounds
  test("One box bouncing between lower and upper bounds", () => {
    WORLD.boxes = [
      {
        color: "#f0f",
        prevY: 50,
        y: 50,
        acc: 0,
        m: 10,
        name: "d",
        halfSize: 6,
      },
    ];
    WORLD.boxes.forEach((box) => (box.size = box.halfSize * 2));
    WORLD.springs = [];
    WORLD.rods = [];
    WORLD.MIN_Y = 0;
    WORLD.MAX_Y = 600;

    const assertions = (world, stats) => {
      const box = world.boxes[0];
      const sizeToCenter = box.size / 2;
      expect(box.y).toBeGreaterThanOrEqual(WORLD.MIN_Y + sizeToCenter);
      expect(box.y).toBeLessThanOrEqual(WORLD.MAX_Y - sizeToCenter);
    };

    runStepsAndAssert(WORLD, SIM_CONFIG, assertions);
  });

  // Case 2: two boxes of same mass, one starts stationary and one starts with speed of ten
  test("Two boxes of same mass, one stationary and one with speed of ten", () => {
    WORLD.boxes = [
      {
        color: "#f0f",
        prevY: 50,
        y: 60,
        acc: 0,
        m: 10,
        name: "d",
        halfSize: 6,
      },
      {
        color: "#0ff",
        prevY: 100,
        y: 100,
        acc: 0,
        m: 10,
        name: "c",
        halfSize: 6,
      },
    ];
    WORLD.boxes.forEach((box) => (box.size = box.halfSize * 2));
    WORLD.springs = [];
    WORLD.rods = [];
    WORLD.MIN_Y = 0;
    WORLD.MAX_Y = 600;

    const assertions = (world, stats) => {
      const v1 = world.boxes[0].y - world.boxes[0].prevY;
      const v2 = world.boxes[1].y - world.boxes[1].prevY;
      expect(v1 === 0 || v2 === 0).toBe(true);
    };

    runStepsAndAssert(WORLD, SIM_CONFIG, assertions);
  });

  // Case 3: two boxes of same mass that are connected with a spring
  test("Two boxes of same mass connected with a spring", () => {
    WORLD.boxes = [
      {
        color: "#f0f",
        prevY: 50,
        y: 60,
        acc: 0,
        m: 10,
        name: "d",
        halfSize: 6,
      },
      {
        color: "#0ff",
        prevY: 100,
        y: 100,
        acc: 0,
        m: 10,
        name: "c",
        halfSize: 6,
      },
    ];
    WORLD.boxes.forEach((box) => (box.size = box.halfSize * 2));
    WORLD.springs = [
      {
        one: "d",
        two: "c",
        restingLen: 40,
        k: 0.1,
      },
    ];
    WORLD.rods = [];
    WORLD.MIN_Y = 0;
    WORLD.MAX_Y = 600;

    const assertions = () => {}; // No specific additional assertions for now

    runStepsAndAssert(WORLD, SIM_CONFIG, assertions);
  });

  // Case 4: Newton's cradle
  test("Newton's cradle", () => {
    WORLD.boxes = [
      {
        color: "#f0f",
        prevY: 50,
        y: 60,
        acc: 0,
        m: 10,
        name: "a",
        halfSize: 6,
      },
      {
        color: "#0ff",
        prevY: 100,
        y: 100,
        acc: 0,
        m: 10,
        name: "b",
        halfSize: 6,
      },
      {
        color: "red",
        prevY: 100,
        y: 100,
        acc: 0,
        m: 10,
        name: "c",
        halfSize: 6,
      },
      {
        color: "green",
        prevY: 100,
        y: 100,
        acc: 0,
        m: 10,
        name: "d",
        halfSize: 6,
      },
      {
        color: "blue",
        prevY: 100,
        y: 100,
        acc: 0,
        m: 10,
        name: "e",
        halfSize: 6,
      },
    ];
    WORLD.boxes.forEach((box) => (box.size = box.halfSize * 2));
    WORLD.springs = [];
    WORLD.rods = [];
    WORLD.MIN_Y = 0;
    WORLD.MAX_Y = 600;

    const assertions = (world, stats) => {
      let stillBoxes = 0;
      for (const box of world.boxes) {
        const v = box.y - box.prevY;
        if (v === 0) {
          stillBoxes++;
        }
      }
      expect(stillBoxes).toBe(4);
    };

    runStepsAndAssert(WORLD, SIM_CONFIG, assertions);
  });
});
