import { beforeEach, describe, expect, test } from "vitest";
import { SimCtrl } from "./ii-verlet";

describe("simctrl", () => {
  let s;
  beforeEach(() => {
    s = new SimCtrl();
  });

  test("basic stuff", () => {
    expect(s.shouldStep()).toBe(true);
    s.togglePlayPause();
    expect(s.shouldStep()).toBe(false);
    s.togglePlayPause();
    expect(s.shouldStep()).toBe(true);

    s.nextStep();
    s.nextStep();
    s.nextStep();
    s.nextStep();
    s.nextStep();
    expect(s.shouldStep()).toBe(true);
    s.onStep(null);
    expect(s.shouldStep()).toBe(false);
  });

  test("basic prev", () => {
    s.onStep(100);
    s.onStep(101);
    s.onStep(102);
    s.onStep(103);

    s.requestPrevStep();
    expect(s.shouldSetState()).toBe(true);
    expect(s.getState()).toBe(102);
  });
});
