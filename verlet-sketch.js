// World object to hold simulation data
const WORLD = {
  MIN_Y: 0,
  MAX_Y: 600,
  boxes: [
    {
      color: "#f0f",
      prevY: 50,
      y: 50,
      acc: 0,
      m: 10,
      name: "d",
      halfSize: 6,
    },
    {
      color: "#0ff",
      prevY: 100,
      y: 100,
      acc: 0,
      m: 10,
      name: "c",
      halfSize: 6,
    },
    {
      color: "red",
      prevY: 300,
      y: 295,
      acc: 0,
      m: 20,
      name: "b",
      halfSize: 25 + 6,
    },
  ],
  springs: [],
  rods: [
    {
      one: "c",
      two: "d",
      len: 50,
    },
  ],
};

WORLD.boxes.forEach((box) => (box.size = box.halfSize * 2));

function getBoxByName(boxes, name) {
  return boxes.find((b) => b.name === name);
}

export function setup() {
  textSize(2 * WORLD.boxes[0].halfSize);
  createCanvas(100, WORLD.MAX_Y + 300);
}

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
  line(
    RENDER_CONFIG.SPRING_X,
    i.y,
    RENDER_CONFIG.SPRING_X,
    i.y + spring.restingLen * ij,
  );

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
    RENDER_CONFIG.SPRING_X + RENDER_CONFIG.SPRING_TENSION_OFFSET,
    i.y,
    RENDER_CONFIG.SPRING_X + RENDER_CONFIG.SPRING_TENSION_OFFSET,
    j.y,
  );
}

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

function doBounds(box) {
  return boundLowerAndUpperY(box, WORLD.MIN_Y, WORLD.MAX_Y);
}

