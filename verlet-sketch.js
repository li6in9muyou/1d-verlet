function setup() {
  createCanvas(100, MAX_Y);
}

const MIN_Y = 0;
const MAX_Y = 600;
const HALF_SIZE = 6;

let a = {
  color: "green",
  prevY: 504,
  y: 500,
  acc: 0,
  m: 10,
};

let b = {
  color: "red",
  prevY: 16,
  y: 26,
  acc: 0,
  m: 10,
};

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
  const iTravel = (i.y - i.prevY) * elapsed;
  const jTravel = (j.y - j.prevY) * elapsed;

  const distance = Math.abs(i.y + iTravel - j.y + jTravel) - 2 * HALF_SIZE;
  const collide = distance < 0;

  console.log("libq docollide/distance", distance);
  if (collide) {
    console.log("libq docollide/BOOM", distance);
  }
}

const SUB_STEPS = 4;

function toSubVerlet(box, stepCnt) {
  const v = box.y - box.prevY;
  box.prevY = box.y - v / stepCnt;
  return box;
}

function toNormalVerlet(box, stepCnt) {
  const v = box.y - box.prevY;
  box.prevY = box.y - v * stepCnt;
  return box;
}

function draw() {
  background("#444");

  const aSub = toSubVerlet(a, SUB_STEPS);
  const bSub = toSubVerlet(b, SUB_STEPS);
  for (let sub = 0; sub < SUB_STEPS; sub++) {
    doDt(dt / SUB_STEPS, aSub);
    doBounds(aSub);
    doDt(dt / SUB_STEPS, bSub);
    doBounds(bSub);
    doCollide(dt / SUB_STEPS, aSub, bSub);
  }
  a = toNormalVerlet(aSub, SUB_STEPS);
  b = toNormalVerlet(bSub, SUB_STEPS);


  console.log("libq draw/v ", a.y - a.prevY);

  renderBox(a.y, a.color);
  text(`a=${a.y - a.prevY}`, 4, 30);

  renderBox(b.y, b.color);
  text(`b=${b.y - b.prevY}`, 4, 15);
}

function renderBox(y, color = "red") {
  fill(color);
  rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2);
}
