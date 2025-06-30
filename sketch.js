function setup() {
  createCanvas(100, MAX_Y);
}

const MIN_Y = 0;
const MAX_Y = 600;
const HALF_SIZE = 6;

const b = {
  v: 10,
  y: 26,
  m: 10,
};

const a = {
  v: -4,
  y: 500,
  m: 10,
};

let t = 0;
const dt = 1;
const SUBSTEPS = 4;

function addVelocityToPosition(velocity, position, dt) {
  return position + dt * velocity;
}

function getVelocityAfterBounce(velocity, normalOfBounceSurface) {
  return velocity * -1;
}

const DOWN = 1;
const UP = -1;

function timeToNextCollide(i, you) {
  const relativeVelocity = i.v - you.v;
  const sign = (i.y - you.y) / Math.abs(i.y - you.y);
  const distance = sign * (Math.abs(i.y - you.y) - 2 * HALF_SIZE);
  const ti = distance / relativeVelocity;
  const willCollide = (0 < ti && ti < 1) || Math.abs(ti) - 1 < 1e-4;
  return [willCollide, ti];
}

function velocityAfterElasticCollision(i, you) {
  const ma = i.m;
  const mb = you.m;
  const va1 = i.v;
  const vb1 = you.v;
  return [
    ((ma - mb) * va1) / (ma + mb) + (2 * mb * vb1) / (ma + mb),
    (2 * ma * va1) / (ma + mb) + ((mb - ma) * vb1) / (ma + mb),
  ];
}

function doDt(elapsed) {
  b.y = addVelocityToPosition(b.v, b.y, elapsed);

  if (b.y - HALF_SIZE < MIN_Y) {
    b.y = 0 + HALF_SIZE;
    b.v = getVelocityAfterBounce(b.v, DOWN);
  }
  if (b.y + HALF_SIZE > MAX_Y) {
    b.y = MAX_Y - HALF_SIZE;
    b.v = getVelocityAfterBounce(b.v, UP);
  }

  a.y = addVelocityToPosition(a.v, a.y, elapsed);
  if (a.y - HALF_SIZE < MIN_Y) {
    a.y = 0 + HALF_SIZE;
    a.v = getVelocityAfterBounce(a.v, DOWN);
  }
  if (a.y + HALF_SIZE > MAX_Y) {
    a.y = MAX_Y - HALF_SIZE;
    a.v = getVelocityAfterBounce(a.v, UP);
  }
}

function draw() {
  background("#444");

  const [willCollide, ti] = timeToNextCollide(a, b);
  let thisRenderDt = 1;
  const collideImminent = willCollide;
  if (collideImminent) {
    thisRenderDt = ti;
  }
  doDt(thisRenderDt);
  if (collideImminent) {
    const [va, vb] = velocityAfterElasticCollision(a, b);
    a.v = va;
    b.v = vb;
  }

  renderBox(a.y, "green");
  text(`a=${a.v}`, 4, 30);

  renderBox(b.y);
  text(`vel=${b.v}`, 0, 15);
}

function renderBox(y, color = "red") {
  fill(color);
  rect(100 / 2 - HALF_SIZE, y - HALF_SIZE, HALF_SIZE * 2);
}
