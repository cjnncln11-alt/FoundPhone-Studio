import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** 信息流顶部的「全部微博(N) · 筛选」板块：年份筛选与正/倒序切换依赖 time 字段的年份 */
const story = JSON.parse(
  readFileSync(resolve(process.cwd(), "stories/template/story.json"), "utf8"),
);
const posts = (story.content?.weibo ?? []) as { time: string }[];

describe("微博年份筛选数据", () => {
  it("每条微博的 time 都带年份，可供筛选", () => {
    expect(posts.length).toBeGreaterThan(100);
    for (const p of posts) expect(p.time).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it("默认时间倒序（年份从新到旧），正序即整体反转", () => {
    const years = [...new Set(posts.map((p) => p.time.slice(0, 4)))];
    expect(years.length).toBeGreaterThanOrEqual(5);
    const desc = [...years].sort().reverse();
    expect(years).toEqual(desc);
  });
});
