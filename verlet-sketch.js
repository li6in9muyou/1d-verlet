function setup() {
  createCanvas(100, MAX_Y);
}

const MIN_Y = 0;
const MAX_Y = 600;
const HALF_SIZE = 6;

const a = {
  v: -4,
  y: 500,
  m: 10,
};

function draw() {
  background("#444");

  renderBox(a.y, "green");
  text(`a=${a.v}`, 4, 30);
}

function renderBox(y, color = "red") {
  fill(color);
  rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2);
}
