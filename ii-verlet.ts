import { DynamicsWorld, RenderWorld, Spring, World } from "./types";
import {
  MIN_Y_ANCHOR,
  afterApplyingForce,
  getSpringEndpointY,
} from "./springs";
import { afterDrawing, afterHandlingEvents } from "./simctrl";
import { getV, yv } from "./ii-utils";

let WORLD: World = {
  springs: [
    { one: 1, two: 0, k: 4, restingLen: 100 },
    { one: MIN_Y_ANCHOR, two: 0, k: 40, restingLen: 80 },
  ],
  gravityAcc: 0.1001344,
  dragCoeff: 0,
  frameCnt: 0,
  MAX_X: 140,
  MIN_Y: 20,
  MAX_Y: 600,
  SPRING_X: 140 / 2 - 6 - 1,
  SPRING_TENSION_OFFSET: 3,
  SPRING_MARGIN_X: -7,
  dt: 1 / 3000,
  boxes: [yv(100, 0, 0), yv(200, 0, 0)],
  sizes: [24, 24, 12, 12 / 5, 24],
  colors: ["red", "green", "#0ff", "#ff0", "#f0f"],
  names: ["a", "b", "c", "d", "e"],
  masses: [3000, 3000, 50, 10, 100],
  statNextLineY: 0,
  ctrl: {
    history: { MAX_STATES: 50, cursor: 0, states: [] },
    events: [],
    playing: true,
    stopAfterFrames: Number.MAX_SAFE_INTEGER,
  },
};

export function afterCrashing(state: World): World {
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

export function afterMoving(state: World): World {
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

export function afterHittingWall(state: World): World {
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

function drawOneSpring(
  spring: Spring,
  i: number,
  j: number,
  RENDER_CONFIG: { SPRING_X: number; SPRING_TENSION_OFFSET: number },
  lineln: (ya: number, yb: number, tempOffset: number) => void,
) {
  stroke("white");
  strokeWeight(2);
  const ij = Math.sign(j - i);
  lineln(i, i + spring.restingLen * ij, 0);

  const actualLen = Math.abs(i - j);
  let tensionColor: string;
  if (actualLen < spring.restingLen) {
    tensionColor = "red";
  } else if (actualLen > spring.restingLen) {
    tensionColor = "yellow";
  } else {
    tensionColor = "white";
  }
  stroke(tensionColor);
  strokeWeight(2);
  lineln(i, j, +RENDER_CONFIG.SPRING_TENSION_OFFSET);
}

function drawSprings(w: RenderWorld & DynamicsWorld) {
  const springs = w.springs;

  let xOffset = w.SPRING_X;
  function lineln(ya: number, yb: number, tempOffset: number) {
    const x = xOffset + tempOffset;
    line(x, ya, x, yb);
  }

  for (const spring of springs) {
    const [ya, yb] = getSpringEndpointY(w, spring);
    xOffset += w.SPRING_MARGIN_X;
    drawOneSpring(spring, ya, yb, w, lineln);
  }
}

function drawBoxes(w: RenderWorld & DynamicsWorld) {
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

function drawWalls(w: DynamicsWorld) {
  stroke("#00b");
  strokeWeight(10);
  line(0, w.MIN_Y - 5, w.MAX_X, w.MIN_Y - 5);
  line(0, w.MAX_Y + 5, w.MAX_X, w.MAX_Y + 5);
}

function getStats(w: World) {
  const boxes = w.boxes;
  const springs = w.springs;
  const stats = {
    boxes: [],
    springs: [],
    totalKineticEnergy: 0,
    totalElasticEnergy: 0,
    totalEnergy: 0,
    totalGraviPotential: 0,
  };

  for (const [idx, box] of boxes.entries()) {
    const v = (box.y - box.prevY) / w.dt;
    const m = w.masses[idx];
    const ke = 0.5 * m * v * v;
    const gp = m * w.gravityAcc * -(box.y - w.MAX_Y);
    stats.boxes.push({
      name: w.names[idx],
      velocity: v,
      kineticEnergy: ke,
      color: w.colors[idx],
      y: box.y,
      acc: box.acc / w.dt,
    });
    stats.totalKineticEnergy += ke;
    stats.totalGraviPotential += gp;
  }

  for (const spring of springs) {
    const [ya, yb] = getSpringEndpointY(w, spring);
    const actualLen = Math.abs(ya - yb);
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

  stats.totalEnergy =
    stats.totalGraviPotential +
    stats.totalKineticEnergy +
    stats.totalElasticEnergy;

  return stats;
}

function drawStats(w: World) {
  const stats = getStats(w);

  noStroke();
  fill("white");

  textSize(14);
  const LINE_HEIGHT = 15;
  let yOffset = w.MAX_Y + 10;
  function textln(s: string) {
    text(s, 4, (yOffset += LINE_HEIGHT));
  }

  textln("");
  textln(`frameCount=${w.frameCnt}`);
  stats.boxes.sort((i, j) => i.y - j.y);
  for (const boxStat of stats.boxes) {
    fill(boxStat.color);
    textln(`${boxStat.name}.v=${boxStat.velocity.toFixed(2)}`);
    textln(`${boxStat.name}.acc=${boxStat.acc.toFixed(2)}`);
  }
  for (const springStat of stats.springs) {
    textln(`${springStat.name}=${springStat.elasticEnergy.toFixed(2)}`);
  }

  fill("white");
  textln(`\u03a3\u00bdmv\u00b2=${stats.totalKineticEnergy.toFixed(2)}\n`);
  textln(`\u03a3\u00bdkd\u00b2=${stats.totalElasticEnergy.toFixed(2)}\n`);
  textln(`\u03a3mgh=${stats.totalGraviPotential.toFixed(2)}\n`);
  textln(`\u03a3E=${stats.totalEnergy.toFixed(2)}\n`);
}

const frameTimeWindow = [];
function drawFrameTime(ftWindow: number[], w: { MAX_Y: number }) {
  const ft = ftWindow.reduce((a, b) => a + b, 0) / ftWindow.length;
  textSize(14);
  text(`frameTime=${ft.toFixed(2)}ms`, 4, w.MAX_Y + 10 + 15);
}

export function draw() {
  const frameStart = performance.now();

  background("#111");

  WORLD = afterHandlingEvents(WORLD);

  if (WORLD.ctrl.playing) {
    WORLD.frameCnt++;

    const steps = 1 / WORLD.dt;
    for (let i = 0; i < steps; i++) {
      WORLD = { ...WORLD };
      WORLD = afterMoving(WORLD);
      WORLD = afterHittingWall(WORLD);
      WORLD = afterCrashing(WORLD);
      WORLD = afterApplyingForce(WORLD);
    }

    WORLD = afterDrawing(WORLD);
  }

  drawBoxes(WORLD);
  drawWalls(WORLD);
  drawSprings(WORLD);
  drawStats(WORLD);

  const frameTime = performance.now() - frameStart;
  frameTimeWindow.push(frameTime);
  if (frameTimeWindow.length > 60) {
    frameTimeWindow.shift();
  }
  drawFrameTime(frameTimeWindow, WORLD);
}

export function setup() {
  textSize(12);
  createCanvas(WORLD.MAX_X, WORLD.MAX_Y + 300);
}

export function emitEvent(ev: World["ctrl"]["events"][number]) {
  WORLD.ctrl.events.push(ev);
}
