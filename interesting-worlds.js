import { createBox } from "./utils.js";

export const makeSimpleHarmonicMotion = (k) => ({
  boxes: [createBox(10, 200, "#f00"), createBox(-10, 300, "#0f0")],
  springs: [{ one: "f00", two: "0f0", k: k, restingLen: 100 }],
  rods: [],
});

export default {
  makeSimpleHarmonicMotion,
  SimpleHarmonicMotion: makeSimpleHarmonicMotion(2),
};
