import { WORLD } from "./verlet-sketch.js";

export function createBox(speed = 0, y = 300, _color = undefined) {
  // Generate random hex color in #xxx format
  const color =
    _color ??
    "#" +
      Math.floor(Math.random() * 0x1000)
        .toString(16)
        .padStart(3, "0");
  // Use color name (e.g. "#f0f" becomes "f0f")
  const name = color.substring(1);
  const prevY = y - speed; // Calculate previous position

  return {
    color,
    prevY,
    y,
    acc: 0,
    m: 20,
    name,
    halfSize: 6,
  };
}

export function updateWorld(boxes, springs, rods) {
  Object.assign(WORLD, {
    ...WORLD,
    boxes:
      boxes?.map((box) => ({ ...box, size: box.halfSize * 2 })) ?? WORLD.boxes,
    springs: springs ?? WORLD.springs,
    rods: rods ?? WORLD.rods,
  });
}

export function setWorld(w) {
  Object.assign(WORLD, w);
}

export function getWorld() {
  return WORLD;
}

export function describeBox(boxes) {
  const bb = boxes ?? WORLD.boxes;
  bb.forEach((box) => {
    const v = box.y - box.prevY;
    console.log(
      `libq describe/${box.name}`,
      `going ${Math.sign(v) > 0 ? "down" : "up"}`,
      Math.abs(v.toFixed(4)),
    );
  });
}
