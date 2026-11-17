import { useSkinState } from "../skinState";
import {
  ArrowDown,
  ArrowUp,
  AtSign,
  Bookmark,
  Camera,
  ChevronDown,
  ChevronRight,
  Grid,
  Hash,
  Heart,
  Home,
  ListFilter,
  MessageCircle,
  Repeat2,
  User,
  Users,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import type { Item } from "../schema";
import {
  Avatar,
  Empty,
  groupItems,
  Header,
  Media,
  meta,
  NameBadges,
  SearchBox,
  Tabs,
  useContent,
  Foldable,
  VAvatar,
  wanCount,
  weiboDate,
  type Props,
} from "./shared";
import { ImageViewer } from "./ImageViewer";
function Actions({ p, item }: { p: Props; item: Item }) {
  const [liked, setLiked] = useSkinState<boolean>(p, `liked-${item.id}`, false),
    [saved, setSaved] = useSkinState<boolean>(p, `saved-${item.id}`, false);
  return (
    <div className="social-actions">
      <button aria-label={`喜欢${item.title}`} onClick={() => setLiked(!liked)}>
        <Heart size={17} fill={liked ? "currentColor" : "none"} />
        {item.likes + (liked ? 1 : 0) || ""}
      </button>
      <button aria-label={`评论${item.title}`} onClick={() => p.onItem(item)}>
        <MessageCircle size={17} />
        {item.comments.length || ""}
      </button>
      <button aria-label={`详情${item.title}`} onClick={() => p.onItem(item)}>
        <Repeat2 size={17} />
        {meta(item, "reposts")}
      </button>
      <button aria-label={`收藏${item.title}`} onClick={() => setSaved(!saved)}>
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
function PostHeader({ item, p }: { item: Item; p: Props }) {
  const gold = item.sender === p.owner;
  const date = weiboDate(item.time);
  const source = meta(item, "source");
  return (
    <button className="social-author" onClick={() => p.onItem(item)}>
      <VAvatar name={item.sender} src={item.avatar} gold={gold} />
      <span>
        <strong>
          {item.sender}
          {gold && <NameBadges />}
        </strong>
        <small className="weibo-author-sub">
          {source ? `${date} 来自 ${source}` : date}
        </small>
      </span>
      <ChevronDown size={16} className="weibo-author-chevron" />
    </button>
  );
}
function WeiboActions({ p, item }: { p: Props; item: Item }) {
  const [liked, setLiked] = useSkinState<boolean>(p, `liked-${item.id}`, false);
  return (
    <div className="social-actions weibo-actions">
      <button aria-label={`转发${item.title}`} onClick={() => p.onItem(item)}>
        <Share2 size={17} />
        {meta(item, "reposts", "转发")}
      </button>
      <button aria-label={`评论${item.title}`} onClick={() => p.onItem(item)}>
        <MessageCircle size={17} />
        {meta(item, "commentsCount") || item.comments.length || "评论"}
      </button>
      <button
        aria-label={`喜欢${item.title}`}
        aria-pressed={liked}
        onClick={() => setLiked(!liked)}
      >
        <ThumbsUp size={17} fill={liked ? "currentColor" : "none"} />
        {meta(item, "likesCount") || wanCount(item.likes + (liked ? 1 : 0)) || "赞"}
      </button>
    </div>
  );
}
export function WeiboSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "关注");
  const [feed, setFeed] = useState("全部");
  const [viewer, setViewer] = useState<{ item: Item; index: number } | null>(
    null,
  );
  // 年份筛选 + 时间正/倒序（默认"最新在前"，即数据本来的倒序）
  const [year, setYear] = useState("全部");
  const [asc, setAsc] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  // 「那年今天」：查看往年同月同日的动态
  const [todayMode, setTodayMode] = useState(false);
  const now = new Date();
  const todayMd = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const curYear = String(now.getFullYear());
  const todayPosts = items.filter(
    (i) => i.time.slice(5, 10) === todayMd && i.time.slice(0, 4) !== curYear,
  );
  const years = [...new Set(items.map((i) => i.time.slice(0, 4)))]
    .sort()
    .reverse();
  const base = feed === "全部" ? items : items.filter((i) => i.folder === feed);
  const matched = todayMode
    ? todayPosts
    : year === "全部"
      ? base
      : base.filter((i) => i.time.startsWith(year));
  const list = asc ? [...matched].reverse() : matched;
  return (
    <div className="catalog-skin weibo-ui">
      <Header p={p} />
      <div className="weibo-sections">
        {["关注", "发现", "我"].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="catalog-scroll">
        {tab === "我" ? (
          <div className="weibo-profile">
            {meta(items[0], "profileCover") && (
              <div
                className="weibo-profile-cover"
                style={{
                  backgroundImage: `url(${meta(items[0], "profileCover")})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            <div className="weibo-profile-head">
              <VAvatar name={p.owner ?? "我"} src={items[0]?.avatar} gold />
              <div className="weibo-profile-name">
                <h2>
                  {p.owner ?? "我"}
                  <NameBadges />
                </h2>
                {(meta(items[0], "profileFans") ||
                  meta(items[0], "profileFollowing") ||
                  meta(items[0], "profileInteractions")) && (
                  <div className="weibo-profile-stats">
                    {meta(items[0], "profileFans") && (
                      <span>
                        <b>{meta(items[0], "profileFans")}</b> 粉丝
                      </span>
                    )}
                    {meta(items[0], "profileFollowing") && (
                      <span>
                        <b>{meta(items[0], "profileFollowing")}</b> 关注
                      </span>
                    )}
                    {meta(items[0], "profileInteractions") && (
                      <span>
                        <b>{meta(items[0], "profileInteractions")}</b> 转赞评
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <span>{items.length} 条微博</span>
          </div>
        ) : (
          <>
            <SearchBox value={q} set={setQ} />
            <div className="weibo-feed-filter">
              {["全部", ...groupItems(items).filter((g) => g !== "未分类")].map(
                (g) => (
                  <button key={g} onClick={() => setFeed(g)}>
                    {g}
                  </button>
                ),
              )}
            </div>
          </>
        )}
        {tab === "我" && (
          <div className="weibo-count-bar">
            <span>{todayMode ? `那年今天(${list.length})` : `全部微博(${list.length})`}</span>
            <button
              className={filterOpen ? "selected" : ""}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <ListFilter size={15} aria-hidden="true" />
              筛选
            </button>
          </div>
        )}
        {tab === "我" && filterOpen && !todayMode && (
              <div className="weibo-filter-panel">
                <div className="weibo-filter-row">
                  <span>年份</span>
                  <div>
                    <button
                      className={year === "全部" ? "selected" : ""}
                      onClick={() => setYear("全部")}
                    >
                      全部
                    </button>
                    {years.map((y) => (
                      <button
                        key={y}
                        className={year === y ? "selected" : ""}
                        onClick={() => setYear(y)}
                      >
                        {y}年
                      </button>
                    ))}
                  </div>
                </div>
                <div className="weibo-filter-row">
                  <span>排序</span>
                  <div>
                    <button
                      className={!asc ? "selected" : ""}
                      onClick={() => setAsc(false)}
                    >
                      最新在前
                    </button>
                    <button
                      className={asc ? "selected" : ""}
                      onClick={() => setAsc(true)}
                    >
                      最早在前
                    </button>
                  </div>
                </div>
              </div>
            )}
        {tab === "我" && (
          <>
            <button
              className={"weibo-td-banner" + (todayMode ? " active" : "")}
              onClick={() => {
                setTodayMode(!todayMode);
                setFilterOpen(false);
              }}
              aria-pressed={todayMode}
            >
              <svg
                className="weibo-td-art"
                viewBox="0 0 430 84"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="tdbg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#e6f0fa" />
                  </linearGradient>
                  <linearGradient id="tdpage" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#d5e8f8" />
                  </linearGradient>
                  <linearGradient id="tdpencil" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#f8c64a" />
                    <stop offset="1" stopColor="#eda321" />
                  </linearGradient>
                </defs>
                <rect width="430" height="84" fill="url(#tdbg)" />
                {/* 虚线航迹：左下 → 纸飞机 → 右侧 */}
                <path
                  d="M0 72 C 55 76, 105 68, 138 50 C 168 32, 196 20, 232 22"
                  fill="none"
                  stroke="#a9c8e4"
                  strokeWidth="1.6"
                  strokeDasharray="5 4"
                />
                <path
                  d="M262 38 C 298 52, 338 62, 386 58"
                  fill="none"
                  stroke="#bcd5ec"
                  strokeWidth="1.4"
                  strokeDasharray="5 4"
                  opacity="0.85"
                />
                {/* 纸飞机 */}
                <g transform="translate(234 10) rotate(-4)">
                  <polygon points="0,13 36,0 17,20" fill="#d8e9f9" />
                  <polygon points="0,13 17,20 13,31" fill="#a5c8ea" />
                  <polygon points="17,20 36,0 21,26" fill="#bfd8f1" />
                  <polygon points="0,13 36,0 15,17" fill="#c9dff4" />
                </g>
                {/* 台历 */}
                <g transform="translate(60 44) rotate(12)">
                  {/* 扇形翻页 */}
                  <rect x="-30" y="-27" width="60" height="52" rx="6" fill="#c2dcef" transform="rotate(15 -24 -4)" />
                  <rect x="-30" y="-27" width="60" height="52" rx="6" fill="#dcEFFb" transform="rotate(8 -24 -4)" />
                  {/* 主页面 */}
                  <rect x="-30" y="-27" width="60" height="52" rx="6" fill="url(#tdpage)" stroke="#b9d3ea" strokeWidth="1" />
                  {/* 绿色线圈 */}
                  {[-22, -12, -2, 8, 18].map((x) => (
                    <g key={x}>
                      <line x1={x} y1="-27" x2={x} y2="-22" stroke="#5aab7f" strokeWidth="1.6" />
                      <ellipse cx={x} cy="-31" rx="3" ry="4.6" fill="none" stroke="#6fbf8f" strokeWidth="2" />
                    </g>
                  ))}
                  {/* 202? 标签 */}
                  <rect x="-24" y="-20" width="31" height="12" rx="3" fill="#4a7fc0" />
                  <text x="-8.5" y="-11" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">202?</text>
                  <text x="20" y="-11" textAnchor="middle" fontSize="9" fill="#f3b83d">★</text>
                  {/* 日期数字 */}
                  {Array.from({ length: 20 }, (_, k) => k + 1).map((n) => (
                    <text
                      key={n}
                      x={-25 + ((n - 1) % 7) * 8.5}
                      y={1 + Math.floor((n - 1) / 7) * 9.5}
                      textAnchor="middle"
                      fontSize="7"
                      fill="#8fb0cc"
                    >
                      {n}
                    </text>
                  ))}
                  {/* 17号红圈 */}
                  <circle cx="-8" cy="17.5" r="5.8" fill="none" stroke="#e04848" strokeWidth="1.6" />
                  {/* 铅笔：笔尖指向17号 */}
                  <g transform="translate(2 -2) rotate(140)">
                    <rect x="-16" y="-4" width="34" height="8" rx="1.4" fill="url(#tdpencil)" />
                    <rect x="-23" y="-4" width="7" height="8" rx="2.4" fill="#f2a0ab" />
                    <polygon points="18,-4 28,0 18,4" fill="#f3dfc0" />
                    <polygon points="26.4,-0.8 28,0 26.4,0.8" fill="#3a3a3a" />
                  </g>
                </g>
              </svg>
              <span className="weibo-td-content">
                <span className="weibo-td-title">
                  {["那", "年", "今", "天"].map((c) => (
                    <span className="weibo-td-cell" key={c}>
                      {c}
                    </span>
                  ))}
                </span>
                <span className="weibo-td-sub">
                  {todayMode ? "正在查看那年今天" : "那年的你在今天有什么动态"}
                  <i className="weibo-td-go">{todayMode ? "退出" : "GO"}</i>
                </span>
              </span>
            </button>
            <div className="weibo-manage-row">
              <span>管理定时发博</span>
              <span>草稿箱(99+)</span>
            </div>
          </>
        )}
        {list.map((i) => (
          <article className="weibo-post" key={i.id}>
            <PostHeader p={p} item={i} />
            <button className="social-body" onClick={() => p.onItem(i)}>
              <Foldable text={i.body} maxLines={6} />
              {(i.media || i.mediaList.length > 0 || i.meta.video) && (
                <Media
                  item={i}
                  onMore={
                    i.mediaList.length > 9 ? () => p.onItem(i) : undefined
                  }
                  onImage={(index) => setViewer({ item: i, index })}
                />
              )}
              {meta(i, "hotIndex") && (
                <span className="weibo-hot-pill">
                  <b>热文</b>热文指数{meta(i, "hotIndex")}
                </span>
              )}
            </button>
            <WeiboActions p={p} item={i} />
          </article>
        ))}
        <Empty items={list} />
      </div>
      {viewer && (
        <ImageViewer
          images={
            viewer.item.mediaList.length
              ? viewer.item.mediaList
              : viewer.item.media
                ? [viewer.item.media]
                : []
          }
          index={viewer.index}
          setIndex={(n) => setViewer({ ...viewer, index: n })}
          sender={viewer.item.sender}
          avatar={viewer.item.avatar}
          owner={p.owner}
          reposts={meta(viewer.item, "reposts", "转发")}
          comments={
            meta(viewer.item, "commentsCount") ||
            String(viewer.item.comments.length)
          }
          likes={wanCount(viewer.item.likes)}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}
export function XSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "为你推荐");
  return (
    <div className="catalog-skin x-ui">
      <Header p={p} />
      <div className="x-feed-tabs">
        <button
          className={tab === "为你推荐" ? "selected" : ""}
          onClick={() => setTab("为你推荐")}
        >
          为你推荐
        </button>
        <button
          className={tab === "正在关注" ? "selected" : ""}
          onClick={() => setTab("正在关注")}
        >
          正在关注
        </button>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {items
          .filter((i) => tab === "为你推荐" || i.folder === "正在关注")
          .map((i) => (
            <article className="x-post" key={i.id}>
              <Avatar name={i.sender} />
              <div>
                <button className="x-byline" onClick={() => p.onItem(i)}>
                  <strong>{i.sender}</strong>
                  <span>
                    @{meta(i, "handle", i.sender)} · {i.time.slice(5, 10)}
                  </span>
                </button>
                <button className="social-body" onClick={() => p.onItem(i)}>
                  <Foldable text={i.body} maxLines={6} />
                  {(i.media || i.mediaList.length > 0) && <Media item={i} />}
                </button>
                <Actions p={p} item={i} />
              </div>
            </article>
          ))}
      </div>
      <Tabs
        tabs={["为你推荐", "正在关注"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />]}
      />
    </div>
  );
}
export function ThreadsSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "为你推荐");
  return (
    <div className="catalog-skin threads-ui">
      <Header p={p} />
      <div className="threads-title">
        <AtSign size={30} />
        <button
          onClick={() => setTab(tab === "为你推荐" ? "正在关注" : "为你推荐")}
        >
          {tab} ⌄
        </button>
      </div>
      <div className="catalog-scroll">
        {(tab === "个人主页"
          ? items
          : items.filter((i) => tab !== "正在关注" || i.folder === "正在关注")
        ).map((i) => (
          <article className="threads-post" key={i.id}>
            <div className="thread-avatar">
              <Avatar name={i.sender} />
              <i />
            </div>
            <div>
              <div className="threads-byline">
                <strong>{i.sender}</strong>
                <small>{i.time.slice(5, 10)}</small>
              </div>
              <button className="social-body" onClick={() => p.onItem(i)}>
                <Foldable text={i.body} maxLines={6} />
                {(i.media || i.mediaList.length > 0) && <Media item={i} />}
              </button>
              <Actions p={p} item={i} />
              <button className="thread-replies" onClick={() => p.onItem(i)}>
                {i.comments.length} 条回复
              </button>
            </div>
          </article>
        ))}
        <Empty items={items} />
      </div>
      <Tabs
        tabs={["为你推荐", "正在关注", "个人主页"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
    </div>
  );
}
export function FacebookSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "动态");
  const stories = items.filter((i) => i.folder === "Story");
  return (
    <div className="catalog-skin facebook-ui">
      <Header p={p} />
      <Tabs
        tabs={["动态", "好友", "个人主页"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {tab === "动态" ? (
          <>
            <button
              className="fb-compose"
              disabled={!p.creator}
              onClick={p.onAdd}
            >
              <Avatar name={p.owner ?? "我"} />
              分享新动态
            </button>
            <div className="fb-stories">
              {stories.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <Media item={i} />
                  <strong>{i.sender}</strong>
                </button>
              ))}
            </div>
            {items
              .filter((i) => i.folder !== "Story")
              .map((i) => (
                <article className="fb-post" key={i.id}>
                  <PostHeader p={p} item={i} />
                  <button className="social-body" onClick={() => p.onItem(i)}>
                    <Foldable text={i.body} maxLines={6} />
                    {(i.media || i.mediaList.length > 0) && <Media item={i} />}
                  </button>
                  <Actions p={p} item={i} />
                </article>
              ))}
          </>
        ) : tab === "好友" ? (
          <div className="fb-friends">
            {[...new Set(items.map((i) => i.sender))].map((s) => (
              <button
                key={s}
                onClick={() => p.onItem(items.find((i) => i.sender === s)!)}
              >
                <Avatar name={s} />
                <strong>{s}</strong>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="fb-cover" />
            <div className="fb-profile">
              <Avatar name={p.owner ?? "我"} />
              <h1>{p.owner ?? "我"}</h1>
            </div>
            {items
              .filter((i) => i.folder === "个人主页")
              .map((i) => (
                <button
                  key={i.id}
                  className="fb-profile-note"
                  onClick={() => p.onItem(i)}
                >
                  {i.title}
                  <Foldable text={i.body} maxLines={6} />
                </button>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
export function RedbookSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "发现");
  const list =
    tab === "收藏"
      ? items.filter((i) => i.favorite)
      : tab === "关注"
        ? items.filter((i) => i.folder === "关注")
        : items;
  return (
    <div className="catalog-skin redbook-ui">
      <Header p={p} />
      <div className="redbook-top">
        {["关注", "发现", "收藏"].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        <div className="redbook-masonry">
          {list.map((i) => (
            <button key={i.id} onClick={() => p.onItem(i)}>
              <Media item={i} />
              <strong>{i.title}</strong>
              <div>
                <Avatar name={i.sender} />
                <small>{i.sender}</small>
                <Heart size={12} />
                <small>{i.likes}</small>
              </div>
            </button>
          ))}
        </div>
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["发现", "收藏"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Bookmark />]}
      />
    </div>
  );
}
export function PinterestSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "发现");
  const [board, setBoard] = useState("");
  const list = board
    ? items.filter((i) => (i.folder || "未分类") === board)
    : items;
  return (
    <div className="catalog-skin pinterest-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        {tab === "收藏板" && !board ? (
          <>
            <h1>收藏板</h1>
            <div className="pinterest-boards">
              {groupItems(items).map((g) => (
                <button key={g} onClick={() => setBoard(g)}>
                  <Media
                    item={items.find((i) => (i.folder || "未分类") === g)!}
                  />
                  <strong>{g}</strong>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <SearchBox value={q} set={setQ} />
            {board && (
              <button
                className="pinterest-board-title"
                onClick={() => setBoard("")}
              >
                {board} · 返回收藏板
              </button>
            )}
            <div className="pinterest-pins">
              {list.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <Media item={i} />
                  <strong>{i.title}</strong>
                </button>
              ))}
            </div>
            <Empty items={list} />
          </>
        )}
      </div>
      <Tabs
        tabs={["发现", "收藏板"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setBoard("");
        }}
        icons={[<Home />, <Grid />]}
      />
    </div>
  );
}
export function RedditSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [sort, setSort] = useState("最新");
  const list = [...items].sort((a, b) =>
    sort === "热门" ? b.likes - a.likes : b.time.localeCompare(a.time),
  );
  return (
    <div className="catalog-skin reddit-ui">
      <Header p={p} />
      <div className="reddit-community">
        <Hash size={21} />
        <button onClick={() => setTab(tab === "首页" ? "社区" : "首页")}>
          {tab} ⌄
        </button>
        <select
          aria-label="帖子排序"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option>最新</option>
          <option>热门</option>
        </select>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {tab === "社区"
          ? groupItems(items).map((g) => (
              <button
                className="reddit-sub"
                key={g}
                onClick={() => {
                  setQ(g === "未分类" ? "" : g);
                  setTab("首页");
                }}
              >
                <Hash size={22} />
                {g}
                <small>
                  {items.filter((i) => (i.folder || "未分类") === g).length} 帖
                </small>
              </button>
            ))
          : list.map((i) => <RedditPost key={i.id} p={p} item={i} />)}
        <Empty items={items} />
      </div>
      <Tabs
        tabs={["首页", "社区"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />]}
      />
    </div>
  );
}
function RedditPost({ p, item: i }: { p: Props; item: Item }) {
  const [vote, setVote] = useSkinState<number>(p, `vote-${i.id}`, 0);
  return (
    <article className="reddit-post">
      <button className="reddit-byline" onClick={() => p.onItem(i)}>
        r/{meta(i, "community", i.folder || "story")} · u/{i.sender}
      </button>
      <button className="social-body" onClick={() => p.onItem(i)}>
        <h3>{i.title}</h3>
        <Foldable text={i.body} maxLines={6} />
        {(i.media || i.mediaList.length > 0) && <Media item={i} />}
      </button>
      <div className="reddit-actions">
        <button
          aria-label={`赞同${i.title}`}
          onClick={() => setVote(vote === 1 ? 0 : 1)}
        >
          <ArrowUp size={17} />
        </button>
        <span>{Number(meta(i, "votes", String(i.likes))) + vote}</span>
        <button
          aria-label={`反对${i.title}`}
          onClick={() => setVote(vote === -1 ? 0 : -1)}
        >
          <ArrowDown size={17} />
        </button>
        <button onClick={() => p.onItem(i)}>
          <MessageCircle size={16} />
          {i.comments.length} 评论
        </button>
      </div>
    </article>
  );
}
export function ForumSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "帖子");
  const [board, setBoard] = useState("");
  const list = board
    ? items.filter((i) => (i.folder || "未分类") === board)
    : items;
  return (
    <div className="catalog-skin forum-ui">
      <Header p={p} />
      <div className="forum-banner">
        <Hash size={27} />
        <strong>{board || "论坛"}</strong>
        <span>{items.length} 个主题</span>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {tab === "版块"
          ? groupItems(items).map((g) => (
              <button
                className="forum-board"
                key={g}
                onClick={() => {
                  setBoard(g);
                  setTab("帖子");
                }}
              >
                <FolderIcon />
                <div>
                  <strong>{g}</strong>
                  <small>
                    {items.filter((i) => (i.folder || "未分类") === g).length}{" "}
                    个主题
                  </small>
                </div>
                <ChevronRight size={16} />
              </button>
            ))
          : list.map((i) => (
              <button
                className="forum-topic"
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <strong>
                  {meta(i, "status") && <em>{meta(i, "status")}</em>}
                  {i.title}
                </strong>
                <p>{i.body.split("\n")[0]}</p>
                <div>
                  <span>
                    {i.sender} · {i.time.slice(5, 16)}
                  </span>
                  <span>
                    {meta(i, "views", "—")} 浏览 · {i.comments.length} 回复
                  </span>
                </div>
              </button>
            ))}
      </div>
      <Tabs
        tabs={["帖子", "版块"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setBoard("");
        }}
        icons={[<MessageCircle />, <Grid />]}
      />
    </div>
  );
}
function FolderIcon() {
  return <Hash size={27} />;
}
export function SnapchatSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "快拍");
  const [index, setIndex] = useState(0);
  const list = items.filter((i) =>
    tab === "回忆"
      ? i.favorite || i.folder === "回忆"
      : tab === "聊天"
        ? i.folder === "聊天"
        : i.folder !== "聊天",
  );
  const i = list[index % Math.max(list.length, 1)];
  return (
    <div className="catalog-skin snapchat-ui">
      <Header p={p} />
      <div className="snap-content">
        {tab === "聊天" ? (
          <div className="snap-chats">
            {list.map((x) => (
              <button key={x.id} onClick={() => p.onItem(x)}>
                <Avatar name={x.sender} />
                <div>
                  <strong>{x.sender}</strong>
                  <small>{x.body}</small>
                </div>
                <Camera size={20} />
              </button>
            ))}
          </div>
        ) : i ? (
          <>
            <Media item={i} />
            <button className="snap-author" onClick={() => p.onItem(i)}>
              <Avatar name={i.sender} />
              {i.sender}
            </button>
            <button
              className="snap-next"
              aria-label="下一条快拍"
              onClick={() => {
                setIndex((n) => n + 1);
                p.onRead(i.id);
              }}
            >
              <ChevronRight size={25} />
            </button>
            <button className="snap-caption" onClick={() => p.onItem(i)}>
              {i.body}
            </button>
          </>
        ) : (
          <p className="catalog-empty">暂无{tab}</p>
        )}
      </div>
      <Tabs
        tabs={["聊天", "快拍", "回忆"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setIndex(0);
        }}
        icons={[<MessageCircle />, <Camera />, <ImageIcon />]}
      />
    </div>
  );
}
function ImageIcon() {
  return <Grid />;
}
