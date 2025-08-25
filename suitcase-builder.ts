import {
  CtrlEvents,
  DynamicItem,
  Spring,
  Suitcase,
  SuitcaseWithoutCtrl,
} from "./types";
import { MAX_Y_ANCHOR, MIN_Y_ANCHOR } from "./springs";
import { getV, yv } from "./ii-utils";
import { Graph } from "./plotter";
import { cloneDeep } from "lodash";
import { namedCssColors } from "./named-css-colors";

export class SuitcaseBuilder {
  private dynamicsData: DynamicItem[] = [];
  private scase = {
    springs: [],
    gravityAcc: 0,
    dragCoeff: 0,
    frameCnt: 0,
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
    frameTimeGraph: null,
  } as Suitcase;

  public size(w: number, h: number): SuitcaseBuilder {
    this.scase.WIDTH = w;
    this.scase.HEIGHT = h;
    this.scase.SPRING_X = w / 2 - 6 - 1;
    return this;
  }

  public dynamics(dynamicsArray: DynamicItem[]): SuitcaseBuilder {
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

  public description(short: string, long?: string): SuitcaseBuilder {
    this.scase.name = short;
    this.scase.description = long ?? short;
    return this;
  }

  public gravityAcc(gravityAcc: number): SuitcaseBuilder {
    this.scase.gravityAcc = gravityAcc;
    return this;
  }

  public dragCoeff(dragCoeff: number): SuitcaseBuilder {
    this.scase.dragCoeff = dragCoeff;
    return this;
  }

  public dt(dt: number): SuitcaseBuilder {
    this.scase.dt = dt;
    return this;
  }

  public build(): typeof this.scase {
    if (!this.scase.name) {
      this.scase.name = `suitcase-${generateName(Math.random() * Math.pow(26, 4))}`;
    }

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
      const v = getV(item.box);
      const vSub = v * this.scase.dt;
      item.box = yv(item.box.y, vSub, item.box.acc);

      this.scase.boxes.push(item.box);
      this.scase.colors.push(item.color);
      this.scase.names.push(item.name);
      this.scase.masses.push(item.mass);
      this.scase.sizes.push(item.size);
    });

    this.scase.frameTimeGraph = new Graph("frame time", ["ft"], {
      colors: { ft: "#aa7" },
    });

    return cloneDeep(this.scase);
  }
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
function generateName(_index: number): string {
  const index = Math.round(_index);
  let result = "";
  let n = index + 1;
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = ALPHABET[remainder] + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}
