import { createBox } from "./utils.js";

export const makeSimpleHarmonicMotion = (k) => ({
  boxes: [createBox(0, 200, "#1b8"), createBox(0, 300, "#ec6")],
  springs: [{ one: "1b8", two: "ec6", k: k, restingLen: 110 }],
  rods: [],
});

export default {
  makeSimpleHarmonicMotion,
  SimpleHarmonicMotion: makeSimpleHarmonicMotion(2),
};
