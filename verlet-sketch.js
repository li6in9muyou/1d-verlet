function setup() {
  createCanvas(100, MAX_Y);
}

const MIN_Y = 0;
const MAX_Y = 600;
const HALF_SIZE = 6;

const a = {
  prevY: 504,
  y: 500,
  acc: 0,
  m: 10,
};

const dt = 1;

function doDt(elapsed) {
  const nextY = 2 * a.y - a.prevY + a.acc * elapsed * elapsed;
  a.prevY = a.y;
  a.y = nextY;
}

function doBounds() {
  const v = a.y - a.prevY;

  if (a.y < 0 + HALF_SIZE) {
    a.y = 0 + HALF_SIZE;
    a.prevY = a.y + v;
  }
  if (a.y > MAX_Y - HALF_SIZE) {
    a.y = MAX_Y - HALF_SIZE;
    a.prevY = a.y + v;
  }
}

const SUB_STEPS = 4;

function draw() {
  background("#444");

  for (let sub = 0; sub < SUB_STEPS; sub++) {
    doDt(dt / SUB_STEPS);
    doBounds();
  }

  console.log("libq draw/v ", a.y - a.prevY);

  renderBox(a.y, "green");
  text(`a=${a.y - a.prevY}`, 4, 30);
}

function renderBox(y, color = "red") {
  fill(color);
  rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2);
}