export function doCollide(elapsed, i, j, boxes, rods) {
  const distance = Math.abs(i.y - j.y) - i.halfSize - j.halfSize;
  const collide = distance < 0;

  if (collide) {
    if (undefined === boxes) {
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

      return;
    }

    // 1. 构建i和j的连接组
    const iConnect = new Set([i.name]);
    const jConnect = new Set([j.name]);

    // 递归查找所有通过杆连接的物体
    function findConnected(boxName, set) {
      rods.forEach((rod) => {
        if (rod.one === boxName && !set.has(rod.two)) {
          set.add(rod.two);
          findConnected(rod.two, set);
        }
        if (rod.two === boxName && !set.has(rod.one)) {
          set.add(rod.one);
          findConnected(rod.one, set);
        }
      });
    }

    findConnected(i.name, iConnect);
    findConnected(j.name, jConnect);

    // 2. 计算连接组的总质量
    const iParty = {
      m: [...iConnect].reduce(
        (sum, name) => sum + getBoxByName(boxes, name).m,
        0,
      ),
    };
    const jParty = {
      m: [...jConnect].reduce(
        (sum, name) => sum + getBoxByName(boxes, name).m,
        0,
      ),
    };

    // 3. 计算碰撞后的速度
    const iV = (i.y - i.prevY) / elapsed;
    const jV = (j.y - j.prevY) / elapsed;
    const iNextV =
      (iV * (iParty.m - jParty.m) + 2 * jParty.m * jV) / (iParty.m + jParty.m);
    const jNextV =
      (jV * (jParty.m - iParty.m) + 2 * iParty.m * iV) / (iParty.m + jParty.m);

    // 4. 计算重叠量和位置调整
    const overlap = -distance;
    const totalMass = iParty.m + jParty.m;
    const iPush = (overlap * jParty.m) / totalMass;
    const jPush = (overlap * iParty.m) / totalMass;

    const jToI = Math.sign(i.y - j.y);

    // 5. 调整连接组中所有物体的位置
    [...iConnect].forEach((name) => {
      const box = getBoxByName(boxes, name);
      box.y += iPush * jToI;
    });

    [...jConnect].forEach((name) => {
      const box = getBoxByName(boxes, name);
      box.y -= jPush * jToI;
    });

    // 6. 调整连接组中所有物体的速度
    const iFinalV = iNextV * elapsed;
    const jFinalV = jNextV * elapsed;

    [...iConnect].forEach((name) => {
      const box = getBoxByName(boxes, name);
      box.prevY = box.y - iFinalV;
    });

    [...jConnect].forEach((name) => {
      const box = getBoxByName(boxes, name);
      box.prevY = box.y - jFinalV;
    });
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

function doRods(elapsed, rods, boxes) {
  rods.forEach((rod) => {
    const i = getBoxByName(boxes, rod.one);
    const j = getBoxByName(boxes, rod.two);

    const d1 = i.prevY - j.prevY;
    const d2 = Math.abs(d1);
    const d3 = (d2 - rod.len) / d2;

    j.y = j.y + 0.5 * d1 * d3;
    i.y = i.y - 0.5 * d1 * d3;
  });
}

function renderRods(rods, boxes) {
  stroke("orange");
  strokeWeight(4);

  for (const rod of rods) {
    const i = getBoxByName(boxes, rod.one);
    const j = getBoxByName(boxes, rod.two);
    const ij = Math.sign(j.y - i.y);
    line(RENDER_CONFIG.ROD_X, i.y, RENDER_CONFIG.ROD_X, i.y + rod.len * ij);
  }
}

function renderBox(boxes) {
  for (const box of boxes) {
    const y = box.y;
    stroke("#000");
    strokeWeight(1);
    fill(box.color);
    rect(100 / 2 - 6 - 1, y - box.halfSize - 1, 12 + 2, 2 * box.halfSize + 2);
    fill("white");
    text(`${box.m} ${box.name}`, 100 / 2 + 2 * 6, y + 6 - 2);
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
      // TODO: find another way to pass data to renderStats
      color: box.color,
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

function StatsSmoothed(getStats) {
  // Sliding window size
  const WINDOW_SIZE = 50;

  // Initialize the sliding window buffer
  const kineticEnergyBuffer = Array(WINDOW_SIZE).fill(0);
  const elasticEnergyBuffer = Array(WINDOW_SIZE).fill(0);
  const totalEnergyBuffer = Array(WINDOW_SIZE).fill(0);

  // Buffer pointer
  let bufferIndex = 0;
  // Record the number of collected data points (for the initialization phase)
  let dataPoints = 0;

  return function (boxes, springs) {
    // Call the original function to get the current statistical data
    const stats = getStats(boxes, springs);

    // Add the current value to the sliding window buffer
    kineticEnergyBuffer[bufferIndex] = stats.totalKineticEnergy;
    elasticEnergyBuffer[bufferIndex] = stats.totalElasticEnergy;
    totalEnergyBuffer[bufferIndex] = stats.totalEnergy;

    // Update the buffer pointer and data point count
    bufferIndex = (bufferIndex + 1) % WINDOW_SIZE;
    dataPoints = Math.min(dataPoints + 1, WINDOW_SIZE);

    // Calculate the sliding window average
    const sumKE = kineticEnergyBuffer
      .slice(0, dataPoints)
      .reduce((a, b) => a + b, 0);
    const sumEE = elasticEnergyBuffer
      .slice(0, dataPoints)
      .reduce((a, b) => a + b, 0);
    const sumTE = totalEnergyBuffer
      .slice(0, dataPoints)
      .reduce((a, b) => a + b, 0);

    // Create a new statistical object using the smoothed values
    const smoothedStats = {
      ...stats,
      totalKineticEnergy: sumKE / dataPoints,
      totalElasticEnergy: sumEE / dataPoints,
      totalEnergy: sumTE / dataPoints,
    };

    return smoothedStats;
  };
}

// Global object for rendering configuration
const RENDER_CONFIG = {
  SPRING_X: 20,
  SPRING_TENSION_OFFSET: 4,
  ROD_X: 35,
  LINE_HEIGHT: 15,
  STAT_TOP_LEFT: {
    x: 4,
    y: 600,
  },
};

// Function to render the calculated stats
let _nextLineY = RENDER_CONFIG.STAT_TOP_LEFT.y;

function resetStatNextLineY() {
  _nextLineY = RENDER_CONFIG.STAT_TOP_LEFT.y;
}

function getNextLineY() {
  return (_nextLineY += RENDER_CONFIG.LINE_HEIGHT);
}

const getStatsSmoothed = StatsSmoothed(getStats);
function renderStats(boxes, springs) {
  const stats = getStatsSmoothed(boxes, springs);

  resetStatNextLineY();
  stroke("blue");
  line(0, RENDER_CONFIG.STAT_TOP_LEFT.y, 100, RENDER_CONFIG.STAT_TOP_LEFT.y);

  noStroke();
  fill("white");

  stats.boxes.sort((i, j) => i.y - j.y);
  for (const boxStat of stats.boxes) {
    fill(boxStat.color);
    text(
      `${boxStat.name}=${boxStat.velocity.toFixed(2)}`,
      RENDER_CONFIG.STAT_TOP_LEFT.x,
      getNextLineY(),
    );
  }
  fill("white");
  for (const springStat of stats.springs) {
    text(
      `${springStat.name}=${springStat.elasticEnergy.toFixed(2)}`,
      RENDER_CONFIG.STAT_TOP_LEFT.x,
      getNextLineY(),
    );
  }

  text(
    `\u03a3\u00bdmv\u00b2=${stats.totalKineticEnergy.toFixed(2)}`,
    RENDER_CONFIG.STAT_TOP_LEFT.x,
    getNextLineY(),
  );
  text(
    `\u03a3\u00bdkd\u00b2=${stats.totalElasticEnergy.toFixed(2)}`,
    RENDER_CONFIG.STAT_TOP_LEFT.x,
    getNextLineY(),
  );
  text(
    `\u03a3E=${stats.totalEnergy.toFixed(2)}`,
    RENDER_CONFIG.STAT_TOP_LEFT.x,
    getNextLineY(),
  );
}

// Function to run one step of the simulation
function runSimulationStep(world, simConfig) {
  const { dt, SUB_STEPS } = simConfig;
  let subBoxes = [];
  for (let i = 0; i < world.boxes.length; i++) {
    subBoxes.push(toSubVerlet(world.boxes[i], SUB_STEPS));
  }

  for (let sub = 0; sub < SUB_STEPS; sub++) {
    for (const box of subBoxes) {
      box.acc = 0;
    }
    doSprings(world.springs, subBoxes);

    for (let i = 0; i < subBoxes.length; i++) {
      doDt(dt / SUB_STEPS, subBoxes[i]);
      doBounds(subBoxes[i]);
    }

    for (let i = 0; i < subBoxes.length; i++) {
      for (let j = i + 1; j < subBoxes.length; j++) {
        doCollide(
          dt / SUB_STEPS,
          subBoxes[i],
          subBoxes[j],
          subBoxes,
          world.rods,
        );
      }
    }
    doRods(dt / SUB_STEPS, world.rods, subBoxes);
  }

  for (let i = 0; i < world.boxes.length; i++) {
    world.boxes[i] = toNormalVerlet(subBoxes[i], SUB_STEPS);
  }
}

const SIM_CONFIG = {
  dt: 1,
  SUB_STEPS: 320,
};

export function draw() {
  background("#444");
  runSimulationStep(WORLD, SIM_CONFIG);

  renderBox(WORLD.boxes);
  renderSprings(WORLD.springs, WORLD.boxes);
  renderRods(WORLD.rods, WORLD.boxes);
  renderStats(WORLD.boxes, WORLD.springs);
}
