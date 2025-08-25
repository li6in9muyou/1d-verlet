// 为构造函数的 options 参数定义类型
// 使用泛型 T 使得 colors 的键必须是传入的系列名称之一

import { Painter } from "./types";

// Partial<> 表示 colors 对象以及其内部的属性都是可选的
interface GraphOptions<T extends string> {
  colors?: Partial<Record<T, string>>;
  maxDataPoints?: number;
}

// --- Graph 类的实现 ---

export class Graph<T extends string = string> {
  // --- 私有属性，用于封装内部状态 ---
  private readonly title: string;
  private readonly seriesNames: readonly T[];
  private readonly maxDataPoints: number;

  // 固定容量环形缓冲区：每个系列一个缓冲区、写入指针与有效长度
  private dataHistory: Map<T, number[]>;
  private seriesHead: Map<T, number>;
  private seriesCount: Map<T, number>;
  // 系列颜色，结合了默认值和用户自定义值
  private seriesColors: Map<T, string>;

  // 用于追踪每条曲线的历史范围（独立 Y 轴域）
  private seriesMin: Map<T, number>;
  private seriesMax: Map<T, number>;
  private MIN_MAX_RESET_TIME: number;
  private seriesResetCounter: Map<T, number>;

  /**
   * 构造一个新的图表实例。
   * @param title 图表标题。
   * @param seriesNames 一个包含系列名称的数组。
   * @param options 可选的配置对象，目前支持自定义颜色。
   */
  constructor(
    title: string,
    seriesNames: readonly T[],
    options: GraphOptions<T> = {},
  ) {
    this.title = title;
    this.seriesNames = seriesNames;
    this.maxDataPoints = options.maxDataPoints ?? 100;
    this.MIN_MAX_RESET_TIME = 3 * this.maxDataPoints;

    this.dataHistory = new Map<T, number[]>();
    this.seriesHead = new Map<T, number>();
    this.seriesCount = new Map<T, number>();
    this.seriesColors = new Map<T, string>();
    this.seriesMin = new Map<T, number>();
    this.seriesMax = new Map<T, number>();
    this.seriesResetCounter = new Map<T, number>();

    const defaultColors = [
      "#00ffff",
      "#ff00ff",
      "#ffff00",
      "#00ff00",
      "#ff0000",
      "#66ccff",
    ];

    // 初始化数据历史和颜色配置
    seriesNames.forEach((name, index) => {
      // 初始化环形缓冲区（固定容量）
      this.dataHistory.set(name, new Array(this.maxDataPoints).fill(NaN));
      this.seriesHead.set(name, 0);
      this.seriesCount.set(name, 0);
      this.seriesMin.set(name, Infinity);
      this.seriesMax.set(name, -Infinity);
      this.seriesResetCounter.set(name, this.MIN_MAX_RESET_TIME);

      // 结合用户提供的颜色和默认颜色
      const userColor = options.colors?.[name];
      const finalColor =
        userColor || defaultColors[index % defaultColors.length];
      this.seriesColors.set(name, finalColor);
    });
  }

  /**
   * 向图表添加一个新的数据点。
   * @param data 一个键值对对象，键是系列名称，值是对应的数值。
   */
  public addDataPoint(data: Record<T, number>): void {
    for (const name of this.seriesNames) {
      const value = data[name] ?? 0;
      const buffer = this.dataHistory.get(name)!;
      const head = this.seriesHead.get(name)!;
      const count = this.seriesCount.get(name)!;

      // 即将被覆盖的值（若缓冲区已满）
      const evicted = count >= this.maxDataPoints ? buffer[head] : NaN;

      // 写入并前移写指针
      buffer[head] = value;
      const nextHead = (head + 1) % this.maxDataPoints;
      this.seriesHead.set(name, nextHead);
      this.seriesCount.set(name, Math.min(count + 1, this.maxDataPoints));

      // 增量更新该系列极值
      let sMin = this.seriesMin.get(name)!;
      let sMax = this.seriesMax.get(name)!;
      if (value < sMin) sMin = value;
      if (value > sMax) sMax = value;
      this.seriesMin.set(name, sMin);
      this.seriesMax.set(name, sMax);

      // 需要重算的条件：周期性重置或极值被驱逐（针对该系列）
      const counter = this.seriesResetCounter.get(name)! - 1;
      this.seriesResetCounter.set(name, counter);
      const evictedHitsExtreme =
        !Number.isNaN(evicted) && (evicted === sMin || evicted === sMax);
      if (counter < 0 || evictedHitsExtreme) {
        this._recomputeSeriesMinMax(name);
        this.seriesResetCounter.set(name, this.MIN_MAX_RESET_TIME);
      }
    }
  }

