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

  // 数据历史记录，现在是类的私有成员
  private dataHistory: Map<T, number[]>;
  // 系列颜色，结合了默认值和用户自定义值
  private seriesColors: Map<T, string>;

  // 用于追踪Y轴的全局历史范围
  private historicalMin: number = Infinity;
  private historicalMax: number = -Infinity;
  private MIN_MAX_RESET_TIME: number;
  private minMaxResetCounter: number;

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
    this.minMaxResetCounter = this.MIN_MAX_RESET_TIME;

    this.dataHistory = new Map<T, number[]>();
    this.seriesColors = new Map<T, string>();

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
      // 初始化滑动窗口数据
      this.dataHistory.set(name, new Array(this.maxDataPoints).fill(NaN));

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
      const history = this.dataHistory.get(name)!;

      // 1. 更新滑动窗口数据
      history.push(value);
      if (history.length > this.maxDataPoints) {
        history.shift();
      }

      this.minMaxResetCounter--;
      if (this.minMaxResetCounter < 0) {
        this.historicalMax = Math.max(...history);
        this.historicalMin = Math.min(...history);
        this.minMaxResetCounter = this.MIN_MAX_RESET_TIME;
      }

      // 2. 更新历史极值
      if (value < this.historicalMin) {
        this.historicalMin = value;
      }
      if (value > this.historicalMax) {
        this.historicalMax = value;
      }
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
    api.text(this.historicalMax.toFixed(2), x, y + 5 + 2);
    api.text(`${this.historicalMin.toFixed(2)} ${this.title}`, x, y + height);

    // 根据历史极值计算Y轴的范围和缩放比例
    // 添加一个小的 "epsilon" 来避免当所有值都相同时除以零
    const dataRange = this.historicalMax - this.historicalMin || 1;

    // 绘制每个数据系列的曲线
    this.seriesNames.forEach((name) => {
      const history = this.dataHistory.get(name)!;
      const color = this.seriesColors.get(name)!;
      this._drawSmoothLine(api, history, x, y, width, height, color, dataRange);
    });
  }

  /**
   * 绘制单条曲线的私有辅助方法。
   */
  private _drawSmoothLine(
    api: Painter,
    points: number[],
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    dataRange: number,
  ) {
    if (points.length < 2) return;

    api.stroke(color);
    api.strokeWeight(1);
    api.noFill();

    const step = width / (points.length - 1);

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];

      if (Number.isNaN(p1) || Number.isNaN(p2)) {
        continue;
      }

      const x1 = x + (i - 1) * step;
      // 根据全局历史范围来计算y坐标
      const y1 = y + height - ((p1 - this.historicalMin) / dataRange) * height;

      const x2 = x + i * step;
      const y2 = y + height - ((p2 - this.historicalMin) / dataRange) * height;

      api.line(x1, y1, x2, y2);
    }
  }
}
