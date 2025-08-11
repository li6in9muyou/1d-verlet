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

  test("should reset cursor after toggle", () => {
    assertSimCtrl(
      afterHandlingEvents,
      {
        events: [{ name: "toggle" }],
        history: { cursor: -2 },
      },
      {
        events: [],
        history: { cursor: 0 },
      },
    );
  });

  test("should wrap cursor", () => {
    const after = afterHandlingEvents({
      x: 42,

      ctrl: {
        events: [{ name: "prev-frame" }],
        playing: false,
        stopAfterFrames: 10,
        history: { cursor: -2, states: [{ x: 40 }, { x: 41 }] },
      },
    });

    expect(after.ctrl.history.cursor).toStrictEqual(-1);
  });

  test("should bound the number of states", () => {
    assertSimCtrl(
      afterDrawing,
      {
        history: { MAX_STATES: 2, states: [{ x: 39 }, { x: 40 }, { x: 41 }] },
      },
      { history: { MAX_STATES: 2, states: [{ x: 41 }, {}] } },
    );
  });

  test("should go back", () => {
    const after = afterHandlingEvents({
      x: 42,

      ctrl: {
        events: [{ name: "prev-frame" }],
        playing: false,
        stopAfterFrames: 10,
        history: { cursor: 0, states: [{ x: 40 }, { x: 41 }] },
      },
    });

    expect(after.ctrl.history.cursor).toStrictEqual(-1);
  });

  test("should stop playing after prev-frame", () => {
    const after = afterHandlingEvents({
      x: 42,

      ctrl: {
        events: [{ name: "prev-frame" }],
        playing: true,
        stopAfterFrames: 10,
        history: { states: [{ x: 41 }] },
      },
    });

    expect(after.ctrl.playing).toStrictEqual(false);
  });

  test("should save states", () => {
    const after = afterDrawing({
      x: 42,
      ctrl: {
        playing: true,
        stopAfterFrames: 10,
        history: { states: [] },
      },
    });

    expect(after.ctrl.history.states).toStrictEqual([{ x: 42 }]);
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
