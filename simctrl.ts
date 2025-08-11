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
            },
          };
        default:
          throw `simctrl: unknown event ${e.name} ctrl=${JSON.stringify(w.ctrl)}`;
      }
    }
    return w;
  }
}
