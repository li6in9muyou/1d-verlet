import { describe, expect, test } from "vitest";
import { MAX_Y_ANCHOR } from "./springs";
import { SuitcaseBuilder } from "./suitcase-builder";
import { yv } from "./ii-utils";

describe("SuitcaseBuilder", () => {
  test("sanity", () => {
    const expected = {
      springs: [{ one: 0, two: MAX_Y_ANCHOR, k: 10, restingLen: 80 }],
      gravityAcc: 0,
      dragCoeff: 0,
      frameCnt: 0,
      MIN_X: 140,
      MAX_X: 280,
      MIN_Y: 20,
      MAX_Y: 600,
      SPRING_X: (140 + 280) / 2 - 6 - 1,
      SPRING_TENSION_OFFSET: 3,
      SPRING_MARGIN_X: -7,
      dt: 1 / 3000,
      boxes: [yv(600 - 80 + 20, 0, 0), yv(600 - 80 - 60 + 20, 10 / 3000, 0)],
      sizes: [24, 300],
      colors: ["red", "green"],
      names: ["a", "b"],
      masses: [3000, 3000],
      statNextLineY: 0,
      ctrl: {
        history: { MAX_STATES: 50, cursor: 0, states: [] },
        events: [],
        playing: true,
        stopAfterFrames: Number.MAX_SAFE_INTEGER,
      },
    };

    const built = new SuitcaseBuilder()
      .pos(20, 140, 140, 580)
      .dynamics([
        {
          box: yv(600 - 80, 0, 0),
          size: 24,
          color: "red",
          name: "a",
          mass: 3000,
        },
        {
          box: yv(600 - 80 - 60, 10 / 3000, 0),
          size: 300,
          color: "green",
          name: "b",
          mass: 3000,
        },
      ])
      .springs([{ one: 0, two: MAX_Y_ANCHOR, k: 10, restingLen: 80 }])
      .build();

    expect(built).toEqual(expected);
  });
});
