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

// 记录128（画熊猫）：陈立农9条楼中楼回复全部保留，紧跟对应热评
describe("记录128 本人回复保留（wb-owner-0716-2000）", () => {
  const post = items.find((i) => i.id === "wb-owner-0716-2000")!;

  it("9条本人回复全部保留且头像为真实头像", () => {
    expect(post).toBeTruthy();
    const ownIdx = post.comments
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.startsWith("陈立农：回复 @"))
      .map(({ i }) => i);
    expect(ownIdx.length).toBe(9);
    for (const i of ownIdx) {
      expect(post.commentMeta?.[i]?.avatar).toBe("weibo-hot/avatar-cln.jpg");
    }
    expect(post.commentMeta?.length).toBe(post.comments.length);
  });

  it("回复内容与热评一一对应（生日快乐等真实短回复）", () => {
    const own = post.comments.filter((c) => c.startsWith("陈立农：回复 @"));
    expect(own.some((c) => c.endsWith("：生日快乐"))).toBe(true);
    expect(own.some((c) => c.endsWith("：你们比较可爱"))).toBe(true);
  });
});

// 记录135（昨日 新朋友）：对新浪娱乐的本人回复保留
describe("记录135 本人回复保留（wb-owner-0505-1816）", () => {
  const post = items.find((i) => i.id === "wb-owner-0505-1816")!;

  it("新浪娱乐热评与本人回复均保留", () => {
    expect(post).toBeTruthy();
    expect(post.comments[0]).toMatch(/^新浪娱乐：/);
    const own = post.comments.filter((c) => c.startsWith("陈立农：回复 @新浪娱乐："));
    expect(own.length).toBe(1);
    const idx = post.comments.findIndex((c) => c.startsWith("陈立农：回复 @新浪娱乐："));
    expect(post.commentMeta?.[idx]?.avatar).toBe("weibo-hot/avatar-cln.jpg");
  });
});

// 记录136~155（2019-04-12 → 2018-10-02）：真实原博补齐，含 8 条视频与 3 处本人回复
describe("记录136~155 真实原博补齐", () => {
  type FullPost = {
    id: string;
    body: string;
    time: string;
    likes: number;
    mediaList?: string[];
    comments: string[];
    commentMeta?: ({ avatar?: string; likes?: number } | null)[];
    meta: { location?: string; source?: string; video?: string; videoCover?: string };
  };
  const all = (story.content?.weibo ?? []) as FullPost[];
  const ids = [
    "wb-owner-0412-2016",
    "wb-owner-0403-2220",
    "wb-owner-0330-2128",
    "wb-owner-0224-1816",
    "wb-owner-0219-2055",
    "wb-owner-0214-1921",
    "wb-owner-0207-1928",
    "wb-owner-0204-1934",
    "wb-owner-0201-1947",
    "wb-owner-0129-2301",
    "wb-owner-0108-1945",
    "wb-owner-1217-1818",
    "wb-owner-1211-1640",
    "wb-owner-1209-0209",
    "wb-owner-1206-0004",
    "wb-owner-1126-2158",
    "wb-owner-1124-1833",
    "wb-owner-1015-2223",
    "wb-owner-1012-1838",
    "wb-owner-1002-2359",
  ];

  it("20 条按时间倒序排列且顺序全部正确", () => {
    for (const id of ids) expect(all.some((p) => p.id === id)).toBe(true);
    const times = all.map((p) => p.time);
    const sorted = [...times].sort().reverse();
    expect(times).toEqual(sorted);
    const picked = ids.map((id) => all.find((p) => p.id === id)!.time);
    expect(picked).toEqual([...picked].sort().reverse());
  });

  it("每条都有来源 IP 与真实赞数", () => {
    for (const id of ids) {
      const p = all.find((x) => x.id === id)!;
      expect(p.likes).toBeGreaterThan(190000);
      expect(p.meta.location).toBe("发布于中国台湾");
    }
  });

  it("9 条视频与封面文件都存在", () => {
    const videos = ids
      .map((id) => all.find((p) => p.id === id)!)
      .filter((p) => p.meta.video);
    expect(videos.length).toBe(9);
    for (const p of videos) {
      expect(["微博视频号", "微博视频", "微博故事"]).toContain(p.meta.source);
      expect(existsSync(resolve(process.cwd(), "public", p.meta.video!.slice(1)))).toBe(true);
      expect(existsSync(resolve(process.cwd(), "public", p.meta.videoCover!.slice(1)))).toBe(true);
    }
  });

  it("三处本人回复保留且头像为真实头像", () => {
    const cases: [string, string][] = [
      ["wb-owner-0403-2220", "陈立农：回复 @新浪娱乐：等工作结束才行"],
      ["wb-owner-0219-2055", "陈立农：回复 @新浪娱乐：猜猜[哈哈]"],
      ["wb-owner-0108-1945", "陈立农：回复 @新浪娱乐：你也不错哈哈😄"],
    ];
    for (const [id, text] of cases) {
      const p = all.find((x) => x.id === id)!;
      expect(p.comments[0]).toMatch(/^新浪娱乐：/);
      const idx = p.comments.indexOf(text);
      expect(idx).toBeGreaterThan(0);
      expect(p.commentMeta?.[idx]?.avatar).toBe("weibo-hot/avatar-cln.jpg");
      expect(p.commentMeta?.length).toBe(p.comments.length);
    }
  });

  it("记录140 保留新浪娱乐对本人回复的追评", () => {
    const p = all.find((x) => x.id === "wb-owner-0219-2055")!;
    const idx = p.comments.indexOf("陈立农：回复 @新浪娱乐：猜猜[哈哈]");
    expect(p.comments[idx + 1]).toBe("新浪娱乐：回复 @陈立农：猜对有奖吗？[阴险]");
  });
});

