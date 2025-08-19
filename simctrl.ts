import { cloneDeep, omit } from "lodash";
import { Suitcase } from "./types";

export function afterHandlingEvents(w: Suitcase): Suitcase {
  for (const e of w.ctrl.events) {
    switch (e.name) {
      case "toggle": {
        const ww = {
          ...w,
          ctrl: {
            ...w.ctrl,
            events: w.ctrl.events.slice(1),
            playing: !w.ctrl.playing,
            stopAfterFrames: Number.MAX_SAFE_INTEGER,
          },
        };
        if (ww.ctrl.history) {
          ww.ctrl.history.cursor = 0;
        }
        return ww;
      }
      case "next-frame":
        return {
          ...w,
          ctrl: {
            ...w.ctrl,
            events: w.ctrl.events.slice(1),
            playing: true,
            stopAfterFrames: 1,
          },
        };
      case "prev-frame": {
        let nextCursor = w.ctrl.history.cursor - 1;
        let stateIdx = w.ctrl.history.states.length + nextCursor;
        if (stateIdx < 0) {
          stateIdx = w.ctrl.history.states.length - 1;
          nextCursor = -1;
        }

        const ww = {
          ...cloneDeep(w.ctrl.history.states[stateIdx]),
          ctrl: { ...w.ctrl },
        };
        ww.ctrl.events = w.ctrl.events.slice(1);
        ww.ctrl.playing = false;
        ww.ctrl.history.cursor = nextCursor;
        return ww;
      }
      default:
        throw `simctrl: unknown event ${(e as { name: string }).name} ctrl=${JSON.stringify(w.ctrl)}`;
    }
  }
  return w;
}

export function afterDrawing(w: Suitcase): Suitcase {
  const ww = cloneDeep(w);

  ww.ctrl.playing = w.ctrl.playing && w.ctrl.stopAfterFrames - 1 > 0;
  ww.ctrl.stopAfterFrames = w.ctrl.stopAfterFrames - 1;

  if (ww.ctrl.history) {
    ww.ctrl.history.states.push(omit(ww, "ctrl"));
    while (ww.ctrl.history.states.length > ww.ctrl.history.MAX_STATES) {
      ww.ctrl.history.states.shift();
    }
  }

  return ww;
}
