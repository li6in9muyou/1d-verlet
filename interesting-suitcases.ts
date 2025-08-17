import { MAX_Y_ANCHOR } from "./springs";
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

function generateBouncingDynamics(h: number, count: number) {
  const pairCnt = (count - 2) / 2;
  const gapCnt = pairCnt + 1;
  const gapH = (h - count * 12) / gapCnt;

  if (gapH <= 4) {
    throw "count too big for this h";
  }

  let speedSign = 1;
  const v = 1;

  const dynamicsArray = [];

  dynamicsArray.push({
    box: yv(6, speedSign * v, 0),
    mass: 1,
  });

  let currPairStart = 12;
  for (let i = 0; i < pairCnt; i++) {
    dynamicsArray.push({
      box: yv(currPairStart + gapH + 6, (speedSign *= -1) * v, 0),
      mass: 1,
    });
    dynamicsArray.push({
      box: yv(currPairStart + gapH + 18, (speedSign *= -1) * v, 0),
      mass: 1,
    });
    currPairStart += gapH + 12 + 12;
  }

  dynamicsArray.push({
    box: yv(h - 6, speedSign * v, 0),
    mass: 1,
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
  .size(100, 100)
  .dynamics(generateBouncingDynamics(100, 2))
  .build();

export const sanityCheck = new SuitcaseBuilder()
  .description("sanity check")
  .size(100, 900)
  .dynamics(generateBouncingDynamics(900, 4).map((b) => ((b.prevY = b.y), b)))
  .build();

export const bouncing = new SuitcaseBuilder()
  .description("crashing stress test")
  .size(100, 900)
  .dynamics(generateBouncingDynamics(900, 64))
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

export const crash = new SuitcaseBuilder()
  .description("crash")
  .size(120, 500)
  .dragCoeff(1e-1)
  .dynamics(
    Array.from({ length: 6 }, (_, idx) => ({
      box: yv(330 + idx * 30, -3, 0),
      mass: undefined,
    })).concat({ box: yv(12, 3, 0), mass: 600 }),
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
  sanityCheck,
  crash,
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
