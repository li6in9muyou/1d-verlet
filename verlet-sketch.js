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

const SUB_STEPS = 4;

function draw() {
  background("#444");

  for (let sub = 0; sub < SUB_STEPS; sub++) {
    doDt(dt / SUB_STEPS, a);
    doBounds(a);
  }

  console.log("libq draw/v ", a.y - a.prevY);

  renderBox(a.y, "green");
  text(`a=${a.y - a.prevY}`, 4, 30);
}

function renderBox(y, color = "red") {
  fill(color);
  rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2);
}
