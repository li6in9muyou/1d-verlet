import { World } from "./types";

export class SimCtrl {
  afterHandlingEvents(w: World): World {
    for (const e of w.ctrl.events) {
      switch (e.name) {
        case "toggle":
          return {
            ...w,
            ctrl: {
              ...w.ctrl,
              events: w.ctrl.events.slice(1),
              playing: !w.ctrl.playing,
              stopAfterFrames: Number.MAX_SAFE_INTEGER,
            },
          };
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
        default:
          throw `simctrl: unknown event ${e.name} ctrl=${JSON.stringify(w.ctrl)}`;
      }
    }
    return w;
  }

  afterDrawing(w: World): World {
    return {
      ...w,
      ctrl: {
        ...w.ctrl,
        playing: w.ctrl.playing && w.ctrl.stopAfterFrames - 1 > 0,
        stopAfterFrames: w.ctrl.stopAfterFrames - 1,
      },
    };
  }
}
