import { World } from "./types";

export function afterApplyingForce(w: World): World {
  const ww = { ...w };
  const springs = ww.springs;
  const boxes = ww.boxes;
  const masses = ww.masses;

  springs.forEach((spring) => {
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
