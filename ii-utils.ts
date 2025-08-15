import { Dynamics, Suitcase } from "./types";

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

export function transformSuitcase(
  scase: Suitcase,
  transform: (x: number, y: number) => [number, number],
): void {
  [scase.MIN_X, scase.MIN_Y] = transform(scase.MIN_X, scase.MIN_Y);
  [scase.MAX_X, scase.MAX_Y] = transform(scase.MAX_X, scase.MAX_Y);
  scase.SPRING_X = (scase.MIN_X + scase.MAX_X) / 2 - 6 - 1;

  scase.boxes.forEach((b) => {
    b.y = transform(0, b.y)[1];
    b.prevY = transform(0, b.prevY)[1];
  });
}
