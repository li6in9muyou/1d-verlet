import { createBox } from "./utils.js";

export const makeSpringWithoutCollide = (k) => ({
  boxes: [createBox(0, 300, "#f00"), createBox(0, 300 - 24, "#0f0")],
  springs: [{ one: "f00", two: "0f0", k: k, restingLen: 100 }],
  rods: [],
});

export const makeSpringWithCollide = (k) => ({
  boxes: [createBox(-1, 300, "#f00"), createBox(1, 300 - 12, "#0f0")],
  springs: [{ one: "f00", two: "0f0", k: k, restingLen: 100 }],
  rods: [],
});

export const makeTwoBouncingBoxes = (v) => ({
  MAX_Y: 600,
  MIN_Y: 0,
  boxes: [createBox(v, 300, "#f00"), createBox(-v, 300 - 12, "#0f0")],
  springs: [],
  rods: [],
});

export default {
  makeSpringWithoutCollide,
  makeSpringWithCollide,
  makeTwoBouncingBoxes,
};
