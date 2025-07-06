import { describe, test, expect } from "vitest";
import { runSimulationStep, getStats } from "./verlet-sketch";

const SIM_CONFIG = {
  dt: 1,
  SUB_STEPS: 320,
};

const createWorld = (boxes, springs = [], rods = []) => {
  const world = {
    MIN_Y: 0,
    MAX_Y: 600,
    boxes: boxes.map((box) => ({ ...box, size: box.halfSize * 2 })),
    springs,
    rods,
  };
  return world;
};

const runStepsAndAssert = (world, config, assertions) => {
  let initialTotalEnergy;
  for (let step = 0; step < 20000; step++) {
    runSimulationStep(world, config);
    const stats = getStats(world.boxes, world.springs);
    if (step === 0) {
      initialTotalEnergy = stats.totalEnergy;
    }
    // General assertion: total energy stays the same
    expect(stats.totalEnergy).toBeCloseTo(initialTotalEnergy, 2);
    assertions(world, stats);
  }
};

describe("End-to-End Tests for runSimulationStep", () => {
  // Case 1: one box bouncing between lower and upper bounds
  test("One box bouncing between lower and upper bounds", () => {
    const boxes = [
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
    const world = createWorld(boxes);

    const assertions = (world, stats) => {
      const box = world.boxes[0];
      const sizeToCenter = box.size / 2;
      expect(box.y).toBeGreaterThanOrEqual(world.MIN_Y + sizeToCenter);
      expect(box.y).toBeLessThanOrEqual(world.MAX_Y - sizeToCenter);
    };

    runStepsAndAssert(world, SIM_CONFIG, assertions);
  });

  // Case 2: two boxes of same mass, one starts stationary and one starts with speed of ten
  test("Two boxes of same mass, one stationary and one with speed of ten", () => {
    const boxes = [
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
    const world = createWorld(boxes);

    const assertions = (world, stats) => {
      const v1 = world.boxes[0].y - world.boxes[0].prevY;
      const v2 = world.boxes[1].y - world.boxes[1].prevY;
      expect(v1 === 0 || v2 === 0).toBe(true);
    };

    runStepsAndAssert(world, SIM_CONFIG, assertions);
  });

  // Case 3: two boxes of same mass that are connected with a spring
  test("Two boxes of same mass connected with a spring", () => {
    const boxes = [
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
    const springs = [
      {
        one: "d",
        two: "c",
        restingLen: 40,
        k: 0.1,
      },
    ];
    const world = createWorld(boxes, springs);

    const assertions = () => {}; // No specific additional assertions for now

    runStepsAndAssert(world, SIM_CONFIG, assertions);
  });

  // Case 4: Newton's cradle
  test("Newton's cradle", () => {
    const boxes = [
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
    const world = createWorld(boxes);

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

    runStepsAndAssert(world, SIM_CONFIG, assertions);
  });
});
