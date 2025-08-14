import { DynamicsWorld, RenderWorld, Spring, World } from "./types";
import {
  MAX_Y_ANCHOR,
  afterApplyingForce,
  getAnchorName,
  getSpringEndpointY,
} from "./springs";
import { afterDrawing, afterHandlingEvents } from "./simctrl";
import { getV, yv } from "./ii-utils";
import { WorldBuilder } from "./world-builder";

const worlds = [
  new WorldBuilder()
    .pos(20, 530, 100, 600)
    .dynamics([
      {
        box: yv(300 - 9, 0, 0),
      },
      {
        box: yv(300 + 9, 0, 0),
      },
    ])
    .springs([{ one: 0, two: 1, k: 1e-2, restingLen: 299.5 }])
    .build(),
  new WorldBuilder()
    .pos(20, 420, 100, 600)
    .dynamics([
      {
        box: yv(9, 0, 0),
      },
      {
        box: yv(591, 0, 0),
      },
    ])
    .springs([{ one: 0, two: 1, k: 1e-2, restingLen: 100 }])
    .build(),
  new WorldBuilder()
    .pos(220, 310, 100, 400)
    .dynamics([
      {
        box: yv(6, 1 / 3000, 0),
      },
      {
        box: yv(94, -1 / 3000, 0),
      },
      {
        box: yv(106, 1 / 3000, 0),
      },
      {
        box: yv(194, -1 / 3000, 0),
      },
      {
        box: yv(206, 1 / 3000, 0),
      },
      {
        box: yv(294, -1 / 3000, 0),
      },
      {
        box: yv(306, 1 / 3000, 0),
      },
      {
        box: yv(394, -1 / 3000, 0),
      },
    ])
    .build(),
  new WorldBuilder()
    .pos(20, 10, 140, 580)
    .dynamics([
      {
        box: yv(500, 0, 0),
        size: 24,
        color: "red",
        name: "a",
        mass: 3000,
      },
      {
        box: yv(500 - 12 - 50, 10 / 3000, 0),
        size: 300,
        color: "green",
        name: "b",
        mass: 3000,
      },
    ])
    .springs([{ one: 0, two: MAX_Y_ANCHOR, k: 10, restingLen: 80 }])
    .build(),
  new WorldBuilder()
    .pos(40, 160, 140, 580)
    .dynamics([
      {
        box: yv(500, 0, 0),
        size: 24,
        color: "red",
        name: "a",
        mass: 3000,
      },
      {
        box: yv(500 - 12 - 150, 10 / 3000, 0),
        size: 300,
        color: "green",
        name: "b",
        mass: 1500,
      },
    ])
    .springs([{ one: 0, two: MAX_Y_ANCHOR, k: 10, restingLen: 80 }])
    .build(),
];

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

  springs.sort((a, b) => {
    const [a1, a2] = getSpringEndpointY(w, a);
    const [b1, b2] = getSpringEndpointY(w, b);
    return -(b1 + b2 - a1 - a2);
  });

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
    rect(
      (w.MIN_X + w.MAX_X) / 2 - 6 - 1,
      y - halfSize - 1,
      12 + 2,
      2 * halfSize + 2,
    );
    fill("white");
    text(`${m} ${name}`, (w.MIN_X + w.MAX_X) / 2 + 2 * 6, y + 6 - 2);
  }
}

function drawWalls(w: DynamicsWorld) {
  stroke("#333");
  strokeWeight(10);
  line(w.MIN_X, w.MIN_Y - 5, w.MAX_X, w.MIN_Y - 5);
  line(w.MIN_X, w.MAX_Y + 5, w.MAX_X, w.MAX_Y + 5);

  strokeWeight(1);
  line(w.MIN_X, w.MIN_Y, w.MIN_X, w.MAX_Y);
  line(w.MAX_X, w.MIN_Y, w.MAX_X, w.MAX_Y);
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

    const nameOne = w.names[spring.one] ?? getAnchorName(spring.one);
    const nameTwo = w.names[spring.two] ?? getAnchorName(spring.two);
    stats.springs.push({
      name: `${nameOne}-${nameTwo}`,
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
    text(s, w.MIN_X, (yOffset += LINE_HEIGHT));
  }

  textln("");
  stats.boxes.sort((i, j) => i.y - j.y);
  for (const boxStat of stats.boxes) {
    fill(boxStat.color);
    textln(`${boxStat.name}.v=${boxStat.velocity.toFixed(2)}`);
    textln(`${boxStat.name}.acc=${boxStat.acc.toFixed(2)}`);
  }

  fill("white");
  for (const springStat of stats.springs) {
    textln(`${springStat.name}=${springStat.elasticEnergy.toFixed(2)}`);
  }

  textln(`\u03a3\u00bdmv\u00b2=${stats.totalKineticEnergy.toFixed(2)}\n`);
  textln(`\u03a3\u00bdkd\u00b2=${stats.totalElasticEnergy.toFixed(2)}\n`);
  textln(`\u03a3mgh=${stats.totalGraviPotential.toFixed(2)}\n`);
  textln(`\u03a3E=${stats.totalEnergy.toFixed(2)}\n`);
}

const frameTimeWindow = [];
function drawFrameTimeAndFrameCnt(ftWindow: number[], w: World) {
  const ft = ftWindow.reduce((a, b) => a + b, 0) / ftWindow.length;
  textSize(14);
  text(`${w.frameCnt}   ${ft.toFixed(2)}ms`, w.MIN_X, w.MAX_Y + 10 + 15);
}

export function draw() {
  strokeCap(SQUARE);
  background("#000");

  for (let i = 0; i < worlds.length; i++) {
    const frameStart = performance.now();

    let WORLD = worlds[i];

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
    drawFrameTimeAndFrameCnt(frameTimeWindow, WORLD);

    worlds[i] = WORLD;
  }
}

export function setup() {
  textSize(12);
  createCanvas(windowWidth, windowHeight);
}

export function emitEvent(ev: World["ctrl"]["events"][number]) {
  worlds.forEach((WORLD) => WORLD.ctrl.events.push(ev));
}
