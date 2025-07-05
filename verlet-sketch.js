export function setup() {
  createCanvas(100, MAX_Y);
}

const MIN_Y = 0;
const MAX_Y = 600;
const HALF_SIZE = 6;

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
    prevY: 504,
    y: 500,
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
    k: 1e-4,
    restingLen: 6 * 2 * HALF_SIZE,
  },
];

function buildSpringConnectionsMap(boxes, springs) {
  const boxByName = new Map();
  boxes.forEach((box) => {
    boxByName.set(box.name, box);
  });

  const springConnectionsMap = new Map();

  boxes.forEach((box) => {
    springConnectionsMap.set(box, []);
  });

  springs.forEach((spring) => {
    const boxOne = boxByName.get(spring.one);
    const boxTwo = boxByName.get(spring.two);

    springConnectionsMap.get(boxOne).push({
      otherBox: boxTwo,
      k: spring.k,
      restingLen: spring.restingLen,
    });

    springConnectionsMap.get(boxTwo).push({
      otherBox: boxOne,
      k: spring.k,
      restingLen: spring.restingLen,
    });
  });

  return springConnectionsMap;
}

function doSprings(springConnectionsMap) {
  for (const [box, connections] of springConnectionsMap.entries()) {
    connections.forEach((connection) => {
      const otherBox = connection.otherBox;
      const k = connection.k;
      const restingLen = connection.restingLen;

      // Process each spring force only once per pair.
      // Use box `name` for consistent ordering to prevent double-counting.
      if (box.name > otherBox.name) {
        return;
      }

      const deltaY = box.y - otherBox.y;
      const actualLen = Math.abs(deltaY);
      const displacement = actualLen - restingLen;

      const forceMagnitude = k * displacement;

      const forceOnBoxY = -forceMagnitude * Math.sign(deltaY);
      const forceOnOtherBoxY = -forceOnBoxY;

      box.acc += forceOnBoxY / box.m;
      otherBox.acc += forceOnOtherBoxY / otherBox.m;
    });
  }
}

function renderSprings(springs, boxByName) {
  const springIndicatorX = 20;
  const lineThickness = 2;

  for (const spring of springs) {
    const i = boxByName.get(spring.one);
    const j = boxByName.get(spring.two);
    const actualLen = Math.abs(i.y - j.y);
    const jiDir = Math.sign(i.y - j.y);
    drawSpringLengths(
      springIndicatorX,
      i.y,
      -jiDir * spring.restingLen,
      -jiDir * actualLen,
      lineThickness,
    );
  }
}

function drawSpringLengths(
  xPos,
  yStart,
  restingLen,
  actualLen,
  lineThickness = 2,
) {
  stroke(255); // White for resting length
  strokeWeight(lineThickness);
  line(xPos, yStart, xPos, yStart + restingLen);

  let actualLineColor;
  if (actualLen < restingLen) {
    actualLineColor = color(255, 0, 0); // Red if shorter
  } else if (actualLen > restingLen) {
    actualLineColor = color(255, 255, 0); // Yellow if longer
  } else {
    actualLineColor = color(255); // White if equal
  }

  stroke(actualLineColor);
  line(
    xPos + lineThickness * 2,
    yStart,
    xPos + lineThickness * 2,
    yStart + actualLen,
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

const SUB_STEPS = 14;

function toSubVerlet(box, stepCnt) {
  const v = box.y - box.prevY;
  return { ...box, prevY: box.y - v / stepCnt };
}

function toNormalVerlet(box, stepCnt) {
  const v = box.y - box.prevY;
  return { ...box, prevY: box.y - v * stepCnt };
}

export function draw() {
  background("#444");

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

    const springConnections = buildSpringConnectionsMap(subBoxes, springs);
    doSprings(springConnections);
  }

  for (let i = 0; i < boxes.length; i++) {
    boxes[i] = toNormalVerlet(subBoxes[i], SUB_STEPS);
  }

  let textY = 15;
  let totalMomentum = 0;
  let totalKineticEnergy = 0;

  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    renderBox(box.y, box.color);
    const v = box.y - box.prevY;

    text(`${box.name}=${v.toFixed(4)}`, 4, textY);
    textY += 15;

    totalMomentum += box.m * v;
    totalKineticEnergy += 0.5 * box.m * v * v;
  }

  const boxByName = new Map();
  boxes.forEach((box) => {
    boxByName.set(box.name, box);
  });

  renderSprings(springs, boxByName);

  fill("#fff");
  text(`\u03a3mv=${totalMomentum.toFixed(4)}`, 4, textY);
  textY += 15;
  text(`\u03a3\u00bdmv\u00b2=${totalKineticEnergy.toFixed(4)}`, 4, textY);
}

function renderBox(y, color = "red") {
  stroke("#000");
  fill(color);
  rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2);
}
