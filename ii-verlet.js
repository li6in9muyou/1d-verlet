import { getV, getYV, yv } from "./ii-utils.js";

let WORLD = {
  MIN_Y: 20,
  MAX_Y: 600,
  dt: 1 / 3000,
  boxes: [yv(300, -1 / 3000, 0), yv(200, 30 / 3000, 0)],
  sizes: [12, 12],
  colors: ["red", "green"],
  names: ["a", "b"],
  masses: [10, 1],
};

export function afterCrashing(state) {
  const nextBoxes = [...state.boxes];

  for (let ii = 0; ii < state.boxes.length; ii += 1) {
    for (let jj = ii + 1; jj < state.boxes.length; jj += 1) {
      const i = nextBoxes[ii];
      const j = nextBoxes[jj];

      const iSize = state.sizes[ii];
      const jSize = state.sizes[jj];
      const overlap = Math.abs(i.y - j.y) - iSize / 2 - jSize / 2;
      console.log("libq crashing/overlap", overlap, i.y, j.y, iSize, jSize);
      if (overlap >= 0) {
        console.log(`libq crashing/skip ${ii} vs ${jj}`);
        continue;
      }

      const overlapSize = -overlap;
      console.log("libq crashing/overlapsize", overlapSize);

      const iv = getV(i);
      const jv = getV(j);
      console.log("libq crashing/vold", iv, jv);
      const im = state.masses[ii];
      const jm = state.masses[jj];
      const ivNext = (iv * (im - jm) + 2 * jm * jv) / (im + jm);
      const jvNext = (jv * (jm - im) + 2 * im * iv) / (im + jm);
      console.log("libq crashing/vnew", ivNext, jvNext);

      const iPushRatio = Math.abs(iv) / (Math.abs(iv) + Math.abs(jv));
      const jPushRatio = Math.abs(jv) / (Math.abs(iv) + Math.abs(jv));
      const iPush = iPushRatio * overlapSize;
      const jPush = jPushRatio * overlapSize;
      console.log("libq crashing/ijpush", iPush, jPush);

      const ji = Math.sign(i.y - iv / 1e8 - (j.y - jv / 1e8));
      const iDeltaY = ji * iPush;
      const jDeltaY = -ji * jPush;
      console.log("libq crashing/ijdeltay", iDeltaY, jDeltaY);

      nextBoxes[ii] = yv(i.y + iDeltaY, ivNext);
      nextBoxes[jj] = yv(j.y + jDeltaY, jvNext);
      console.log(
        "libq crashing/ijafter",
        getYV(nextBoxes[ii]),
        getYV(nextBoxes[jj]),
      );
    }
  }

  return { ...state, boxes: nextBoxes };
}

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
    const size = w.sizes[idx];
    const halfSize = size / 2;
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

  const steps = 1 / WORLD.dt;
  for (let i = 0; i < steps; i++) {
    WORLD = { ...WORLD };
    WORLD = afterMoving(WORLD);
    WORLD = afterHittingWall(WORLD);
    WORLD = afterCrashing(WORLD);
  }

  drawBoxes(WORLD);
  drawWalls(WORLD);
}

export function setup() {
  textSize(12);
  createCanvas(100, WORLD.MAX_Y + 300);
}
