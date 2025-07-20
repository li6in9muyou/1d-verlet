export type Dynamics = {
  y: number;
  prevY: number;
  acc: number;
};

export type World = DynamicsWorld & RenderWorld & SimWorld;

export type RenderWorld = {
  frameCnt: number;
  colors: string[];
  names: string[];
  statNextLineY: number;
};

export type DynamicsWorld = {
  MAX_X: number;
  MIN_Y: number;
  MAX_Y: number;
  boxes: Dynamics[];
  sizes: number[];
  masses: number[];
};

export type SimWorld = {
  dt: number;
};
