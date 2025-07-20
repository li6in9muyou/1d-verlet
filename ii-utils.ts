import { Dynamics } from "./types";

export function getV(box: Dynamics) {
  return box.y - box.prevY;
}

export function yv(y: number, v: number, acc = 0): Dynamics {
  return {
    y,
    prevY: y - v,
    acc,
  };
}
