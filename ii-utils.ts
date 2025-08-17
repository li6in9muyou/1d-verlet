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

export function v2Add(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): [number, number] {
  return [x1 + x2, y1 + y2];
}
