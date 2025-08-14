export type Dynamics = {
  y: number;
  prevY: number;
  acc: number;
};

export type World = DynamicsWorld & RenderWorld & SimWorld & ControlState;

export type WorldWithoutCtrl = DynamicsWorld & RenderWorld & SimWorld;

export type RenderWorld = {
  frameCnt: number;
  colors: string[];
  names: string[];
  statNextLineY: number;
  SPRING_X: number;
  SPRING_TENSION_OFFSET: number;
  SPRING_MARGIN_X: number;
};

export type DynamicsWorld = {
  dragCoeff: number;
  gravityAcc: number;
  MIN_X: number;
  MAX_X: number;
  MIN_Y: number;
  MAX_Y: number;
  boxes: Dynamics[];
  sizes: number[];
  masses: number[];
  springs: Spring[];
};

export type Spring = {
  one: number;
  two: number;
  k: number;
  restingLen: number;
};

export type SimWorld = {
  dt: number;
};

export type CtrlEvents =
  | { name: "toggle" }
  | { name: "next-frame" }
  | { name: "prev-frame" };

export type ControlState = {
  ctrl: {
    events: CtrlEvents[];
    playing: boolean;
    stopAfterFrames: number;
    history: {
      get MAX_STATES(): number;
      cursor: number;
      states: (DynamicsWorld & RenderWorld & SimWorld)[];
    };
  };
};
