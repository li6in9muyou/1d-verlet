import {
  CtrlEvents,
  Dynamics,
  Spring,
  Suitcase,
  SuitcaseWithoutCtrl,
} from "./types";
import { MAX_Y_ANCHOR, MIN_Y_ANCHOR } from "./springs";
import { cloneDeep } from "lodash";
import { namedCssColors } from "./named-css-colors";

interface DynamicItem {
  box: Dynamics;
  color?: string;
  mass?: number;
  name?: string;
  size?: number;
}

export class SuitcaseBuilder {
  private dynamicsData: DynamicItem[] = [];
  private scase = {
    springs: [],
    gravityAcc: 0,
    dragCoeff: 0,
    frameCnt: 0,
    MIN_X: 0,
    MAX_X: 0,
    MIN_Y: 0,
    MAX_Y: 0,
    SPRING_X: 0,
    SPRING_TENSION_OFFSET: 3,
    SPRING_MARGIN_X: -7,
    dt: 1 / 3000,
    sizes: [] as number[],
    statNextLineY: 0,
    ctrl: {
      history: {
        MAX_STATES: 50,
        cursor: 0,
        states: [] as SuitcaseWithoutCtrl[],
      },
      events: [] as CtrlEvents[],
      playing: true,
      stopAfterFrames: Number.MAX_SAFE_INTEGER,
    },
    boxes: [],
    colors: [],
    names: [],
    masses: [],
  } as Suitcase;

  public pos(_: number, __: number, w: number, h: number): SuitcaseBuilder {
    this.scase.MAX_X = 0 + w;
    this.scase.MIN_X = 0;
    this.scase.MIN_Y = 0;
    this.scase.MAX_Y = 0 + h;
    this.scase.SPRING_X = (this.scase.MIN_X + this.scase.MAX_X) / 2 - 6 - 1;
    return this;
  }

  public dynamics(dynamicsArray: DynamicItem[]): SuitcaseBuilder {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    const generateName = (index: number): string => {
      let result = "";
      let n = index + 1;
      while (n > 0) {
        const remainder = (n - 1) % 26;
        result = alphabet[remainder] + result;
        n = Math.floor((n - 1) / 26);
      }
      return result;
    };

    this.dynamicsData = dynamicsArray.map((item, index) => ({
      box: item.box,
      color: item.color ?? namedCssColors[index % namedCssColors.length],
      mass: item.mass ?? 100,
      name: item.name ?? generateName(index),
      size: item.size ?? 12,
    }));
    return this;
  }

  public springs(springsArray: Spring[]): SuitcaseBuilder {
    this.scase.springs = springsArray;
    return this;
  }

  public description(description: string): SuitcaseBuilder {
    this.scase.description = description;
    return this;
  }

  public build(): typeof this.scase {
    this.scase.springs.forEach((spring) => {
      const { one, two } = spring;
      const okOne =
        one === MAX_Y_ANCHOR ||
        one === MIN_Y_ANCHOR ||
        (one >= 0 && one < this.dynamicsData.length);
      const okTwo =
        two === MAX_Y_ANCHOR ||
        two === MIN_Y_ANCHOR ||
        (two >= 0 && two < this.dynamicsData.length);

      if (!okOne || !okTwo) {
        throw new Error(
          `Invalid spring index. Indices must be a valid box index or a known anchor.`,
        );
      }
    });

    this.dynamicsData.forEach((item) => {
      this.scase.boxes.push(getPosAdjustedBox(item.box, this.scase.MIN_Y));
      this.scase.colors.push(item.color);
      this.scase.names.push(item.name);
      this.scase.masses.push(item.mass);
      this.scase.sizes.push(item.size);
    });

    return cloneDeep(this.scase);
  }
}

function getPosAdjustedBox(box: Dynamics, minY: number): Dynamics {
  return { ...box, y: box.y + minY, prevY: box.prevY + minY };
}
