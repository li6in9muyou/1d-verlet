function setup() {
  createCanvas(100, MAX_Y);
}

const MIN_Y = 0;
const MAX_Y = 600;
const HALF_SIZE = 6;

const v = {
  prev: 16,
  curr: 26,
  acc: 0,
};

let t = 0;
const dT = 1;
const SUBSTEPS = 4;

function draw() {
  background("#444");

  t += dT;
  const subT = dT / SUBSTEPS;
  let nextCurr = v.curr;
  let nextPrev = v.prev;
  for (let i = 0; i < SUBSTEPS; i++) {
    const vel = nextCurr - nextPrev;

    // bounce back
    if (nextCurr - HALF_SIZE < MIN_Y) {
      nextCurr = 0 + HALF_SIZE;
    }
    if (v.curr + HALF_SIZE > MAX_Y) {
      nextCurr = MAX_Y - HALF_SIZE;
    }

    // move it
    nextCurr = nextCurr + vel * subT + v.acc * subT * subT;
  }

  v.prev = v.curr;
  v.curr = nextCurr;

  renderBox(v.curr);
  text(`vel=${(v.curr - v.prev).toFixed(2)}`, 0, 15);
}

function renderBox(y, color = "red") {
  fill("red");
  rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2);
}
