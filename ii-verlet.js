import { yv } from "./ii-utils.js";

let WORLD = {
  MIN_Y: 20,
  MAX_Y: 600,
  dt: 1,
  boxes: [yv(300, 1, 1)],
  sizes: [12],
  colors: ["red"],
  names: ["a"],
  masses: [10],
};

export function afterMoving(state) {
  const dt = state.dt;
  const nextBoxes = state.boxes.map((box) => {
    return {
      ...box,
      prevY: box.y,
      y: 2 * box.y - box.prevY + box.acc * dt * dt,
    };
  });

  return { ...state, boxes: nextBoxes };
}

export function afterHittingWall(state) {
  const nextBoxes = state.boxes.map((box, idx) => {
    const halfSize = state.sizes[idx] / 2;
    if (box.y > state.MAX_Y - halfSize) {
      const yOverBound = box.y - (state.MAX_Y - halfSize);
      const nextY = state.MAX_Y - halfSize - yOverBound;
      const nextV = -Math.abs(box.y - box.prevY);
      return yv(nextY, nextV, box.acc);
    }
    if (box.y < state.MIN_Y + halfSize) {
      const yOverBound = state.MIN_Y + halfSize - box.y;
      const nextY = state.MIN_Y + halfSize + yOverBound;
      const nextV = Math.abs(box.y - box.prevY);
      return yv(nextY, nextV, box.acc);
    }
    return box;
  });

  return { ...state, boxes: nextBoxes };
}

function drawBoxes(w) {
  for (const idx in w.boxes) {
    const box = w.boxes[idx];
    const halfSize = box.size / 2;
    const name = w.names[idx];
    const color = w.colors[idx];
    const m = w.masses[idx];
    const y = box.y;

    stroke("#000");
    strokeWeight(1);
    fill(color);
    rect(100 / 2 - 6 - 1, y - halfSize - 1, 12 + 2, 2 * halfSize + 2);
    fill("white");
    text(`${m} ${name}`, 100 / 2 + 2 * 6, y + 6 - 2);
  }
}

function drawWalls(w) {
  stroke("#00b");
  strokeWeight(10);
  line(0, w.MIN_Y - 5, 100, w.MIN_Y - 5);
  line(0, w.MAX_Y + 5, 100, w.MAX_Y + 5);
}

export function draw() {
  background("#111");

  WORLD = { ...WORLD };
  WORLD = afterMoving(WORLD);
  WORLD = afterHittingWall(WORLD);

  drawBoxes(WORLD);
  drawWalls(WORLD);
}

export function setup() {
  textSize(12);
  createCanvas(100, WORLD.MAX_Y + 300);
}
