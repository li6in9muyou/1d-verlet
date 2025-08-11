import { beforeEach, describe, expect, test } from "vitest";
import { SimCtrl } from "./simctrl";

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

    expect(
      s.afterHandlingEvents({
        ctrl: {
          events: [{ name: "toggle" }],
          playing: true,
        },
      }).ctrl.events,
    ).toStrictEqual([]);
  });

  test("should parse next-frame event", () => {
    const after = s.afterHandlingEvents({
      ctrl: {
        events: [{ name: "next-frame" }],
        playing: false,
      },
    }).ctrl;
    expect(after.playing).toBe(true);
    expect(after.stopAfterFrames).toBe(1);
  });

  test("should resume playing after toggle", () => {
    const after = s.afterHandlingEvents({
      ctrl: {
        events: [{ name: "toggle" }],
        playing: false,
        stopAfterFrames: 0,
      },
    }).ctrl;
    expect(after.playing).toBe(true);
    expect(after.stopAfterFrames).toBe(Number.MAX_SAFE_INTEGER);
  });

  test("should stop playing if stopAfterFrames < 0", () => {
    const after = s.afterDrawing({
      ctrl: {
        events: [],
        playing: true,
        stopAfterFrames: 0,
      },
    }).ctrl;

    expect(after.playing).toBe(false);
    expect(after.stopAfterFrames).toBe(-1);
  });

  test("should update w.ctrl in afterDrawing", () => {
    const after = s.afterDrawing({
      ctrl: {
        events: ["do not modify events"],
        playing: true,
        stopAfterFrames: 10,
      },
    }).ctrl;

    expect(after.events).toStrictEqual(["do not modify events"]);
    expect(after.playing).toBe(true);
    expect(after.stopAfterFrames).toBe(9);
  });
});
