import { MAX_Y_ANCHOR } from "./springs";
import { WorldBuilder } from "./world-builder";
import { yv } from "./ii-utils";

export const spring1 = new WorldBuilder()
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

export const spring2 = new WorldBuilder()
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

export const bouncing = new WorldBuilder()
  .pos(220, 310, 100, 400)
  .dynamics([
    {
      box: yv(6, 1 / 3000, 0),
    },
    {
      box: yv(94, -1 / 3000, 0),
    },
    {
      box: yv(106, 1 / 3000, 0),
    },
    {
      box: yv(194, -1 / 3000, 0),
    },
    {
      box: yv(206, 1 / 3000, 0),
    },
    {
      box: yv(294, -1 / 3000, 0),
    },
    {
      box: yv(306, 1 / 3000, 0),
    },
    {
      box: yv(394, -1 / 3000, 0),
    },
  ])
  .build();

export const bug2 = new WorldBuilder()
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
      box: yv(500 - 12 - 50, 10 / 3000, 0),
      size: 300,
      color: "green",
      name: "b",
      mass: 3000,
    },
  ])
  .springs([{ one: 0, two: MAX_Y_ANCHOR, k: 10, restingLen: 80 }])
  .build();

export const bug1 = new WorldBuilder()
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
      box: yv(500 - 12 - 150, 10 / 3000, 0),
      size: 300,
      color: "green",
      name: "b",
      mass: 1500,
    },
  ])
  .springs([{ one: 0, two: MAX_Y_ANCHOR, k: 10, restingLen: 80 }])
  .build();