  private _recomputeSeriesMinMax(name: T): void {
    const buffer = this.dataHistory.get(name)!;
    const head = this.seriesHead.get(name)!;
    const count = this.seriesCount.get(name)!;
    const start = (head - count + this.maxDataPoints) % this.maxDataPoints;
    let minV = Infinity;
    let maxV = -Infinity;
    for (let i = 0; i < count; i++) {
      const idx = (start + i) % this.maxDataPoints;
      const v = buffer[idx];
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }
    if (minV === Infinity) {
      this.seriesMin.set(name, 0);
      this.seriesMax.set(name, 1);
    } else {
      this.seriesMin.set(name, minV);
      this.seriesMax.set(name, maxV);
    }
  }

  /**
   * 在指定位置和尺寸绘制整个图表。
   * @param api Painter 绘图接口实例。
   * @param x 图表左上角的 x 坐标。
   * @param y 图表左上角的 y 坐标。
   * @param width 图表的宽度。
   * @param height 图表的高度。
   */
  public draw(
    api: Painter,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    // 绘制边框和标题 (与之前类似)
    api.stroke("#333");
    api.strokeWeight(1);
    api.line(x, y, x + width, y);
    api.line(x + width, y, x + width, y + height);
    api.line(x + width, y + height, x, y + height);
    api.line(x, y + height, x, y);

    api.fill("white");
    api.noStroke();
    api.textSize(10);
    if (this.seriesNames.length === 1) {
      const name = this.seriesNames[0];
      const sMin = this.seriesMin.get(name)!;
      const sMax = this.seriesMax.get(name)!;
      api.text(sMax.toFixed(2), x, y + 5 + 2);
      api.text(`${sMin.toFixed(2)} ${this.title}`, x, y + height);
    } else {
      // 多条曲线时仅显示标题
      api.text(this.title, x, y + height);
    }

    // 每条曲线使用自身的极值范围，故不再计算全局 dataRange

    // 绘制每个数据系列的曲线
    this.seriesNames.forEach((name) => {
      const history = this.dataHistory.get(name)!;
      const head = this.seriesHead.get(name)!;
      const count = this.seriesCount.get(name)!;
      const color = this.seriesColors.get(name)!;

      api.stroke(color);
      api.strokeWeight(1);
      api.noFill();
      const sMin = this.seriesMin.get(name)!;
      const sMax = this.seriesMax.get(name)!;
      this._drawSmoothLineFixedCapacity(
        api,
        history,
        head,
        count,
        sMin,
        sMax,
        x,
        y,
        width,
        height,
        sMax - sMin || 1,
      );
    });
  }

  /**
   * 绘制单条曲线的私有辅助方法。
   */
  private _drawSmoothLineFixedCapacity(
    api: Painter,
    buffer: number[],
    head: number,
    count: number,
    sMin: number,
    _sMax: number,
    x: number,
    y: number,
    width: number,
    height: number,
    dataRange: number,
  ) {
    if (this.maxDataPoints < 2) return;

    // 固定容量横轴：总是渲染 maxDataPoints 个逻辑位置，未满时右对齐，左侧为 NaN
    const step = width / (this.maxDataPoints - 1);
    const start = (head - count + this.maxDataPoints) % this.maxDataPoints;
    const leftPad = this.maxDataPoints - count;

    const getLogical = (pos: number): number => {
      if (pos < leftPad) return NaN;
      const k = pos - leftPad; // 0..count-1
      const idx = (start + k) % this.maxDataPoints;
      return buffer[idx];
    };

    for (let i = 1; i < this.maxDataPoints; i++) {
      const p1 = getLogical(i - 1);
      const p2 = getLogical(i);
      if (Number.isNaN(p1) || Number.isNaN(p2)) continue;

      const x1 = x + (i - 1) * step;
      const y1 = y + height - ((p1 - sMin) / dataRange) * height;
      const x2 = x + i * step;
      const y2 = y + height - ((p2 - sMin) / dataRange) * height;
      api.line(x1, y1, x2, y2);
    }
  }
}
