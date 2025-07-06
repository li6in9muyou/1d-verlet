import { createBox } from "./utils.js";

export const makeSimpleHarmonicMotion = (k) => ({
  boxes: [createBox(10, 200, "#f00"), createBox(-10, 300, "#0f0")],
  springs: [{ one: "f00", two: "0f0", k: k, restingLen: 100 }],
  rods: [],
});

export const makeCollideAndSpring = (k) => ({
  boxes: [createBox(0, 300, "#f00"), createBox(0, 300 - 12, "#0f0")],
  springs: [{ one: "f00", two: "0f0", k: k, restingLen: 100 }],
  rods: [],
});

export const makeSpringWithoutCollide = (k) => ({
  boxes: [createBox(0, 300, "#f00"), createBox(0, 300 - 24, "#0f0")],
  springs: [{ one: "f00", two: "0f0", k: k, restingLen: 100 }],
  rods: [],
});

export default {
  makeSimpleHarmonicMotion,
  makeCollideAndSpring,
  makeSpringWithoutCollide,
  SimpleHarmonicMotion: makeSimpleHarmonicMotion(2),
};
