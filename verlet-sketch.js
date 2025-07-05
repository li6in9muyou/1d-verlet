export function setup() {
  textSize(2 * HALF_SIZE);
  createCanvas(100, MAX_Y + 300);
}

const MIN_Y = 0;
const MAX_Y = 600;
const HALF_SIZE = 6;
const SUB_STEPS = 320;

let boxes = [
  {
    color: "red",
    prevY: 400,
    y: 400,
    acc: 0,
    m: 10,
    name: "b",
  },
  {
    color: "green",
    prevY: 480,
    y: 480,
    acc: 0,
    m: 10,
    name: "a",
  },
];
boxes.forEach((box) => (box.size = HALF_SIZE * 2));

const springs = [
  {
    one: "a",
    two: "b",
    k: 1e-2,
    // restingLen: 80,
    restingLen: 70,
  },
];

export function doSprings(springs, boxes) {
  springs.forEach((spring) => {
    const i = getBoxByName(boxes, spring.one);
    const j = getBoxByName(boxes, spring.two);

    const ji = i.y - j.y;
    const actualLen = Math.abs(ji);
    const displacement = actualLen - spring.restingLen;

    const force = spring.k * displacement;
    const iForce = -force * Math.sign(ji);
    const jForce = -iForce;

    i.acc += iForce / i.m;
    j.acc += jForce / j.m;
  });
}

const SPRING_X = 20;
const SPRING_TENSION_OFFSET = 4;
function renderSprings(springs, boxes) {
  for (const spring of springs) {
    const i = getBoxByName(boxes, spring.one);
    const j = getBoxByName(boxes, spring.two);
    renderOneSpring(spring, i, j);
  }
}

function renderOneSpring(spring, i, j) {
  stroke("white");
  strokeWeight(2);
  const ij = Math.sign(j.y - i.y);
  line(SPRING_X, i.y, SPRING_X, i.y + spring.restingLen * ij);

  const actualLen = Math.abs(i.y - j.y);
  let tensionColor;
  if (actualLen < spring.restingLen) {
    tensionColor = "red";
  } else if (actualLen > spring.restingLen) {
    tensionColor = "yellow";
  } else {
    tensionColor = "white";
  }
  stroke(tensionColor);
  strokeWeight(2);
  line(
    SPRING_X + SPRING_TENSION_OFFSET,
    i.y,
    SPRING_X + SPRING_TENSION_OFFSET,
    j.y,
  );
}

// boxes.forEach((box) => (box.acc = 0.6));

const dt = 1;

export function doDt(elapsed, box) {
  const nextY = 2 * box.y - box.prevY + box.acc * elapsed * elapsed;
  box.prevY = box.y;
  box.y = nextY;
}

export function boundLowerAndUpperY(box, lower, upper) {
  const v = box.y - box.prevY;
  const sizeToCenter = box.size / 2;

  if (box.y < lower + sizeToCenter) {
    box.y = lower + sizeToCenter;
    box.prevY = box.y + v;
  }
  if (box.y > upper - sizeToCenter) {
    box.y = upper - sizeToCenter;
    box.prevY = box.y + v;
  }
}

const CTX = {
  boundings: [(box) => boundLowerAndUpperY(box, MIN_Y, MAX_Y)],
};

function doBounds(ctx, box) {
  ctx.boundings.forEach((bd) => {
    bd(box);
  });
}

export function doCollide(elapsed, i, j) {
  const distance = Math.abs(i.y - j.y) - 2 * HALF_SIZE;
  const collide = distance < 0;

  if (collide) {
    const iV = (i.y - i.prevY) / elapsed;
    const jV = (j.y - j.prevY) / elapsed;
    const iNextV = (iV * (i.m - j.m) + 2 * j.m * jV) / (i.m + j.m);
    const jNextV = (jV * (j.m - i.m) + 2 * i.m * iV) / (i.m + j.m);

    const overlap = -distance;
    const totalMass = i.m + j.m;
    const iPush = (overlap * j.m) / totalMass;
    const jPush = (overlap * i.m) / totalMass;

    const jToI = Math.sign(i.y - j.y);
    i.y += iPush * jToI;
    j.y -= jPush * jToI;

    i.prevY = i.y - iNextV * elapsed;
    j.prevY = j.y - jNextV * elapsed;
  }
}

function toSubVerlet(box, stepCnt) {
  const v = box.y - box.prevY;
  return { ...box, prevY: box.y - v / stepCnt };
}

function toNormalVerlet(box, stepCnt) {
  const v = box.y - box.prevY;
  return { ...box, prevY: box.y - v * stepCnt };
}

function getBoxByName(boxes, name) {
  return boxes.find((b) => b.name === name);
}