// 记录156~179（19-04-12 → 18-09-27 可获取的 18 条）：含 5 条视频、王彦霖评论与两处置顶自评
describe("记录156~179 真实原博补齐", () => {
  type FullPost = {
    id: string;
    body: string;
    time: string;
    likes: number;
    mediaList?: string[];
    comments: string[];
    commentMeta?: ({ avatar?: string; likes?: number } | null)[];
    meta: { location?: string; source?: string; video?: string; videoCover?: string };
  };
  const all = (story.content?.weibo ?? []) as FullPost[];
  const ids = [
    "wb-owner-0927-1149",
    "wb-owner-0909-2018",
    "wb-owner-0730-1945",
    "wb-owner-0729-1820",
    "wb-owner-0726-1719",
    "wb-owner-0706-2236",
    "wb-owner-0704-1622",
    "wb-owner-0627-2119",
    "wb-owner-0626-0908",
    "wb-owner-0621-1834",
    "wb-owner-0530-2252",
    "wb-owner-0527-2121",
    "wb-owner-0503-1001",
    "wb-owner-0427-1553",
    "wb-owner-0418-1052",
    "wb-owner-0416-1333",
    "wb-owner-0414-1213",
    "wb-owner-0412-1245",
  ];

  it("18 条齐备且全序列时间倒序", () => {
    for (const id of ids) expect(all.some((p) => p.id === id)).toBe(true);
    const times = all.map((p) => p.time);
    expect(times).toEqual([...times].sort().reverse());
  });

  it("每条都有来源 IP 与真实赞数", () => {
    for (const id of ids) {
      const p = all.find((x) => x.id === id)!;
      expect(p.likes).toBeGreaterThan(200000);
      expect(p.meta.location).toBe("发布于中国台湾");
    }
  });

  it("8 条视频与封面文件都存在", () => {
    const videos = ids
      .map((id) => all.find((p) => p.id === id)!)
      .filter((p) => p.meta.video);
    expect(videos.length).toBe(8);
    for (const p of videos) {
      expect(["微博视频号", "微博视频", "微博故事"]).toContain(p.meta.source);
      expect(existsSync(resolve(process.cwd(), "public", p.meta.video!.slice(1)))).toBe(true);
      expect(existsSync(resolve(process.cwd(), "public", p.meta.videoCover!.slice(1)))).toBe(true);
    }
  });

  it("王彦霖评论与本人回复真实保留（记录159/160）", () => {
    for (const id of ["wb-owner-0730-1945", "wb-owner-0729-1820"]) {
      const p = all.find((x) => x.id === id)!;
      expect(p.comments[0]).toMatch(/^王彦霖：/);
      expect(p.commentMeta?.[0]?.avatar).toBe("weibo-hot/avatar-wyl.jpg");
      expect(p.commentMeta?.[0]?.likes).toBeGreaterThan(30000);
      expect(p.comments[1]).toMatch(/^陈立农：回复 @王彦霖：/);
      expect(p.commentMeta?.[1]?.avatar).toBe("weibo-hot/avatar-cln.jpg");
      expect(p.commentMeta?.length).toBe(p.comments.length);
    }
  });

  it("置顶自评用本人头像与真实赞数（记录167/169）", () => {
    const cases: [string, number][] = [
      ["wb-owner-0503-1001", 187940],
      ["wb-owner-0530-2252", 92728],
    ];
    for (const [id, likes] of cases) {
      const p = all.find((x) => x.id === id)!;
      expect(p.comments[0]).toMatch(/^陈立农：/);
      expect(p.commentMeta?.[0]?.avatar).toBe("weibo-hot/avatar-cln.jpg");
      expect(p.commentMeta?.[0]?.likes).toBe(likes);
    }
  });
});

