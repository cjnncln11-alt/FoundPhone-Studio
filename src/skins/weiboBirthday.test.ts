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
    time?: string;
    province?: string;
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

// 2022生日动态（495→4820274287222807）：全国省份明信片应援。
// 热一为王彦霖（真实id+头像完全保留），陈立农本人的楼中楼回复也保留，其余为真实的省份评论
describe("生日动态评论区对齐真实原博（wb-owner-1003-2022·全国明信片）", () => {
  const post = items.find((i) => i.id === "wb-owner-1003-2022")!;

  it("有这条博文且评论数量足够（三四十条省份评论）", () => {
    expect(post).toBeTruthy();
    expect(post.comments.length).toBeGreaterThanOrEqual(36);
  });

  it("热一为王彦霖且真实头像完全保留", () => {
    expect(post.comments[0]).toMatch(/^王彦霖：/);
    const m = post.commentMeta?.[0];
    expect(m?.avatar).toBe("weibo-hot/avatar-wyl.jpg");
    expect(
      existsSync(resolve(process.cwd(), "public", "weibo-hot/avatar-wyl.jpg")),
    ).toBe(true);
    expect(m?.likes).toBeGreaterThan(1000);
  });

  it("陈立农本人的回复保留且头像为本人真实头像", () => {
    const idx = post.comments.findIndex((c) =>
      c.startsWith("陈立农：回复 @王彦霖："),
    );
    expect(idx).toBeGreaterThan(0);
    const m = post.commentMeta?.[idx];
    expect(m?.avatar).toBe("weibo-hot/avatar-cln.jpg");
    expect(
      existsSync(resolve(process.cwd(), "public", "weibo-hot/avatar-cln.jpg")),
    ).toBe(true);
    expect(post.comments[idx]).toContain("谢谢王家大爷大娘大姑娘啊");
  });

  it("commentMeta 与评论一一对应且省份评论对齐真实", () => {
    expect(post.commentMeta?.length).toBe(post.comments.length);
    const provinces = (post.commentMeta ?? [])
      .map((m) => m?.province)
      .filter(Boolean) as string[];
    expect(new Set(provinces).size).toBeGreaterThanOrEqual(15);
  });
});

// 2021生日动态（70→4688002691369464）：20条真实热评全部保留，每条都带陈立农楼中楼回复；
// 前排十条热评头像拼「立农二十一岁生日快乐」（avatar-e01~e10），本人回复头像为真人（avatar-cln.jpg）
describe("生日动态评论区对齐真实原博（wb-owner-1003-2021·二十一岁翻牌）", () => {
  const post = items.find((i) => i.id === "wb-owner-1003-2021")!;

  it("有这条博文且20条热评+20条本人回复全部保留", () => {
    expect(post).toBeTruthy();
    expect(post.comments.length).toBe(40);
    expect(post.commentMeta?.length).toBe(40);
    const hotCount = post.comments.filter((c) => !c.startsWith("陈立农：回复 @")).length;
    const ownCount = post.comments.filter((c) => c.startsWith("陈立农：回复 @")).length;
    expect(hotCount).toBe(20);
    expect(ownCount).toBe(20);
  });

  it("热评与本人回复交替排列，本人回复头像为真实头像", () => {
    for (let i = 0; i < 40; i += 2) {
      expect(post.comments[i]).not.toMatch(/^陈立农：回复 @/);
      expect(post.comments[i + 1]).toMatch(/^陈立农：回复 @/);
      expect(post.commentMeta?.[i + 1]?.avatar).toBe("weibo-hot/avatar-cln.jpg");
    }
    expect(
      existsSync(resolve(process.cwd(), "public", "weibo-hot/avatar-cln.jpg")),
    ).toBe(true);
  });

  it("前排十条热评头像逐字拼出应援语，全部配图文件存在", () => {
    const chars = "立农二十一岁生日快乐";
    for (let k = 0; k < 10; k++) {
      const m = post.commentMeta?.[k * 2];
      expect(m?.avatar).toBe(`weibo-hot/avatar-e${k + 1 < 10 ? "0" + (k + 1) : k + 1}.svg`);
      const svg = readFileSync(resolve(process.cwd(), "public", m!.avatar!), "utf8");
      expect(svg).toContain(`>${chars[k]}<`);
      expect(m?.likes).toBeGreaterThan(5000);
    }
    for (const m of post.commentMeta ?? []) {
      if (m?.image) {
        expect(existsSync(resolve(process.cwd(), "public", m.image))).toBe(true);
      }
    }
  });
});

// 记录71：有陈立农本人回复的评论全部保留（16条楼中楼回复）
describe("记录71 本人回复保留（wb-owner-0907-1720）", () => {
  const post = items.find((i) => i.id === "wb-owner-0907-1720")!;

  it("16条本人回复全部保留且头像为真实头像", () => {
    expect(post).toBeTruthy();
    const own = post.comments.filter((c) => c.startsWith("陈立农：回复 @"));
    expect(own.length).toBe(16);
    const ownIdx = post.comments
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.startsWith("陈立农：回复 @"))
      .map(({ i }) => i);
    for (const i of ownIdx) {
      expect(post.commentMeta?.[i]?.avatar).toBe("weibo-hot/avatar-cln.jpg");
    }
    expect(post.commentMeta?.length).toBe(post.comments.length);
  });
});

