import { World } from "./types";

export function afterApplyingForce(w: World): World {
  const ww = { ...w };
  const springs = ww.springs;
  const boxes = ww.boxes;
  const masses = ww.masses;

  boxes.forEach((box) => (box.acc = 0));

  springs.forEach((spring) => {
    if (spring.two === -1) {
      const i = boxes[spring.one];

      const ji = i.y - w.MIN_Y;
      const actualLen = Math.abs(ji);
      const displacement = actualLen - spring.restingLen;

      const force = spring.k * displacement;
      const iForce = -force * Math.sign(ji);

      i.acc += iForce / masses[spring.one];
      return;
    }

    const i = boxes[spring.one];
    const j = boxes[spring.two];

    const ji = i.y - j.y;
    const actualLen = Math.abs(ji);
    const displacement = actualLen - spring.restingLen;

    const force = spring.k * displacement;
    const iForce = -force * Math.sign(ji);
    const jForce = -iForce;

    i.acc += iForce / masses[spring.one];
    j.acc += jForce / masses[spring.two];
  });

  return ww;
}
