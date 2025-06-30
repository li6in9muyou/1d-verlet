function setup() {
  createCanvas(100, MAX_Y);
}

const MIN_Y = 0;
const MAX_Y = 600;
const HALF_SIZE = 6;

const a = {
  color: "green",
  prevY: 504,
  y: 500,
  acc: 0,
  m: 10,
};

const b = {
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

function doCollide(i, j) {
  const distance = Math.abs(Math.abs(i.y - j.y) - 2 * HALF_SIZE);
  const collide = distance < 1e-3;

  if (collide) {
    console.log("libq docollide/BOOM", distance);
  }
}

const SUB_STEPS = 1;

function draw() {
  background("#444");

  for (let sub = 0; sub < SUB_STEPS; sub++) {
    doDt(dt / SUB_STEPS, a);
    doBounds(a);
    doDt(dt / SUB_STEPS, b);
    doBounds(b);
    doCollide(a, b);
  }

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
