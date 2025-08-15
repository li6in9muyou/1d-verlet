export type Dynamics = {
  y: number;
  prevY: number;
  acc: number;
};

export type Suitcase = DynamicsStuff & RenderStuff & SimStuff & ControlState;

export type SuitcaseWithoutCtrl = DynamicsStuff & RenderStuff & SimStuff;

export type RenderStuff = {
  description?: string;
  frameCnt: number;
  colors: string[];
  names: string[];
  statNextLineY: number;
  SPRING_X: number;
  SPRING_TENSION_OFFSET: number;
  SPRING_MARGIN_X: number;
};

export type DynamicsStuff = {
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

export type SimStuff = {
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
      states: (DynamicsStuff & RenderStuff & SimStuff)[];
    };
  };
};
