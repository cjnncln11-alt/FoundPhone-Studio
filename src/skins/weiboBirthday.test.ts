import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// 生日动态的前排评论对齐真实原博（2026：RkRwhx5xw；2025：5217451371398002；2024：5085179799933308；2023：4952907827121407）
// 2023 年真实热评流中第 9 条是 4 赞的图片评论（Today455，微博热搜流原样呈现），故用 loose 模式：赞数与配图不做硬性校验
const BIRTHDAY_POSTS = [
  {
    id: "wb-owner-1003-0000",
    loose: false,
    chars: "立农二十六岁生日快乐",
    top: [
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
    ],
  },
  {
    id: "wb-owner-1003-2025",
    loose: false,
    chars: "立农二十五岁生日快乐",
    top: [
      "忘记流逝时间里的眼泪",
      "邬娜娜啊",
      "巧克立农糖呀",
      "浣熊眠眠",
      "农味收藏家-best",
      "超級農農的毛毛",
      "秋秋啊秋·",
      "桔梗盛开在仲夏夜的尽头",
      "别嫌我臭呀",
      "和小农周六见",
    ],
  },
  {
    id: "wb-owner-1003-2024",
    loose: false,
    chars: "立农二十四岁生日快乐",
    top: [
      "巧克立农糖呀",
      "超級農農的毛毛",
      "浣熊眠眠",
      "ZIWEN__",
      "吃飽飽準備上課",
      "小田想要天天天天天天天天天开心",
      "胖三斤_1003",
      "朱迪丝不吃饭宁宁就晕倒",
      "小椿漫语",
      "我要改个什么很长的名字",
    ],
  },
  {
    id: "wb-owner-1003-2023",
    chars: "立农二十三岁生日快乐",
    loose: true,
    top: [
      "扁桃体发炎不发言-",
      "巧克立农糖呀",
      "巧克立农糖呀",
      "吃了你的小蛮腰-N",
      "立農記得按時吃飯",
      "扁桃体发炎不发言-",
      "只为農農_zx",
      "小田想要天天天天天天天天天开心",
      "Today455",
      "朱迪丝不吃饭宁宁就晕倒",
    ],
  },
];

const story = JSON.parse(
  readFileSync(resolve(process.cwd(), "stories/template/story.json"), "utf8"),
);
const items = (story.content?.weibo ?? []) as {
  id: string;
  comments: string[];
  commentMeta?: ({
    likes?: number;
    image?: string;
    avatar?: string;
  } | null)[];
}[];

describe.each(BIRTHDAY_POSTS.map((p) => [p.id, p] as const))(
  "生日动态评论区对齐真实原博（%s）",
  (_id, spec) => {
    const post = items.find((i) => i.id === spec.id)!;

    it("有这条博文且评论数量足够", () => {
      expect(post).toBeTruthy();
      expect(post.comments.length).toBeGreaterThanOrEqual(24);
    });

    it("前十条评论的昵称与真实热评一致", () => {
      expect(post.comments.slice(0, 10).map((c) => c.split("：")[0])).toEqual(
        spec.top,
      );
    });

    it("commentMeta 与评论一一对应，前排有真实赞数、配图与应援头像", () => {
      expect(post.commentMeta?.length).toBe(post.comments.length);
      for (let i = 0; i < 10; i++) {
        const m = post.commentMeta?.[i];
        if (!spec.loose) {
          expect(m?.likes).toBeGreaterThan(1000);
          expect(m?.image).toBeTruthy();
        }
        expect(m?.avatar).toBeTruthy();
        if (m?.image) {
          expect(existsSync(resolve(process.cwd(), "public", m.image))).toBe(
            true,
          );
        }
        expect(existsSync(resolve(process.cwd(), "public", m!.avatar!))).toBe(
          true,
        );
        const svg = readFileSync(
          resolve(process.cwd(), "public", m!.avatar!),
          "utf8",
        );
        expect(svg).toContain(`>${spec.chars[i]}<`);
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
  },
);