export function draw() {
  background("#444");

  for (const box of boxes) {
    box.acc = 0;
  }

  let subBoxes = [];
  for (let i = 0; i < boxes.length; i++) {
    subBoxes.push(toSubVerlet(boxes[i], SUB_STEPS));
  }

  for (let sub = 0; sub < SUB_STEPS; sub++) {
    for (let i = 0; i < subBoxes.length; i++) {
      doDt(dt / SUB_STEPS, subBoxes[i]);
      doBounds(CTX, subBoxes[i]);
    }

    for (let i = 0; i < subBoxes.length; i++) {
      for (let j = i + 1; j < subBoxes.length; j++) {
        doCollide(dt / SUB_STEPS, subBoxes[i], subBoxes[j]);
      }
    }

    doSprings(springs, subBoxes);
  }

  for (let i = 0; i < boxes.length; i++) {
    boxes[i] = toNormalVerlet(subBoxes[i], SUB_STEPS);
  }

  renderBox(boxes);

  renderSprings(springs, boxes);

  renderStats(boxes, springs);
}

function renderBox(boxes) {
  for (const box of boxes) {
    const y = box.y;
    stroke("#000");
    strokeWeight(1);
    fill(box.color);
    rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2 - 2);
    text(box.m, 100 / 2 + 2 * HALF_SIZE, y + HALF_SIZE - 2);
  }
}

// Data structure for all simulation stats
export function getStats(boxes, springs) {
  const stats = {
    boxes: [],
    springs: [],
    totalKineticEnergy: 0,
    totalElasticEnergy: 0,
    totalEnergy: 0,
  };

  for (const box of boxes) {
    const v = box.y - box.prevY;
    const ke = 0.5 * box.m * v * v;
    stats.boxes.push({
      name: box.name,
      velocity: v,
      kineticEnergy: ke,
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

function StatsSmoothed(getStats) {
  // 滑动窗口大小
  const WINDOW_SIZE = 800;

  // 初始化滑动窗口缓存
  const kineticEnergyBuffer = Array(WINDOW_SIZE).fill(0);
  const elasticEnergyBuffer = Array(WINDOW_SIZE).fill(0);
  const totalEnergyBuffer = Array(WINDOW_SIZE).fill(0);

  // 缓冲区指针
  let bufferIndex = 0;
  // 记录已收集的数据点数量（用于初始化阶段）
  let dataPoints = 0;

  return function (boxes, springs) {
    // 调用原始函数获取当前统计数据
    const stats = getStats(boxes, springs);

    // 将当前值添加到滑动窗口缓冲区
    kineticEnergyBuffer[bufferIndex] = stats.totalKineticEnergy;
    elasticEnergyBuffer[bufferIndex] = stats.totalElasticEnergy;
    totalEnergyBuffer[bufferIndex] = stats.totalEnergy;

    // 更新缓冲区指针和数据点计数
    bufferIndex = (bufferIndex + 1) % WINDOW_SIZE;
    dataPoints = Math.min(dataPoints + 1, WINDOW_SIZE);

    // 计算滑动窗口平均值
    const sumKE = kineticEnergyBuffer
      .slice(0, dataPoints)
      .reduce((a, b) => a + b, 0);
    const sumEE = elasticEnergyBuffer
      .slice(0, dataPoints)
      .reduce((a, b) => a + b, 0);
    const sumTE = totalEnergyBuffer
      .slice(0, dataPoints)
      .reduce((a, b) => a + b, 0);

    // 创建新的统计对象，使用平滑后的值
    const smoothedStats = {
      ...stats,
      totalKineticEnergy: sumKE / dataPoints,
      totalElasticEnergy: sumEE / dataPoints,
      totalEnergy: sumTE / dataPoints,
    };

    return smoothedStats;
  };
}

// Function to render the calculated stats
const LINE_HEIGHT = 15;
const STAT_TOP_LEFT = {
  x: 4,
  y: MAX_Y,
};
let _nextLineY = STAT_TOP_LEFT.y;

function resetStatNextLineY() {
  _nextLineY = STAT_TOP_LEFT.y;
}

function getNextLineY() {
  return (_nextLineY += LINE_HEIGHT);
}

const getStatsSmoothed = StatsSmoothed(getStats);
function renderStats(boxes, springs) {
  const stats = getStatsSmoothed(boxes, springs);

  resetStatNextLineY();
  stroke("blue");
  line(0, STAT_TOP_LEFT.y, 100, STAT_TOP_LEFT.y);

  noStroke();
  fill("white");

  for (const boxStat of stats.boxes) {
    text(
      `${boxStat.name}=${boxStat.velocity.toFixed(2)}`,
      STAT_TOP_LEFT.x,
      getNextLineY(),
    );
  }
  for (const springStat of stats.springs) {
    text(
      `${springStat.name}=${springStat.elasticEnergy.toFixed(2)}`,
      STAT_TOP_LEFT.x,
      getNextLineY(),
    );
  }

  text(
    `\u03a3\u00bdmv\u00b2=${stats.totalKineticEnergy.toFixed(2)}`,
    STAT_TOP_LEFT.x,
    getNextLineY(),
  );
  text(
    `\u03a3\u00bdkd\u00b2=${stats.totalElasticEnergy.toFixed(2)}`,
    STAT_TOP_LEFT.x,
    getNextLineY(),
  );
  text(
    `\u03a3E=${stats.totalEnergy.toFixed(2)}`,
    STAT_TOP_LEFT.x,
    getNextLineY(),
  );
}
