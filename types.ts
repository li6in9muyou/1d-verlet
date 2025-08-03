export type Dynamics = {
  y: number;
  prevY: number;
  acc: number;
};

export type World = DynamicsWorld & RenderWorld & SimWorld & ControlState;

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
  springs: Spring[];
};

export type Spring = {
  one: string;
  two: string;
  k: number;
  restingLen: number;
};

export type SimWorld = {
  dt: number;
};

export type ControlState = {
  ctrl: {
    events: { name: string }[];
    playing: boolean;
  };
};
