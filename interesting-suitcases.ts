import { MAX_Y_ANCHOR } from "./springs";
import { SuitcaseBuilder } from "./suitcase-builder";
import { yv } from "./ii-utils";

export const spring1 = new SuitcaseBuilder()
  .pos(20, 530, 100, 600)
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
  .pos(20, 420, 100, 600)
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

export const bouncing2 = new SuitcaseBuilder()
  .pos(20, 640, 100, 900)
  .dynamics(generateBouncingDynamics(900, 2))
  .build();

export const bouncing = new SuitcaseBuilder()
  .pos(20, 310, 100, 900)
  .dynamics(generateBouncingDynamics(900, 64))
  .build();

export const bug2 = new SuitcaseBuilder()
  .description("small amount of energy is GAINED")
  .pos(20, 10, 140, 580)
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
  .pos(40, 160, 140, 580)
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
  .pos(NaN, NaN, 120, 500)
  .dynamics(
    new Array(6)
      .fill(null)
      .map((_, idx) => ({
        box: yv(330 + idx * 30, -3, 0),
        mass: undefined,
      }))
      .concat({ box: yv(12, 3, 0), mass: 600 }),
  )
  .springs(
    new Array(5)
      .fill(null)
      .map((_, idx) => ({ k: 30, one: idx, two: idx + 1, restingLen: 30 })),
  )
  .build();

export const newtonsCradle = new SuitcaseBuilder()
  .pos(NaN, NaN, 120, 500)
  .dynamics(
    new Array(6)
      .fill(null)
      .map((_, idx) => ({
        box: yv(100 + idx * 30, 0, 0),
      }))
      .concat({ box: yv(12, 3, 0) }, { box: yv(250 + 12, 0, 0) }),
  )
  .springs(
    new Array(5)
      .fill(null)
      .map((_, idx) => ({ k: 30, one: idx, two: idx + 1, restingLen: 30 })),
  )
  .build();

export const realNewtonsCradle = new SuitcaseBuilder()
  .pos(NaN, NaN, 120, 500)
  .dynamics(
    new Array(4)
      .fill(null)
      .map((_, idx) => ({
        box: yv(250 + idx * 12, 0, 0),
      }))
      .concat({ box: yv(12, 13, 0) }),
  )
  .build();

const all = [
  crash,
  newtonsCradle,
  realNewtonsCradle,
  spring1,
  spring2,
  bouncing,
  bug2,
  bug1,
  bouncing2,
];
export default all;
