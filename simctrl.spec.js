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

    s.requestPrevStep();
    expect(s.shouldSetState()).toBe(true);
    expect(s.getState()).toBe(101);

    s.requestPrevStep();
    expect(s.shouldSetState()).toBe(true);
    expect(s.getState()).toBe(103);
  });

  test("basic prev 2", () => {
    s.onStep(100);
    s.onStep(101);
    s.onStep(102);
    s.onStep(103);

    s.requestPrevStep();
    expect(s.shouldSetState()).toBe(true);
    expect(s.getState()).toBe(102);

    s.nextStep();
    s.onStep(204);
    s.nextStep();
    s.onStep(205);
    s.nextStep();
    s.onStep(206);

    s.requestPrevStep();
    expect(s.shouldSetState()).toBe(true);
    expect(s.getState()).toBe(205);

    s.requestPrevStep();
    s.requestPrevStep();
    s.requestPrevStep();
    s.requestPrevStep();
    expect(s.shouldSetState()).toBe(true);
    expect(s.getState()).toBe(204);

    s.nextStep();
    s.onStep(305);
    s.requestPrevStep();
    expect(s.shouldSetState()).toBe(true);
    expect(s.getState()).toBe(204);

    s.nextStep();
    s.onStep(305);
    s.requestPrevStep();
    expect(s.shouldSetState()).toBe(true);
    expect(s.getState()).toBe(204);

    s.nextStep();
    s.onStep(305);
    s.requestPrevStep();
    expect(s.shouldSetState()).toBe(true);
    expect(s.getState()).toBe(204);
  });

  test("basic prev 3", () => {
    s.onStep(100);
    s.onStep(101);
    s.onStep(102);
    s.onStep(103);

    s.requestPrevStep();
    s.requestPrevStep();
    expect(s.getState()).toBe(101);

    s.nextStep();
    s.onStep(12);
    s.nextStep();
    s.onStep(13);
    s.requestPrevStep();
    expect(s.getState()).toBe(12);
  });
});
