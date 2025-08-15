import { Spring, Suitcase } from "./types";
import { getV } from "./ii-utils";

export const MIN_Y_ANCHOR = -2;
export const MAX_Y_ANCHOR = -1;

export function isSpringNotMoving(spring: Spring) {
  return spring.one < 0 !== spring.two < 0;
}

export function getAnchorName(anchor: number) {
  if (anchor === MIN_Y_ANCHOR) {
    return "ceil";
  }
  if (anchor === MAX_Y_ANCHOR) {
    return "floor";
  }
}

export function getSpringEndpointY(
  w: { boxes: Suitcase["boxes"]; MIN_Y: number; MAX_Y: number },
  spring: Spring,
): [number, number] {
  if (!isSpringNotMoving(spring)) {
    return [w.boxes[spring.one].y, w.boxes[spring.two].y];
  }

  const whichIsAnchor = spring.one < 0 ? spring.one : spring.two;
  const anchorY = whichIsAnchor === MIN_Y_ANCHOR ? w.MIN_Y : w.MAX_Y;
  const boxIdx = spring.one < 0 ? spring.two : spring.one;
  const i = w.boxes[boxIdx];
  return [i.y, anchorY];
}

export function afterApplyingForce(w: Suitcase): Suitcase {
  const ww = { ...w };
  const springs = ww.springs;
  const boxes = ww.boxes;
  const masses = ww.masses;

  boxes.forEach((box) => (box.acc = 0));

  springs.forEach((spring) => {
    const [boxY, anchorY] = getSpringEndpointY(w, spring);
    const ji = boxY - anchorY;
    const actualLen = Math.abs(ji);

    const displacement = actualLen - spring.restingLen;

    const force = spring.k * displacement;
    const iForce = -force * Math.sign(ji);

    if (spring.one >= 0) {
      boxes[spring.one].acc += iForce / masses[spring.one];
    }
    if (spring.two >= 0) {
      boxes[spring.two].acc += -iForce / masses[spring.two];
    }
    return;
  });

  if (w.gravityAcc > 0) {
    boxes.forEach((box) => (box.acc += w.gravityAcc));
  }

  if (w.dragCoeff > 0) {
    boxes.forEach((box, idx) => {
      const v = getV(box) / w.dt;
      const d = -Math.sign(v);
      const drag = w.dragCoeff * v * v;
      box.acc += (d * drag) / masses[idx];
    });
  }

  return ww;
}
