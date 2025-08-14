import { CtrlEvents, Dynamics, Spring, World, WorldWithoutCtrl } from "./types";
import { MAX_Y_ANCHOR, MIN_Y_ANCHOR } from "./springs";
import { cloneDeep } from "lodash";

interface DynamicItem {
  box: Dynamics;
  color?: string;
  mass?: number;
  name?: string;
  size?: number;
}

export class WorldBuilder {
  private dynamicsData: DynamicItem[] = [];
  private world = {
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
      history: { MAX_STATES: 50, cursor: 0, states: [] as WorldWithoutCtrl[] },
      events: [] as CtrlEvents[],
      playing: true,
      stopAfterFrames: Number.MAX_SAFE_INTEGER,
    },
    boxes: [],
    colors: [],
    names: [],
    masses: [],
  } as World;

  public pos(top: number, left: number, w: number, h: number): WorldBuilder {
    this.world.MAX_X = left + w;
    this.world.MIN_X = left;
    this.world.MIN_Y = top;
    this.world.MAX_Y = top + h;
    this.world.SPRING_X = (this.world.MIN_X + this.world.MAX_X) / 2 - 6 - 1;
    return this;
  }

  public dynamics(dynamicsArray: DynamicItem[]): WorldBuilder {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const getRandomColor = () =>
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");

    this.dynamicsData = dynamicsArray.map((item, index) => ({
      box: item.box,
      color: item.color ?? getRandomColor(),
      mass: item.mass ?? 100,
      name: item.name ?? alphabet[index % alphabet.length],
      size: item.size ?? 12,
    }));
    return this;
  }

  public springs(springsArray: Spring[]): WorldBuilder {
    this.world.springs = springsArray;
    return this;
  }

  public description(description: string): WorldBuilder {
    this.world.description = description;
    return this;
  }

  public build(): typeof this.world {
    this.world.springs.forEach((spring) => {
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
      this.world.boxes.push(getPosAdjustedBox(item.box, this.world.MIN_Y));
      this.world.colors.push(item.color);
      this.world.names.push(item.name);
      this.world.masses.push(item.mass);
      this.world.sizes.push(item.size);
    });

    return cloneDeep(this.world);
  }
}

function getPosAdjustedBox(box: Dynamics, minY: number): Dynamics {
  return { ...box, y: box.y + minY, prevY: box.prevY + minY };
}
