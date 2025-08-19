const DEFAULT_STYLE = {
  paddingLeft: 10,
  paddingTop: 20,
  colGap: 10,
};

export function leftToRight(
  rectangles: { w: number; h: number }[],
  style?: Partial<typeof DEFAULT_STYLE>,
): [
  ((x: number, y: number) => [number, number])[],
  ((x: number, y: number) => [number, number])[],
] {
  const sy = { ...DEFAULT_STYLE, ...style };

  const offsets: number[] = [];
  let currentX = sy.paddingLeft;
  for (const rect of rectangles) {
    offsets.push(currentX);
    currentX += rect.w + sy.colGap;
  }

  return [
    offsets.map((xOffset) => (x: number, y: number) => [
      xOffset + x,
      y + sy.paddingTop,
    ]),
    offsets.map((xOffset) => (x: number, y: number) => [
      x - xOffset,
      y - sy.paddingTop,
    ]),
  ];
}
