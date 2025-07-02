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

let c = {
  color: "green",
  prevY: 300,
  y: 300,
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
  const distance = Math.abs(i.y - j.y) - 2 * HALF_SIZE;
  const collide = distance < 0;

  if (collide) {
    console.log("libq docollide/BOOM", i.y, j.y, distance);

    const iV = (i.y - i.prevY) / elapsed;
    const jV = (j.y - j.prevY) / elapsed;
    const iNextV = (iV * (i.m - j.m) + 2 * j.m * jV) / (i.m + j.m);
    const jNextV = (jV * (j.m - i.m) + 2 * i.m * iV) / (i.m + j.m);

    const overlap = -distance;
    const totalMass = i.m + j.m;
    const iPush = (overlap * j.m) / totalMass;
    const jPush = (overlap * i.m) / totalMass;

    i.y = i.y + Math.sign(-iV) * iPush;
    j.y = j.y + Math.sign(-jV) * jPush;

    i.prevY = i.y - iNextV * elapsed;
    j.prevY = j.y - jNextV * elapsed;
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
  const cSub = toSubVerlet(c, SUB_STEPS);
  for (let sub = 0; sub < SUB_STEPS; sub++) {
    doDt(dt / SUB_STEPS, aSub);
    doBounds(aSub);
    doDt(dt / SUB_STEPS, bSub);
    doBounds(bSub);
    doDt(dt / SUB_STEPS, cSub);
    doBounds(cSub);
    doCollide(dt / SUB_STEPS, aSub, bSub);
    doCollide(dt / SUB_STEPS, bSub, cSub);
    doCollide(dt / SUB_STEPS, cSub, aSub);
  }
  a = toNormalVerlet(aSub, SUB_STEPS);
  b = toNormalVerlet(bSub, SUB_STEPS);
  c = toNormalVerlet(cSub, SUB_STEPS);

  console.assert(a.y > b.y, "a must be below b");

  renderBox(a.y, a.color);
  text(`a=${(a.y - a.prevY).toFixed(4)}`, 4, 15);

  renderBox(b.y, b.color);
  text(`b=${(b.y - b.prevY).toFixed(4)}`, 4, 30);

  renderBox(c.y, c.color);
  text(`c=${(c.y - c.prevY).toFixed(4)}`, 4, 45);

  fill("#fff");
  const aV = a.y - a.prevY;
  const bV = b.y - b.prevY;
  text(`\u03a3mv=${(a.m * aV + b.m * bV).toFixed(4)}`, 4, 60);
  text(
    `\u03a3\u00bdmv\u00b2=${(0.5 * a.m * aV * aV + 0.5 * b.m * bV * bV).toFixed(4)}`,
    4,
    75,
  );
}

function renderBox(y, color = "red") {
  fill(color);
  rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2);
}