// 记录157/171/176~179：用户直接补录的 6 条（原文案 + 2 视频 + 4 图）
// 发布时间由微博 mid 位解码还原（mid >> 22 + 515483463，误差 ±1 秒）
describe("记录157/171/176~179 用户补录", () => {
  type FullPost = {
    id: string;
    body: string;
    time: string;
    likes: number;
    mediaList?: string[];
    comments: string[];
    meta: { location?: string; source?: string; video?: string; videoCover?: string };
  };
  const all = (story.content?.weibo ?? []) as FullPost[];
  const pick = (id: string) => all.find((p) => p.id === id)!;
  const ids = [
    "wb-owner-0924-2101",
    "wb-owner-0426-1600",
    "wb-owner-0407-1833",
    "wb-owner-0402-1948",
    "wb-owner-0324-2016",
    "wb-owner-0311-1653",
  ];

  it("6 条齐备且全序列时间倒序", () => {
    for (const id of ids) expect(all.some((p) => p.id === id)).toBe(true);
    const times = all.map((p) => p.time);
    expect(times).toEqual([...times].sort().reverse());
  });

  it("时间按 mid 解码落在正确区间（中秋/决赛后/见面会前）", () => {
    expect(pick("wb-owner-0924-2101").time).toBe("2018-09-24 21:01");
    expect(pick("wb-owner-0426-1600").time).toBe("2018-04-26 16:00");
    expect(pick("wb-owner-0407-1833").time).toBe("2018-04-07 18:33");
    expect(pick("wb-owner-0402-1948").time).toBe("2018-04-02 19:48");
    expect(pick("wb-owner-0324-2016").time).toBe("2018-03-24 20:16");
    expect(pick("wb-owner-0311-1653").time).toBe("2018-03-11 16:53");
    expect(pick("wb-owner-0407-1833").time < pick("wb-owner-0402-1948").time).toBe(false);
  });

  it("正文保留原文关键内容", () => {
    expect(pick("wb-owner-0924-2101").body).toContain("1003见");
    expect(pick("wb-owner-0426-1600").body).toContain("一百万粉丝福利");
    expect(pick("wb-owner-0407-1833").body).toContain("皮皮");
    expect(pick("wb-owner-0402-1948").body).toContain("#偶像练习生#");
    expect(pick("wb-owner-0324-2016").body).toContain("#偶像练习生VIP千人见面会");
    expect(pick("wb-owner-0311-1653").body).toContain("全民製作人");
  });

  it("2 条视频与封面文件都存在且标为视频号", () => {
    for (const id of ["wb-owner-0924-2101", "wb-owner-0426-1600"]) {
      const p = pick(id);
      expect(p.meta.source).toBe("微博视频号");
      expect(existsSync(resolve(process.cwd(), "public", p.meta.video!.slice(1)))).toBe(true);
      expect(existsSync(resolve(process.cwd(), "public", p.meta.videoCover!.slice(1)))).toBe(true);
    }
  });

  it("4 条图文各有 1 张内嵌图，视频博不带图", () => {
    for (const id of ["wb-owner-0407-1833", "wb-owner-0402-1948", "wb-owner-0324-2016", "wb-owner-0311-1653"]) {
      const p = pick(id);
      expect(p.mediaList?.length).toBe(1);
      expect(p.mediaList![0].startsWith("data:image/jpeg;base64,")).toBe(true);
    }
    expect(pick("wb-owner-0924-2101").meta.video).toBeTruthy();
  });

  it("每条都有来源 IP、赞数与评论", () => {
    for (const id of ids) {
      const p = pick(id);
      expect(p.meta.location).toBe("发布于中国台湾");
      expect(p.likes).toBeGreaterThan(290000);
      expect(p.comments.length).toBeGreaterThanOrEqual(14);
    }
  });
});
