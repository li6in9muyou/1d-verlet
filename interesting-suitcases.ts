import { MAX_Y_ANCHOR, MIN_Y_ANCHOR } from "./forces";
import { DynamicItem } from "./types";
import { SuitcaseBuilder } from "./suitcase-builder";
import { yv } from "./ii-utils";

export const spring1 = new SuitcaseBuilder()
  .description("spring1")
  .size(100, 600)
  .dynamics([
    {
      box: yv(300 - 9, 0, 0),
    },
    {
      box: yv(300 + 9, 0, 0),
    },
  ])
  .springs([{ one: 0, two: 1, k: 1e-2, restingLen: 299.5 }])
  .build();

export const spring2 = new SuitcaseBuilder()
  .description("spring2")
  .size(100, 600)
  .dynamics([
    {
      box: yv(9, 0, 0),
    },
    {
      box: yv(591, 0, 0),
    },
  ])
  .springs([{ one: 0, two: 1, k: 1e-2, restingLen: 100 }])
  .build();

function generateBouncingDynamics(
  h: number,
  count: number,
  size = 12,
): DynamicItem[] {
  const pairCnt = (count - 2) / 2;
  const gapCnt = pairCnt + 1;
  const gapH = (h - count * size) / gapCnt;

  if (gapH <= 4) {
    throw "count too big for this h";
  }

  let speedSign = 1;
  const v = 1;

  const dynamicsArray = [];

  dynamicsArray.push({
    box: yv(size / 2, speedSign * v, 0),
    mass: 1,
    size,
  });

  let currPairStart = size;
  for (let i = 0; i < pairCnt; i++) {
    dynamicsArray.push({
      box: yv(currPairStart + gapH + size / 2, (speedSign *= -1) * v, 0),
      mass: 1,
      size,
    });
    dynamicsArray.push({
      box: yv(currPairStart + gapH + size + size / 2, (speedSign *= -1) * v, 0),
      mass: 1,
      size,
    });
    currPairStart += gapH + size * 2;
  }

  dynamicsArray.push({
    box: yv(h - size / 2, speedSign * v, 0),
    mass: 1,
    size,
  });

  return dynamicsArray;
}

export const tennisBallFalling9metersOnTheMoon = new SuitcaseBuilder()
  .description("falling moon")
  .size(100, 900)
  .gravityAcc((10 * 1e-2) / 6)
  .dragCoeff(0)
  .dynamics([{ box: yv(6, 0, 0), mass: 0.057 }])
  .build();

export const springOscillator = new SuitcaseBuilder()
  .description("spring oscillator")
  .size(100, 400)
  .gravityAcc(0.1001344)
  .dragCoeff(0)
  .dynamics([{ box: yv(200, 0, 0), mass: 200 }])
  .springs([{ one: 0, two: MIN_Y_ANCHOR, k: 1, restingLen: 200 }])
  .build();

export const graviOscillator = new SuitcaseBuilder()
  .description("gravioscillator")
  .size(100, 400)
  .gravityAcc(0.1001344)
  .dragCoeff(0)
  .dynamics([{ box: yv(6, 0, 0) }])
  .build();

export const tennisBallFalling9meters = new SuitcaseBuilder()
  .description("falling 9m")
  .size(100, 900)
  .gravityAcc(10 * 1e-2)
  .dragCoeff(0.5 * 1.225 * 0.55 * 0.00353 * 1e-4)
  .dynamics([{ box: yv(6, 0, 0), mass: 0.057 }])
  .build();

export const tennisBallFalling900meters = new SuitcaseBuilder()
  .description("falling 900m")
  .size(100, 900)
  .gravityAcc(10)
  .dragCoeff(0.5 * 1.225 * 0.55 * 0.00353)
  .dynamics([{ box: yv(6, 0, 0), mass: 0.057 }])
  .build();

export const tennisBallFalling900metersWithoutAir = new SuitcaseBuilder()
  .description("falling 900m no air")
  .size(100, 900)
  .gravityAcc(10)
  .dragCoeff(0)
  .dynamics([{ box: yv(6, 0, 0), mass: 0.057 }])
  .build();

export const bouncing2 = new SuitcaseBuilder()
  .description("short")
  .size(300, 100)
  .dynamics(generateBouncingDynamics(100, 6))
  .build();

export const sanityCheckMoving = new SuitcaseBuilder()
  .description("sanity check moving")
  .size(100, 400)
  .dynamics(generateBouncingDynamics(400, 4))
  .build();

export const sanityCheck = new SuitcaseBuilder()
  .description("sanity check")
  .size(100, 700)
  .dynamics(
    generateBouncingDynamics(700, 4).map((d) => ((d.box.prevY = d.box.y), d)),
  )
  .build();

