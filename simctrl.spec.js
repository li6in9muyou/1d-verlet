import { afterDrawing, afterHandlingEvents } from "./simctrl";
import { describe, expect, test } from "vitest";

describe("simctrl", () => {
  test("basic stuff", () => {
    expect(
      afterHandlingEvents({
        ctrl: {
          events: [{ name: "toggle" }],
          playing: false,
        },
      }).ctrl.playing,
    ).toBe(true);

    expect(
      afterHandlingEvents({
        ctrl: {
          events: [{ name: "toggle" }],
          playing: true,
        },
      }).ctrl.playing,
    ).toBe(false);

    expect(
      afterHandlingEvents({
        ctrl: {
          events: [{ name: "toggle" }],
          playing: true,
        },
      }).ctrl.events,
    ).toStrictEqual([]);
  });

  test("should parse next-frame event", () => {
    const after = afterHandlingEvents({
      ctrl: {
        events: [{ name: "next-frame" }],
        playing: false,
      },
    }).ctrl;
    expect(after.playing).toBe(true);
    expect(after.stopAfterFrames).toBe(1);
  });

  test("should resume playing after toggle", () => {
    const after = afterHandlingEvents({
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
    const after = afterDrawing({
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
    assertSimCtrl(
      afterDrawing,
      {
        events: ["do not modify events"],
        playing: true,
        stopAfterFrames: 10,
      },
      {
        events: ["do not modify events"],
        playing: true,
        stopAfterFrames: 9,
      },
    );
  });

  function assertSimCtrl(fn, input, expected) {
    const after = fn({
      ctrl: input,
    }).ctrl;

    for (const [k, v] of Object.entries(expected)) {
      expect(after[k]).toStrictEqual(v);
    }
  }
});
