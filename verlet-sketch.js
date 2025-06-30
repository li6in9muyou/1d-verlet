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
  const va = a.y - a.prevY;
  const nextY = a.y + va * elapsed + a.acc * elapsed * elapsed;
  a.prevY = a.y;
  a.y = nextY;
}

function draw() {
  background("#444");

  doDt(dt);

  renderBox(a.y, "green");
  text(`a=${a.y - a.prevY}`, 4, 30);
}

function renderBox(y, color = "red") {
  fill(color);
  rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2);
}
