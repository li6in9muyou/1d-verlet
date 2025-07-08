let WORLD = {
  MIN_POS: 0,
  MAX_POS: 600,
  boxes: [
    {
      prevY: 300,
      y: 301,
      acc: 1,
    },
  ],
};

function afterStep(state) {
  const nextState = { ...state };

  nextState.boxes = afterMove(state);

  return nextState;
}

export function afterMove(state) {
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

export function draw() {
  background("#111");

  WORLD = afterStep(WORLD);
}

export function setup() {
  textSize(12);
  createCanvas(100, WORLD.MAX_POS + 300);
}
