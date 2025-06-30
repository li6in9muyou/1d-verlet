function setup() {
  createCanvas(100, MAX_Y);
}

const MIN_Y = 0;
const MAX_Y = 600;
const HALF_SIZE = 6;

const a = {
  prevY: 508,
  y: 500,
  acc: 0,
  m: 10,
  get v() {
    return a.y - a.prevY;
  },
};

const dt = 1;

function doDt(elapsed) {
  const nextY = a.y + a.v * elapsed + a.acc * elapsed * elapsed;
  a.prevY = a.y;
  a.y = nextY;
}

function doBounds() {
  if (a.y < 0 + HALF_SIZE) {
    a.prevY = a.y;
    a.y = 0 + HALF_SIZE;
  }
  if (a.y > MAX_Y - HALF_SIZE) {
    a.prevY = a.y;
    a.y = MAX_Y - HALF_SIZE;
  }
}

function draw() {
  background("#444");

  doDt(dt);
  console.log("libq draw/v after dodt", a.v);
  doBounds();
  console.log("libq draw/v after bounds", a.v);

  renderBox(a.y, "green");
  text(`a=${a.y - a.prevY}`, 4, 30);
}

function renderBox(y, color = "red") {
  fill(color);
  rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2);
}
