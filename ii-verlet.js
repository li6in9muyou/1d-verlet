export class Box {
  constructor(y, v, acc = 0, size = 12) {
    this.y = y;
    this.prevY = this.y - v;
    this.acc = acc;
    this.size = size;
  }
  get v() {
    return this.y - this.prevY;
  }
}

let WORLD = {
  MIN_POS: 0,
  MAX_Y: 600,
  boxes: [new Box(301, 1, 1, 12)],
};

function afterStep(state) {
  const nextState = { ...state };

  nextState.boxes = afterMoving(state);

  return nextState;
}

export function afterMoving(state) {
  const dt = state.dt;
  const nextBoxes = state.boxes.map((box) => {
    return {
      ...box,
      prevY: box.y,
      y: 2 * box.y - box.prevY + box.acc * dt * dt,
    };
  });

  return { ...state, boxes: nextBoxes };
}

export function afterHittingWall(state) {
  const nextBoxes = state.boxes.map((box) => {
    const halfSize = box.size / 2;
    if (box.y > state.MAX_Y - halfSize) {
      const yOverBound = box.y - (state.MAX_Y - halfSize);
      const nextY = state.MAX_Y - halfSize - yOverBound;
      const nextV = -Math.abs(box.y - box.prevY);
      return new Box(nextY, nextV);
    }
    if (box.y < state.MIN_Y + halfSize) {
      const yOverBound = state.MIN_Y + halfSize - box.y;
      const nextY = state.MIN_Y + halfSize + yOverBound;
      const nextV = Math.abs(box.y - box.prevY);
      return new Box(nextY, nextV);
    }
    return box;
  });

  return { ...state, boxes: nextBoxes };
}

export function draw() {
  background("#111");

  WORLD = afterStep(WORLD);
}

export function setup() {
  textSize(12);
  createCanvas(100, WORLD.MAX_Y + 300);
}
