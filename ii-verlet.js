import { getV, yv } from "./ii-utils.ts";

let WORLD = {
  frameCnt: 0,
  MAX_X: 140,
  MIN_Y: 20,
  MAX_Y: 600,
  dt: 1 / 3000,
  boxes: [yv(600 - 6, -1 / 3000, 0), yv(200 - 6, 2 / 3000, 0)],
  sizes: [12, 12],
  colors: ["red", "green"],
  names: ["a", "b"],
  masses: [1000, 1],
  statNextLineY: 0,
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
      if (overlap >= 0) {
        continue;
      }

      const overlapSize = -overlap;

      const iv = getV(i);
      const jv = getV(j);
      const im = state.masses[ii];
      const jm = state.masses[jj];
      const ivNext = (iv * (im - jm) + 2 * jm * jv) / (im + jm);
      const jvNext = (jv * (jm - im) + 2 * im * iv) / (im + jm);

      const iPushRatio = Math.abs(iv) / (Math.abs(iv) + Math.abs(jv));
      const jPushRatio = Math.abs(jv) / (Math.abs(iv) + Math.abs(jv));
      const iPush = iPushRatio * overlapSize;
      const jPush = jPushRatio * overlapSize;

      const ji = Math.sign(i.y - iv / 1e8 - (j.y - jv / 1e8));
      const iDeltaY = ji * iPush;
      const jDeltaY = -ji * jPush;

      nextBoxes[ii] = yv(i.y + iDeltaY, ivNext);
      nextBoxes[jj] = yv(j.y + jDeltaY, jvNext);
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
    rect(w.MAX_X / 2 - 6 - 1, y - halfSize - 1, 12 + 2, 2 * halfSize + 2);
    fill("white");
    text(`${m} ${name}`, w.MAX_X / 2 + 2 * 6, y + 6 - 2);
  }
}

function drawWalls(w) {
  stroke("#00b");
  strokeWeight(10);
  line(0, w.MIN_Y - 5, w.MAX_X, w.MIN_Y - 5);
  line(0, w.MAX_Y + 5, w.MAX_X, w.MAX_Y + 5);
}

function getStats(w) {
  const boxes = w.boxes;
  const springs = [];
  const stats = {
    boxes: [],
    springs: [],
    totalKineticEnergy: 0,
    totalElasticEnergy: 0,
    totalEnergy: 0,
  };

  for (const [idx, box] of boxes.entries()) {
    const v = (box.y - box.prevY) / w.dt;
    const m = w.masses[idx];
    const ke = 0.5 * m * v * v;
    stats.boxes.push({
      name: w.names[idx],
      velocity: v,
      kineticEnergy: ke,
      color: w.colors[idx],
      y: box.y,
    });
    stats.totalKineticEnergy += ke;
  }

  for (const spring of springs) {
    const i = getBoxByName(boxes, spring.one);
    const j = getBoxByName(boxes, spring.two);

    const actualLen = Math.abs(i.y - j.y);
    const displacement = actualLen - spring.restingLen;
    const force = spring.k * displacement;
    const elasticEnergy = 0.5 * spring.k * displacement * displacement;

    stats.springs.push({
      name: `${spring.one}-${spring.two}`,
      force: force,
      elasticEnergy: elasticEnergy,
    });
    stats.totalElasticEnergy += elasticEnergy;
  }

  stats.totalEnergy = stats.totalKineticEnergy + stats.totalElasticEnergy;

  return stats;
}

function drawStats(w) {
  const stats = getStats(w);

  noStroke();
  fill("white");

  textSize(14);
  const LINE_HEIGHT = 15;
  let yOffset = w.MAX_Y + 10;
  function textln(s) {
    text(s, 4, (yOffset += LINE_HEIGHT));
  }

  textln(`frameCount=${w.frameCnt}`);
  stats.boxes.sort((i, j) => i.y - j.y);
  for (const boxStat of stats.boxes) {
    fill(boxStat.color);
    textln(`${boxStat.name}=${boxStat.velocity.toFixed(2)}\n`);
  }
  for (const springStat of stats.springs) {
    textln(`${springStat.name}=${springStat.elasticEnergy.toFixed(2)}`);
  }

  fill("white");
  textln(`\u03a3\u00bdmv\u00b2=${stats.totalKineticEnergy.toFixed(2)}\n`);
  textln(`\u03a3\u00bdkd\u00b2=${stats.totalElasticEnergy.toFixed(2)}\n`);
  textln(`\u03a3E=${stats.totalEnergy.toFixed(2)}\n`);
}

export function draw() {
  background("#111");

  if (window.state.pauseAfterFrameCnt > 0) {
    WORLD.frameCnt++;
    window.state.pauseAfterFrameCnt--;

    const steps = 1 / WORLD.dt;
    for (let i = 0; i < steps; i++) {
      WORLD = { ...WORLD };
      WORLD = afterMoving(WORLD);
      WORLD = afterHittingWall(WORLD);
      WORLD = afterCrashing(WORLD);
    }
  }

  drawBoxes(WORLD);
  drawWalls(WORLD);
  drawStats(WORLD);
}

export function setup() {
  textSize(12);
  createCanvas(WORLD.MAX_X, WORLD.MAX_Y + 300);
}
