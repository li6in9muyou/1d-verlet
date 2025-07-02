function setup() {
  noStroke();
  createCanvas(100, MAX_Y);
}

const MIN_Y = 0;
const MAX_Y = 600;
const HALF_SIZE = 6;

let boxes = [];

boxes.push({
  color: "green",
  prevY: 504,
  y: 500,
  acc: 0,
  m: 10,
  name: "a",
});

boxes.push({
  color: "red",
  prevY: 16,
  y: 26,
  acc: 0,
  m: 10,
  name: "b",
});

boxes.push({
  color: "blue",
  prevY: 300,
  y: 300,
  acc: 0,
  m: 10,
  name: "c",
});


const dt = 1;

function doDt(elapsed, box) {
  const nextY = 2 * box.y - box.prevY + box.acc * elapsed * elapsed;
  box.prevY = box.y;
  box.y = nextY;
}

function doBounds(box) {
  const v = box.y - box.prevY;

  if (box.y < 0 + HALF_SIZE) {
    box.y = 0 + HALF_SIZE;
    box.prevY = box.y + v;
  }
  if (box.y > MAX_Y - HALF_SIZE) {
    box.y = MAX_Y - HALF_SIZE;
    box.prevY = box.y + v;
  }
}

function doCollide(elapsed, i, j) {
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

    if (i.y > j.y) {
      i.y += iPush;
      j.y -= jPush;
    } else {
      i.y -= iPush;
      j.y += jPush;
    }

    i.prevY = i.y - iNextV * elapsed;
    j.prevY = j.y - jNextV * elapsed;
  }
}

const SUB_STEPS = 4;

function toSubVerlet(box, stepCnt) {
  const v = box.y - box.prevY;
  return { ...box, prevY: box.y - v / stepCnt };
}

function toNormalVerlet(box, stepCnt) {
  const v = box.y - box.prevY;
  return { ...box, prevY: box.y - v * stepCnt };
}

function draw() {
  background("#444");

  let subBoxes = [];
  for (let i = 0; i < boxes.length; i++) {
    subBoxes.push(toSubVerlet(boxes[i], SUB_STEPS));
  }

  for (let sub = 0; sub < SUB_STEPS; sub++) {
    for (let i = 0; i < subBoxes.length; i++) {
      doDt(dt / SUB_STEPS, subBoxes[i]);
      doBounds(subBoxes[i]);
    }

    for (let i = 0; i < subBoxes.length; i++) {
      for (let j = i + 1; j < subBoxes.length; j++) {
        doCollide(dt / SUB_STEPS, subBoxes[i], subBoxes[j]);
      }
    }
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

  fill("#fff");
  text(`\u03a3mv=${totalMomentum.toFixed(4)}`, 4, textY);
  textY += 15;
  text(`\u03a3\u00bdmv\u00b2=${totalKineticEnergy.toFixed(4)}`, 4, textY);
}

function renderBox(y, color = "red") {
  fill(color);
  rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2);
}
