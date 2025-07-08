export function getV(box) {
  return box.y - box.prevY;
}

export function yv(y, v, acc = 0) {
  return {
    y,
    prevY: y - v,
    acc,
  };
}
