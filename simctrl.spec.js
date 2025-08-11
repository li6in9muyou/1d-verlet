import { afterDrawing, afterHandlingEvents } from "./simctrl";
import { describe, expect, test } from "vitest";

describe("simctrl", () => {
  test("basic stuff", () => {
    assertSimCtrl(
      afterHandlingEvents,
      {
        events: [{ name: "toggle" }],
        playing: false,
      },
      {
        playing: true,
        events: [],
      },
    );

    assertSimCtrl(
      afterHandlingEvents,
      {
        events: [{ name: "toggle" }],
        playing: true,
      },
      {
        playing: false,
        events: [],
      },
    );

    assertSimCtrl(
      afterHandlingEvents,
      {
        events: [{ name: "toggle" }],
        playing: true,
      },
      {
        events: [],
      },
    );
  });

  test("should parse next-frame event", () => {
    assertSimCtrl(
      afterHandlingEvents,
      {
        events: [{ name: "next-frame" }],
        playing: false,
      },
      {
        playing: true,
        stopAfterFrames: 1,
      },
    );
  });

  test("should resume playing after toggle", () => {
    assertSimCtrl(
      afterHandlingEvents,
      {
        events: [{ name: "toggle" }],
        playing: false,
        stopAfterFrames: 0,
      },
      {
        playing: true,
        stopAfterFrames: Number.MAX_SAFE_INTEGER,
      },
    );
  });

  test("should stop playing if stopAfterFrames < 0", () => {
    assertSimCtrl(
      afterDrawing,
      {
        events: [],
        playing: true,
        stopAfterFrames: 0,
      },
      {
        playing: false,
        stopAfterFrames: -1,
      },
    );
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
