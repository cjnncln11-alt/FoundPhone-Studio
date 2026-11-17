import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// 生日动态（记录 02）的前排评论对齐真实原博 weibo.com/6408414755/RkRwhx5xw
const REAL_TOP = [
  "秋秋啊秋·",
  "和小农周六见",
  "浣熊眠眠",
  "小田想要天天天天天天天天天开心",
  "October-03",
  "超級農農的毛毛",
  "小椿漫语",
  "邬娜娜啊",
  "nn牌盐酥鸡",
  "每天都好想立农",
];

const story = JSON.parse(
  readFileSync(resolve(process.cwd(), "stories/template/story.json"), "utf8"),
);
const items = (story.content?.weibo ?? []) as {
  id: string;
  comments: string[];
  commentMeta?: ({ likes?: number; image?: string } | null)[];
}[];
const post = items.find((i) => i.id === "wb-owner-1003-0000")!;

describe("生日动态评论区对齐真实原博", () => {
  it("有这条博文且评论数量足够", () => {
    expect(post).toBeTruthy();
    expect(post.comments.length).toBeGreaterThanOrEqual(24);
  });

  it("前十条评论的昵称与真实热评一致", () => {
    expect(post.comments.slice(0, 10).map((c) => c.split("：")[0])).toEqual(
      REAL_TOP,
    );
  });

  it("commentMeta 与评论一一对应，且前排都有真实赞数与配图", () => {
    expect(post.commentMeta?.length).toBe(post.comments.length);
    for (let i = 0; i < 10; i++) {
      const m = post.commentMeta?.[i];
      expect(m?.likes).toBeGreaterThan(1000);
      expect(m?.image).toBeTruthy();
      expect(existsSync(resolve(process.cwd(), "public", m!.image!))).toBe(true);
    }
  });

  it("楼中楼的回复对象都能在顶层评论中找到", () => {
    const top = new Set(
      post.comments
        .filter((c) => !/：\s*回复\s*@/.test(c))
        .map((c) => c.split("：")[0]),
    );
    const nested = post.comments.filter((c) => /：\s*回复\s*@/.test(c));
    expect(nested.length).toBeGreaterThan(0);
    for (const n of nested) {
      const to = /回复\s*@(.+?)：/.exec(n)?.[1] ?? "";
      expect(top.has(to)).toBe(true);
    }
  });
});
