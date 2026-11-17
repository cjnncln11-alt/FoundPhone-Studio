import { describe, it, expect } from "vitest";
import { clockText, seekTarget, seekZone, SEEK_STEP } from "./shared";

describe("视频双击快进/快退", () => {
  it("左右两侧判定热区，中间留给播放暂停", () => {
    expect(seekZone(0)).toBe("back");
    expect(seekZone(0.2)).toBe("back");
    expect(seekZone(0.35)).toBe("back");
    expect(seekZone(0.5)).toBeNull();
    expect(seekZone(0.64)).toBeNull();
    expect(seekZone(0.65)).toBe("forward");
    expect(seekZone(1)).toBe("forward");
  });

  it("步长为 10 秒", () => {
    expect(SEEK_STEP).toBe(10);
  });

  it("目标时间夹在 0 与总时长之间", () => {
    expect(seekTarget(5, 30, 10)).toBe(15);
    expect(seekTarget(5, 30, -10)).toBe(0);
    expect(seekTarget(28, 30, 10)).toBe(30);
    expect(seekTarget(1, Number.NaN, -10)).toBe(0);
    expect(seekTarget(1, Infinity, 10)).toBe(11);
  });

  it("提示时间戳格式为 m:ss", () => {
    expect(clockText(0)).toBe("0:00");
    expect(clockText(9.9)).toBe("0:09");
    expect(clockText(65)).toBe("1:05");
    expect(clockText(Number.NaN)).toBe("0:00");
    expect(clockText(-3)).toBe("0:00");
  });
});
