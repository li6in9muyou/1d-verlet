import { Dynamics, World } from "./types";

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

export function transformWorld(
  world: World,
  transform: (x: number, y: number) => [number, number],
): void {
  [world.MIN_X, world.MIN_Y] = transform(world.MIN_X, world.MIN_Y);
  [world.MAX_X, world.MAX_Y] = transform(world.MAX_X, world.MAX_Y);
  world.SPRING_X = (world.MIN_X + world.MAX_X) / 2 - 6 - 1;

  world.boxes.forEach((b) => {
    b.y = transform(0, b.y)[1];
    b.prevY = transform(0, b.prevY)[1];
  });
}
