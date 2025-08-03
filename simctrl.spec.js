import { beforeEach, describe, expect, test } from "vitest";
import { SimCtrl } from "./ii-verlet";

describe("simctrl", () => {
  let s;
  beforeEach(() => {
    s = new SimCtrl();
  });

  test("basic stuff", () => {
    expect(
      s.afterHandlingEvents({
        ctrl: {
          events: [{ name: "toggle" }],
          playing: false,
        },
      }).ctrl.playing,
    ).toBe(true);

    expect(
      s.afterHandlingEvents({
        ctrl: {
          events: [{ name: "toggle" }],
          playing: true,
        },
      }).ctrl.playing,
    ).toBe(false);
  });
});
