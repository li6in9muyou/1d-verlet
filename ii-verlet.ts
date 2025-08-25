import { DynamicsStuff, Painter, RenderStuff, Spring, Suitcase } from "./types";
import {
  afterAirDrag,
  afterGravity,
  afterResettingAcc,
  afterSpringForces,
  getAnchorName,
  getSpringEndpointY,
} from "./forces";
import { afterDrawing, afterHandlingEvents } from "./simctrl";
import { getV, yv } from "./ii-utils";
import allSuitcases from "./interesting-suitcases";
import { cloneDeep } from "lodash";
import { leftToRight } from "./layout";

export function afterCrashing(state: Suitcase): Suitcase {
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

export function afterMoving(state: Suitcase): Suitcase {
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

export function afterHittingWall(state: Suitcase): Suitcase {
  const nextBoxes = state.boxes.map((box, idx) => {
    const halfSize = state.sizes[idx] / 2;
    if (box.y > state.HEIGHT - halfSize) {
      const yOverBound = box.y - (state.HEIGHT - halfSize);
      const nextY = state.HEIGHT - halfSize - yOverBound;
      const nextV = -Math.abs(box.y - box.prevY);
      return yv(nextY, nextV, box.acc);
    }
    if (box.y < halfSize) {
      const yOverBound = halfSize - box.y;
      const nextY = halfSize + yOverBound;
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
  api: Painter,
) {
  const ij = Math.sign(j - i);

  const mid = (i + j) / 2;
  const halfLen = spring.restingLen / 2;
  api.stroke("white");
  api.strokeWeight(2);
  lineln(mid - halfLen * ij, mid + halfLen * ij, 0);

  const actualLen = Math.abs(i - j);
  let tensionColor: string;
  if (actualLen < spring.restingLen) {
    tensionColor = "red";
  } else if (actualLen > spring.restingLen) {
    tensionColor = "yellow";
  } else {
    tensionColor = "white";
  }
  api.stroke(tensionColor);
  api.strokeWeight(2);
  lineln(i, j, +RENDER_CONFIG.SPRING_TENSION_OFFSET);
}

function drawSprings(w: RenderStuff & DynamicsStuff, api: Painter) {
  const springs = w.springs;

  let xOffset = w.SPRING_X;
  function lineln(ya: number, yb: number, tempOffset: number) {
    const x = xOffset + tempOffset;
    api.line(x, ya, x, yb);
  }

  springs.sort((a, b) => {
    const [a1, a2] = getSpringEndpointY(w, a);
    const [b1, b2] = getSpringEndpointY(w, b);
    return -(b1 + b2 - a1 - a2);
  });

  for (const spring of springs) {
    const [ya, yb] = getSpringEndpointY(w, spring);
    xOffset += w.SPRING_MARGIN_X;
    drawOneSpring(spring, ya, yb, w, lineln, api);
  }
}

function drawBoxes(w: RenderStuff & DynamicsStuff, api: Painter) {
  for (const idx in w.boxes) {
    const box = w.boxes[idx];
    const size = w.sizes[idx];
    const halfSize = size / 2;
    const name = w.names[idx];
    const color = w.colors[idx];
    const m = w.masses[idx];

    const xBox = w.WIDTH / 2 - 6 - 1;
    const yBox = box.y - halfSize - 1;
    const xText = w.WIDTH / 2 + 2 * 6;
    const yText = box.y + 6 - 2;

    api.stroke("#000");
    api.strokeWeight(1);
    api.fill(color);
    api.rect(xBox, yBox, 12 + 2, 2 * halfSize + 2);
    api.fill("white");
    api.text(`${m} ${name}`, xText, yText);
  }
}

function drawWalls(w: RenderStuff & DynamicsStuff, api: Painter) {
  const xTL = 0;
  const yTL = 0;
  const xBR = w.WIDTH;
  const yBR = w.HEIGHT;

  api.stroke("#333");
  api.strokeWeight(10);
  api.line(xTL, yTL - 5, xBR, yTL - 5);
  api.line(xTL, yBR + 5, xBR, yBR + 5);

  api.strokeWeight(1);
  api.line(xTL, yTL, xTL, yBR);
  api.line(xBR, yTL, xBR, yBR);
}

export function getStats(w: Suitcase) {
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
    const gp = m * w.gravityAcc * -(box.y - w.HEIGHT);
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
      name: `${nameOne}-${spring.k}-${nameTwo}`,
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

// remove legacy chart history and draw helpers; replaced by Graph instances

function drawStats(w: Suitcase, api: Painter) {
  const stats = getStats(w);

  // update per-box graphs
  stats.boxes.sort((i, j) => i.y - j.y);
  for (const boxStat of stats.boxes) {
    w.boxGraphs[boxStat.name]?.addDataPoint({
      vel: boxStat.velocity,
      acc: boxStat.acc,
    });
  }

  // update energy graph
  w.energyGraph.addDataPoint({
    energy: stats.totalEnergy,
    kin: stats.totalKineticEnergy,
    elastic: stats.totalElasticEnergy,
  });

  // layout
  const chartHeight = 40;
  const chartSpacing = 5;
  const totalChartHeight = chartHeight + chartSpacing;
  const startY = w.HEIGHT + 15;

  // draw box graphs
  for (let i = 0; i < stats.boxes.length; i++) {
    const boxStat = stats.boxes[i];
    const chartY = startY + i * totalChartHeight;
    const g = w.boxGraphs[boxStat.name];
    if (g) {
      g.draw(api, 0, chartY, w.WIDTH, chartHeight);
    }
  }

  // draw energy graph after boxes
  const energyChartY = startY + stats.boxes.length * totalChartHeight;
  w.energyGraph.draw(api, 0, energyChartY, w.WIDTH, chartHeight);
}

let lastText = "";
let currentShowingSuitcases: Suitcase[] = [];
function getShowingSuitcases(): Suitcase[] {
  const text = localStorage.getItem("ii-verlet-showing-suitcases");

  if (text === lastText && currentShowingSuitcases.length > 0) {
    return currentShowingSuitcases;
  }

  lastText = text;

  if (!text) {
    currentShowingSuitcases = [];
    return [];
  }

  const suitcaseNames = JSON.parse(text) || [];
  const newSuitcases: Suitcase[] = [];

  for (const name of suitcaseNames) {
    const init = allSuitcases.find((s) => s.name === name);
    if (!init) {
      console.error(
        "suitcase saved in localstorage is not valid",
        name,
        allSuitcases,
        text,
      );
      continue;
    }

    const existingSuitcase = currentShowingSuitcases.find(
      (s) => s.name === name,
    );
    if (existingSuitcase) {
      newSuitcases.push(existingSuitcase);
    } else {
      newSuitcases.push(cloneDeep(init));
    }
  }

  currentShowingSuitcases = newSuitcases;
  return newSuitcases;
}

function computeLayout(suitcases: Suitcase[]): {
  suitcase: Suitcase;
  transform: (x: number, y: number) => [number, number];
}[] {
  if (suitcases.length === 0) {
    return [];
  }

  const rectangles = suitcases.map((suitcase) => ({
    w: suitcase.WIDTH,
    h: suitcase.HEIGHT,
  }));
  const [transforms] = leftToRight(rectangles);

  return suitcases.map((suitcase, index) => ({
    suitcase,
    transform: transforms[index],
  }));
}

function makeApi(
  transform: (x: number, y: number) => [number, number],
): Painter {
  return {
    noFill: window.noFill,
    fill: window.fill,
    noStroke: window.noStroke,
    stroke: window.stroke,
    strokeWeight: window.strokeWeight,
    textSize: window.textSize,
    text: function (str: string, _x: number, _y: number) {
      const [x, y] = transform(_x, _y);
      window.text(str, x, y);
    },
    rect: function (_x: number, _y: number, w: number, h: number) {
      const [x, y] = transform(_x, _y);
      window.rect(x, y, w, h);
    },
    line: function (_x: number, _y: number, _xx: number, _yy: number) {
      const [x, y] = transform(_x, _y);
      const [xx, yy] = transform(_xx, _yy);
      window.line(x, y, xx, yy);
    },
  };
}

export function draw() {
  textFont("monospace");
  strokeCap(SQUARE);
  background("#000");

  const showing = getShowingSuitcases();
  const layouts = computeLayout(showing);

  for (let i = 0; i < layouts.length; i++) {
    const frameStart = performance.now();
    const d = layouts[i];
    let SCASE = d.suitcase;
    const API = makeApi(d.transform);

    SCASE = afterHandlingEvents(SCASE);

    if (SCASE.ctrl.playing) {
      SCASE.frameCnt++;
      SCASE = afterSimulate(SCASE);
      SCASE = afterDrawing(SCASE);
    }

    drawBoxes(SCASE, API);
    drawWalls(SCASE, API);
    drawSprings(SCASE, API);
    drawStats(SCASE, API);

    const frameTime = performance.now() - frameStart;
    SCASE.frameTimeGraph.addDataPoint({ ft: frameTime });

    const chartHeight = 40;
    const chartSpacing = 5;
    const totalChartHeight = chartHeight + chartSpacing;
    const startY = SCASE.HEIGHT + 15; // 增加底部 margin，隔开边界与第一个图表
    // 能量图表在所有 box 图表之后
    const energyChartY = startY + SCASE.boxes.length * totalChartHeight;
    // 帧时间图表在能量图表之后
    const frameTimeChartY = energyChartY + totalChartHeight;

    // 3. 绘制帧时间图表
    SCASE.frameTimeGraph.draw(
      API,
      0,
      frameTimeChartY,
      SCASE.WIDTH,
      chartHeight,
    );

    showing[i] = SCASE;
  }
}

export function setup() {
  createCanvas(windowWidth, windowHeight);
}

export function emitEvent(ev: Suitcase["ctrl"]["events"][number]) {
  getShowingSuitcases().forEach((SCASE) => SCASE.ctrl.events.push(ev));
}

function afterSimulate(SCASE: Suitcase) {
  const steps = 1 / SCASE.dt;
  for (let i = 0; i < steps; i++) {
    SCASE = { ...SCASE };
    SCASE = afterMoving(SCASE);
    SCASE = afterHittingWall(SCASE);
    SCASE = afterCrashing(SCASE);
    SCASE = afterResettingAcc(SCASE);
    SCASE = afterAirDrag(SCASE);
    SCASE = afterGravity(SCASE);
    SCASE = afterSpringForces(SCASE);
  }
  return SCASE;
}

export function afterOfflineSimulate(
  iterations: number,
  SCASE: Suitcase,
): Suitcase {
  for (let i = 0; i < iterations; i++) {
    SCASE = afterSimulate(SCASE);
  }
  return SCASE;
}
