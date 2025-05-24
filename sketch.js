function setup() {
  createCanvas(100, MAX_Y);
}

const MIN_Y = 0;
const MAX_Y = 600;
const HALF_SIZE = 6;

const b = {
  v: 10,
  y: 26,
};

let t = 0;
const dT = 1;
const SUBSTEPS = 4;

function draw() {
  background("#444");

  b.y = b.y + dT * b.v;

  if (b.y - HALF_SIZE < MIN_Y) {
    b.y = 0 + HALF_SIZE;
    b.v = -1 * b.v;
  }
  if (b.y + HALF_SIZE > MAX_Y) {
    b.y = MAX_Y - HALF_SIZE;
    b.v = -1 * b.v;
  }

  renderBox(b.y);
  text(`vel=${b.v}`, 0, 15);
}

function renderBox(y, color = "red") {
  fill(color);
  rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2);
}
