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

export function getSpringEndpointY<
  C extends { boxes: Suitcase["boxes"]; HEIGHT: number },
>(w: C, spring: Spring): [number, number] {
  if (!isSpringNotMoving(spring)) {
    return [w.boxes[spring.one].y, w.boxes[spring.two].y];
  }

  const whichIsAnchor = spring.one < 0 ? spring.one : spring.two;
  const anchorY = whichIsAnchor === MIN_Y_ANCHOR ? 0 : w.HEIGHT;
  const boxIdx = spring.one < 0 ? spring.two : spring.one;
  const i = w.boxes[boxIdx];
  return [i.y, anchorY];
}

export function afterSpringForces<
  C extends {
    boxes: Suitcase["boxes"];
    masses?: number[];
    springs?: Spring[];
    HEIGHT: number;
  },
>(_w: C): C {
  const w = { ..._w };
  const springs = w.springs;

  if (!springs || springs.length === 0) {
    return w;
  }

  const boxes = w.boxes;
  const masses = w.masses;

  springs.forEach((spring) => {
    const [boxY, anchorY] = getSpringEndpointY(w, spring);
    const ji = boxY - anchorY;
    const actualLen = Math.abs(ji);

    const displacement = actualLen - spring.restingLen;
    const force = spring.k * displacement;
    const iForce = -force * Math.sign(ji);

    if (masses) {
      if (spring.one >= 0) {
        boxes[spring.one].acc += iForce / masses[spring.one];
      }
      if (spring.two >= 0) {
        boxes[spring.two].acc += -iForce / masses[spring.two];
      }
    }
  });

  return w;
}

export function afterGravity<
  C extends { boxes: Suitcase["boxes"]; gravityAcc?: number },
>(_w: C): C {
  const w = { ..._w };
  if (w.gravityAcc !== undefined && w.gravityAcc > 0) {
    w.boxes.forEach((box) => (box.acc += w.gravityAcc));
  }
  return w;
}

export function afterAirDrag<
  C extends {
    boxes: Suitcase["boxes"];
    dragCoeff?: number;
    dt?: number;
    masses?: number[];
  },
>(_w: C): C {
  const w = { ..._w };
  if (
    w.dragCoeff !== undefined &&
    w.dragCoeff > 0 &&
    w.dt !== undefined &&
    w.masses
  ) {
    const masses = w.masses;
    w.boxes.forEach((box, idx) => {
      const v = getV(box) / w.dt!;
      const d = -Math.sign(v);
      const drag = w.dragCoeff! * v * v;
      box.acc += (d * drag) / masses[idx];
    });
  }
  return w;
}

export function afterResettingAcc<C extends { boxes: Suitcase["boxes"] }>(
  _w: C,
): C {
  const w = { ..._w };
  w.boxes.forEach((box) => (box.acc = 0));
  return w;
}