export const bouncing = new SuitcaseBuilder()
  .description("crashing stress test")
  .size(100, 900)
  .dynamics(generateBouncingDynamics(900, 100, 6))
  .build();

export const bug2 = new SuitcaseBuilder()
  .description("small amount of energy is GAINED")
  .size(140, 580)
  .dynamics([
    {
      box: yv(500, 0, 0),
      size: 24,
      color: "red",
      name: "a",
      mass: 3000,
    },
    {
      box: yv(500 - 12 - 50, 10, 0),
      size: 300,
      color: "green",
      name: "b",
      mass: 3000,
    },
  ])
  .springs([{ one: 0, two: MAX_Y_ANCHOR, k: 10, restingLen: 80 }])
  .build();

export const bug1 = new SuitcaseBuilder()
  .description("small amount of energy is LOST")
  .size(140, 580)
  .dynamics([
    {
      box: yv(500, 0, 0),
      size: 24,
      color: "red",
      name: "a",
      mass: 3000,
    },
    {
      box: yv(500 - 12 - 150, 10, 0),
      size: 300,
      color: "green",
      name: "b",
      mass: 1500,
    },
  ])
  .springs([{ one: 0, two: MAX_Y_ANCHOR, k: 10, restingLen: 80 }])
  .build();

export const crashNoDrag = new SuitcaseBuilder()
  .description("crash no drag")
  .size(120, 800)
  .dragCoeff(0)
  .dynamics(
    Array.from({ length: 6 }, (_, idx) => ({
      box: yv(330 + idx * 30, 0, 0),
      mass: undefined,
    })).concat({ box: yv(200, 3, 0), mass: 600 }),
  )
  .springs(
    Array.from({ length: 5 }, (_, idx) => ({
      k: 30,
      one: idx,
      two: idx + 1,
      restingLen: 30,
    })),
  )
  .build();

export const crash4 = new SuitcaseBuilder()
  .description("crash4")
  .size(120, 800)
  .dynamics([
    {
      box: yv(330 + 75 + (150 + 12 - 100) / 2, 0, 0),
      mass: 500,
      size: 100,
    },
    {
      box: yv(330 + 75 - 40 - (150 + 12 - 100) / 2, 0, 0),
      mass: 100,
      size: 22,
    },
    {
      box: yv(200, 3, 0),
      mass: 600,
    },
  ])
  .springs([
    {
      one: 0,
      two: 1,
      k: 18e-2,
      restingLen: 40 + 50 + 12,
    },
  ])
  .build();

export const crash3 = new SuitcaseBuilder()
  .description("crash3")
  .size(120, 800)
  .dynamics([
    {
      box: yv(330 + 75, 0, 0),
      mass: 600,
      size: 150 + 12,
    },
    {
      box: yv(200, 3, 0),
      mass: 600,
    },
  ])
  .build();

export const crash = new SuitcaseBuilder()
  .description("crash")
  .size(120, 800)
  .dragCoeff(1e-1)
  .dynamics(
    Array.from({ length: 6 }, (_, idx) => ({
      box: yv(330 + idx * 30, 0, 0),
      mass: undefined,
    })).concat({ box: yv(200, 3, 0), mass: 600 }),
  )
  .springs(
    Array.from({ length: 5 }, (_, idx) => ({
      k: 30,
      one: idx,
      two: idx + 1,
      restingLen: 30,
    })),
  )
  .build();

export const newtonsCradle = new SuitcaseBuilder()
  .description("newtons cradle spring")
  .size(120, 500)
  .dynamics(
    Array.from({ length: 6 }, (_, idx) => ({
      box: yv(100 + idx * 30, 0, 0),
    })).concat({ box: yv(12, 3, 0) }, { box: yv(250 + 12, 0, 0) }),
  )
  .springs(
    Array.from({ length: 5 }, (_, idx) => ({
      k: 30,
      one: idx,
      two: idx + 1,
      restingLen: 30,
    })),
  )
  .build();

export const realNewtonsCradle = new SuitcaseBuilder()
  .description("newtons cradle")
  .size(120, 500)
  .dynamics(
    Array.from({ length: 4 }, (_, idx) => ({
      box: yv(250 + idx * 12, 0, 0),
    })).concat({ box: yv(12, 13, 0) }),
  )
  .build();

const all = [
  graviOscillator,
  springOscillator,
  sanityCheck,
  sanityCheckMoving,
  crash,
  crashNoDrag,
  crash3,
  crash4,
  newtonsCradle,
  realNewtonsCradle,
  spring1,
  spring2,
  bouncing,
  bug2,
  bug1,
  bouncing2,
  tennisBallFalling9metersOnTheMoon,
  tennisBallFalling900metersWithoutAir,
  tennisBallFalling900meters,
  tennisBallFalling9meters,
];
export default all;