// 记录78：王彦霖的评论保留（两条，真实头像），陈立农的回复也保留
describe("记录78 王彦霖评论保留（wb-owner-0520-1928）", () => {
  const post = items.find((i) => i.id === "wb-owner-0520-1928")!;

  it("王彦霖两条评论保留且头像为真实头像", () => {
    expect(post).toBeTruthy();
    const wylIdx = post.comments
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.startsWith("王彦霖："))
      .map(({ i }) => i);
    expect(wylIdx.length).toBe(2);
    for (const i of wylIdx) {
      expect(post.commentMeta?.[i]?.avatar).toBe("weibo-hot/avatar-wyl.jpg");
    }
    expect(post.comments[0]).toMatch(/^王彦霖：/);
  });

  it("陈立农对王彦霖的回复保留", () => {
    expect(
      post.comments.some((c) => c.startsWith("陈立农：回复 @王彦霖：")),
    ).toBe(true);
  });
});

// 2020生日动态（91→4556456051093190）：20岁生日，名人评论区。
// 热一王彦霖/热二郑恺/热三陈建州保留真实id+头像，陈立农本人回复保留；
// 粉丝热评4~10用应援头像拼「二十岁生日快乐」（avatar-f01~f07）
describe("生日动态评论区对齐真实原博（wb-owner-1003-2020·二十岁名人区）", () => {
  const post = items.find((i) => i.id === "wb-owner-1003-2020")!;

  it("有这条博文，名人评论真实保留", () => {
    expect(post).toBeTruthy();
    expect(post.comments[0]).toMatch(/^王彦霖：/);
    expect(post.comments[2]).toMatch(/^郑恺：/);
    expect(post.comments[4]).toMatch(/^黑人建州：/);
    expect(post.commentMeta?.[0]?.avatar).toBe("weibo-hot/avatar-wyl.jpg");
    expect(post.commentMeta?.[2]?.avatar).toBe("weibo-hot/avatar-zk.jpg");
    expect(post.commentMeta?.[4]?.avatar).toBe("weibo-hot/avatar-cz.jpg");
    for (const f of ["avatar-wyl.jpg", "avatar-zk.jpg", "avatar-cz.jpg"]) {
      expect(existsSync(resolve(process.cwd(), "public", "weibo-hot", f))).toBe(true);
    }
  });

  it("名人评论下陈立农本人回复全部保留", () => {
    const own = post.comments.filter((c) => c.startsWith("陈立农：回复 @"));
    expect(own.length).toBe(3);
    expect(own.some((c) => c.includes("谢哥"))).toBe(true);
    expect(own.some((c) => c.includes("恺哥"))).toBe(true);
    expect(own.some((c) => c.includes("黑哥"))).toBe(true);
  });

  it("粉丝热评应援头像逐字拼出「二十岁生日快乐」", () => {
    const chars = "二十岁生日快乐";
    const fanMeta = (post.commentMeta ?? []).filter((m) =>
      m?.avatar?.startsWith("weibo-hot/avatar-f"),
    );
    expect(fanMeta.length).toBe(7);
    fanMeta.slice(0, 7).forEach((m, k) => {
      const svg = readFileSync(resolve(process.cwd(), "public", m!.avatar!), "utf8");
      expect(svg).toContain(`>${chars[k]}<`);
    });
    expect(post.commentMeta?.length).toBe(post.comments.length);
  });
});

// 2019生日动态（118→4423459343603354）：19岁生日。
// 前排十条对齐真实热评，头像逐字拼「立农十九岁生日快乐」（avatar-g01~g10），真实赞数/时间/属地
describe("生日动态评论区对齐真实原博（wb-owner-1003-2019·十九岁）", () => {
  const post = items.find((i) => i.id === "wb-owner-1003-2019")!;

  it("有这条博文且前排十条为真实热评", () => {
    expect(post).toBeTruthy();
    expect(post.comments.length).toBeGreaterThanOrEqual(10);
    expect(post.comments[0]).toMatch(/^大仙的超级农农：/);
    expect(post.comments[1]).toMatch(/^帅农头上的呆毛儿：/);
    expect(post.commentMeta?.length).toBe(post.comments.length);
  });

  it("前排十条头像逐字拼出「祝立农十九岁生日快乐」", () => {
    const chars = "祝立农十九岁生日快乐";
    for (let k = 0; k < 10; k++) {
      const m = post.commentMeta?.[k];
      expect(m?.avatar).toBe(`weibo-hot/avatar-g${k + 1 < 10 ? "0" + (k + 1) : k + 1}.svg`);
      const svg = readFileSync(resolve(process.cwd(), "public", m!.avatar!), "utf8");
      expect(svg).toContain(`>${chars[k]}<`);
      expect(m?.likes).toBeGreaterThan(1000);
      expect(m?.time).toBeTruthy();
    }
  });
});
