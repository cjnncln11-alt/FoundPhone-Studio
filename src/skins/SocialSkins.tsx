import { useSkinState } from "../skinState";
import {
  ArrowDown,
  ArrowUp,
  AtSign,
  Bookmark,
  CalendarCheck,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Diamond,
  Grid,
  Hash,
  Heart,
  Home,
  ListFilter,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Search,
  ShieldCheck,
  User,
  Users,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { useState, Fragment } from "react";
import type { Item } from "../schema";
import {
  Avatar,
  Empty,
  groupItems,
  Header,
  Media,
  meta,
  NameBadges,
  StudioBadges,
  StNameBadges,
  SearchBox,
  Tabs,
  useContent,
  Foldable,
  VAvatar,
  wanCount,
  weiboDate,
  type Props,
  WeiboFansOnly,
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
function PostHeader({
  item,
  p,
  hideChevron = false,
}: {
  item: Item;
  p: Props;
  hideChevron?: boolean;
}) {
  const gold = item.sender === p.owner;
  const badge = !gold ? meta(item, "badge") : "";
  const blue = badge === "blue";
  const oBadge = badge === "orange";
  const yBadge = badge === "yellow";
  const orange = meta(item, "orangeName") === "true";
  const crown = meta(item, "crown") === "true";
  const withSuper = meta(item, "superTopic") !== "0";
  const plainBlue = meta(item, "plainBlue") === "true";
  const stRole = meta(item, "stRole");
  const stTag = meta(item, "stTag");
  const stLevel = meta(item, "stLevel");
  const stCrown = meta(item, "stCrown") === "true";
  const edited = meta(item, "edited") === "true";
  const date = weiboDate(item.time);
  const source = meta(item, "source");
  return (
    <button className="social-author" onClick={() => p.onItem(item)}>
      <VAvatar
        name={item.sender}
        src={item.avatar}
        gold={gold}
        blue={blue}
        orange={oBadge}
        yellow={yBadge}
        crown={crown}
      />
      <span>
        <strong className={orange ? "weibo-name-orange" : undefined}>
          {item.sender}
          {gold && <NameBadges />}
          {blue && !plainBlue && <StudioBadges withSuper={withSuper} />}
          {(stCrown || stRole || stTag || stLevel) && (
            <StNameBadges role={stRole} tag={stTag} level={stLevel} />
          )}
        </strong>
        <small className="weibo-author-sub">
          {(() => {
            const hotTag = meta(item, "hotTag");
            const base = hotTag
              ? `${date} ${hotTag}`
              : source
                ? `${date} 来自 ${source}`
                : date;
            return edited ? `${base} 已编辑` : base;
          })()}
        </small>
      </span>
      {!hideChevron && (
        <ChevronDown size={16} className="weibo-author-chevron" />
      )}
    </button>
  );
}
function WeiboActions({
  p,
  item,
  hideRepost = false,
}: {
  p: Props;
  item: Item;
  hideRepost?: boolean;
}) {
  const [liked, setLiked] = useSkinState<boolean>(p, `liked-${item.id}`, false);
  return (
    <div className="social-actions weibo-actions">
      {!hideRepost && (
        <button aria-label={`转发${item.title}`} onClick={() => p.onItem(item)}>
          <Share2 size={17} />
          {meta(item, "reposts", "转发")}
        </button>
      )}
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
type ViewerState = { item: Item; index: number } | null;
function WeiboPostCard({
  p,
  item,
  setViewer,
}: {
  p: Props;
  item: Item;
  setViewer: (v: ViewerState) => void;
}) {
  const fansOnly = meta(item, "fansOnly") === "true";
  return (
    <article className="weibo-post">
      {fansOnly && <WeiboFansOnly chevron />}
      <PostHeader p={p} item={item} hideChevron={fansOnly} />
      <button className="social-body" onClick={() => p.onItem(item)}>
        <Foldable text={item.body} maxLines={6} />
        {(item.media || item.mediaList.length > 0 || item.meta.video) && (
          <Media
            item={item}
            onMore={
              item.mediaList.length > 9 ? () => p.onItem(item) : undefined
            }
            onImage={(index) => setViewer({ item, index })}
          />
        )}
        {meta(item, "hotIndex") && (
          <span className="weibo-hot-pill">
            <b>热文</b>热文指数{meta(item, "hotIndex")}
          </span>
        )}
      </button>
      <WeiboActions p={p} item={item} hideRepost={fansOnly} />
    </article>
  );
}
const ST_TABS = ["热门", "最新", "名人动态", "超友趣", "星动纪念册"];
/** 两个应援账号：博文只出现在关注流，不进发现/超话 */
const FAN_SENDERS = ["陳立農工作室", "陈立农NEWS合作社"];
/** 发现页热搜词条：高迪/虞书欣相关已替换为陈立农相关（对照截图 1:1，不可交互） */
const DISCOVER_HOT: [string, string][] = [
  ["深圳机场一眼望去...", ""],
  ["腾讯三季度自由现金...", "新"],
  ["日媒对比日韩领导人...", "新"],
  ["特朗普抵达深圳...", "新"],
  ["韩国网友科普中国...", ""],
  ["被AI替掉的人怎么办", "荐"],
  ["DeepSeek饭圈化遭吐槽", ""],
  ["陈立农录制综艺路透", ""],
  ["陈立农11月行程公开", ""],
  ["内娱下星二代了", ""],
  ["陈立农晒排练花絮", "娱"],
];
function DiscoverPage({
  p,
  items,
  setViewer,
}: {
  p: Props;
  items: Item[];
  setViewer: (v: ViewerState) => void;
}) {
  const hotItems = items.filter((i) => meta(i, "discoverOnly") === "true");
  return (
    <div className="weibo-discover">
      <div className="weibo-ds-search">
        <span className="weibo-ds-search-txt">
          猜你想搜：两岸民歌经典...
        </span>
        <Camera size={19} className="weibo-ds-cam" />
        <span className="weibo-ds-btn">搜索</span>
      </div>
      <div className="weibo-ds-hot">
        <div className="weibo-ds-hot-head">
          <span className="weibo-ds-hot-logo">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle
                cx="10.5"
                cy="10.5"
                r="6.2"
                fill="none"
                stroke="url(#dsHotG)"
                strokeWidth="2.6"
              />
              <path
                d="M15.4 15.4 L21 21"
                stroke="url(#dsHotG)"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                d="M11.5 6.2 L8.6 11 h2.6 l-1.8 4.6 4.6 -5.6 h-2.8 Z"
                fill="#ffb01f"
              />
              <defs>
                <linearGradient id="dsHotG" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ff4f6d" />
                  <stop offset="1" stopColor="#ff7d1f" />
                </linearGradient>
              </defs>
            </svg>
            微博热搜
          </span>
          <span className="weibo-ds-ai">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="#ff7d1f" />
              <circle cx="9" cy="10.4" r="1.5" fill="#fff" />
              <circle cx="15" cy="10.4" r="1.5" fill="#fff" />
              <path
                d="M8.6 14.6 Q12 17.6 15.4 14.6"
                fill="none"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            问智搜 ›
          </span>
        </div>
        <div className="weibo-ds-hot-grid">
          {DISCOVER_HOT.map(([t, badge], i) => (
            <span className="weibo-ds-hot-item" key={i}>
              <span className="weibo-ds-hot-txt">{t}</span>
              {badge && (
                <i className={"weibo-ds-hot-badge b-" + badge}>{badge}</i>
              )}
            </span>
          ))}
          <span className="weibo-ds-hot-item weibo-ds-hot-more">
            更多热搜 ›
          </span>
        </div>
      </div>
      <div className="weibo-ds-banner">
        <span className="weibo-ds-ad-tag">广告</span>
        <div className="weibo-ds-ad-stage" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i /><i />
        </div>
        <div className="weibo-ds-ad-right">
          <p className="weibo-ds-ad-year">2026 微博竞燃之夜</p>
          <p className="weibo-ds-ad-title">竞燃盛典倒计时1天</p>
          <p className="weibo-ds-ad-sub">✦ 立即预约直播 共赴荣誉之约 ✦</p>
          <span className="weibo-ds-ad-btn">立即预约&gt;&gt;</span>
        </div>
        <span className="weibo-ds-dots">
          <i className="on" />
          <i />
          <i />
        </span>
      </div>
      <div className="weibo-ds-tabs">
        <span className="on">热点</span>
        <span>封面</span>
        <span>星品</span>
        <span className="weibo-ds-vtab">
          <i>V</i>发布
        </span>
        <span>热转</span>
        <svg className="weibo-ds-menu" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {hotItems.map((i) => (
        <WeiboPostCard key={i.id} p={p} item={i} setViewer={setViewer} />
      ))}
      {!hotItems.length && <Empty items={hotItems} />}
    </div>
  );
}
/** 超话「帖子」页：点击置顶后进入（对照图3） */
function StPostsPage({
  p,
  items,
  onClose,
  setViewer,
}: {
  p: Props;
  items: Item[];
  onClose: () => void;
  setViewer: (v: ViewerState) => void;
}) {
  const list = [...items].sort(
    (a, b) => +(meta(a, "stOrder") || 99) - +(meta(b, "stOrder") || 99),
  );
  const barIcon = (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#4d7fd6" />
      <path
        d="M10 4.6 L11.6 8.1 L15.4 8.5 L12.6 11 L13.4 14.7 L10 12.8 L6.6 14.7 L7.4 11 L4.6 8.5 L8.4 8.1 Z"
        fill="#fff"
      />
    </svg>
  );
  return (
    <div className="st-posts-page">
      <header className="st-posts-bar">
        <button aria-label="返回" onClick={onClose}>
          <ChevronLeft size={22} />
        </button>
        <span>帖子</span>
        <span className="st-posts-bar-spacer" />
      </header>
      <div className="catalog-scroll">
        <div className="st-creator-bar">
          {barIcon}
          <span>创作官热门帖&gt;&gt;</span>
          <ChevronDown size={16} className="st-creator-chev" />
        </div>
        {list.map((i) => (
          <Fragment key={i.id}>
            {meta(i, "stPrecious") === "true" && (
              <div className="st-creator-bar precious">
                {barIcon}
                <span>精华|创作官热门帖&gt;&gt;</span>
                <em className="st-gongyi">☀️人人公益</em>
                <ChevronDown size={16} className="st-creator-chev" />
              </div>
            )}
            <WeiboPostCard p={p} item={i} setViewer={setViewer} />
          </Fragment>
        ))}
        <Empty items={list} />
      </div>
    </div>
  );
}
function SuperTopicPage({
  p,
  items,
  postsItems,
  onClose,
}: {
  p: Props;
  items: Item[];
  postsItems: Item[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState("热门");
  const [signed, setSigned] = useSkinState<boolean>(p, "st-signed2", false);
  const [viewer, setViewer] = useState<ViewerState>(null);
  // 点击置顶进入「帖子」页（对照图3）
  const [postsOpen, setPostsOpen] = useState(false);
  const list =
    tab === "热门"
      ? [...items].sort((a, b) => b.likes - a.likes)
      : tab === "最新"
        ? items
        : tab === "名人动态"
          ? items.filter((i) => i.sender === p.owner)
          : [];
  const cover = "images/st-cover.jpg";
  return (
    <>
      {postsOpen ? (
        <StPostsPage
          p={p}
          items={postsItems}
          onClose={() => setPostsOpen(false)}
          setViewer={setViewer}
        />
      ) : (
        <>
          <div
            className="st-hero"
            style={cover ? { backgroundImage: `url(${cover})` } : undefined}
          >
        <div className="st-hero-bar">
          <button aria-label="返回" onClick={onClose}>
            <ChevronLeft size={22} />
          </button>
          <span className="st-spacer" />
          <button aria-label="搜索">
            <Search size={20} />
          </button>
          <button aria-label="分享">
            <Share2 size={20} />
          </button>
        </div>
        <div className="st-hero-head">
          <img
            className="st-ava"
            src="images/st-avatar.jpg"
            alt="超话头像"
            draggable={false}
          />
          <div className="st-hero-info">
            <h2>
              {p.owner ?? "我"}
              <span className="st-gold">🏆金超</span>
            </h2>
            <p>
              <b>460万</b> 帖子
              <b>534万</b> 农糖
              <ChevronRight size={13} className="st-chev" />
            </p>
          </div>
          <span className="st-streak-wrap">
            <button
              className={"st-streak-ico" + (signed ? " done" : "")}
              aria-pressed={signed}
              aria-label="签到"
              onClick={() => setSigned(!signed)}
            >
              <CalendarCheck size={17} />
            </button>
            <small>{signed ? "连签1天" : "连签0天"}</small>
          </span>
        </div>
        <div className="st-hero-chips">
          <span>明星超话</span>
          <span>{signed ? "2.4" : "2.3"}万人</span>
        </div>
        <button className="st-expand">
          展开查看更多
          <ChevronDown size={13} />
        </button>
      </div>
      <div className="st-tabs">
        {ST_TABS.map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <button className="st-pin" onClick={() => setPostsOpen(true)}>
        <b>置顶</b>
        <span className="st-pin-text">❤️#陈立农# …</span>
      </button>
      <div className="catalog-scroll">
        {list.map((i) => (
          <WeiboPostCard key={i.id} p={p} item={i} setViewer={setViewer} />
        ))}
        <Empty items={list} />
      </div>
      <div className="st-bottom">
        <span className="st-input">我来发一帖</span>
        <span className="st-bottom-item">
          <Users size={17} />
          <small>群聊</small>
        </span>
        <span className="st-bottom-item">
          <User size={17} />
          <small>
            我的<em>LV14</em>
          </small>
        </span>
      </div>
        </>
      )}
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
    </>
  );
}
export function WeiboSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "关注");  const [feed, setFeed] = useState("全部");
  const [viewer, setViewer] = useState<{ item: Item; index: number } | null>(
    null,
  );
  // 年份筛选 + 时间正/倒序（默认"最新在前"，即数据本来的倒序）
  const [year, setYear] = useState("全部");
  const [asc, setAsc] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  // 「那年今天」：查看往年同月同日的动态
  const [todayMode, setTodayMode] = useState(false);
  // 超话页
  const [stOpen, setStOpen] = useState(false);
  const ownerItems = items.filter((i) => i.sender === p.owner);
  const otherItems = items.filter((i) => i.sender !== p.owner);
  const now = new Date();
  const todayMd = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const curYear = String(now.getFullYear());
  const todayPosts = ownerItems.filter(
    (i) => i.time.slice(5, 10) === todayMd && i.time.slice(0, 4) !== curYear,
  );
  const years = [...new Set(ownerItems.map((i) => i.time.slice(0, 4)))]
    .sort()
    .reverse();
  // 超话页热门/最新：不展示工作室/NEWS合作社/本人的博文/发现专属/帖子页专属
  const stItems = items.filter(
    (i) =>
      i.sender !== p.owner &&
      !FAN_SENDERS.includes(i.sender) &&
      meta(i, "discoverOnly") !== "true" &&
      meta(i, "stPostsOnly") !== "true",
  );
  // 超话「帖子」页（置顶点进去）：5 条粉丝站博文
  const stPostItems = items.filter((i) => meta(i, "stPostsOnly") === "true");
  // 关注：只显示他人的博文（本人动态只在「我」页出现，发现页专属博文不进关注）
  const fanBase = otherItems.filter(
    (i) =>
      meta(i, "discoverOnly") !== "true" &&
      meta(i, "stPostsOnly") !== "true" &&
      meta(i, "stHotOnly") !== "true",
  );
  const base = feed === "全部" ? fanBase : fanBase.filter((i) => i.folder === feed);
  const matched = todayMode
    ? todayPosts
    : year === "全部"
      ? base
      : base.filter((i) => i.time.startsWith(year));
  const list = asc ? [...matched].reverse() : matched;
  // 「我」页的列表与计数只统计本人博文
  const ownerMatched = todayMode
    ? todayPosts
    : year === "全部"
      ? ownerItems
      : ownerItems.filter((i) => i.time.startsWith(year));
  const ownerList = asc ? [...ownerMatched].reverse() : ownerMatched;
  return (
    <div className="catalog-skin weibo-ui">
      {stOpen ? (
        <SuperTopicPage
          p={p}
          items={stItems}
          postsItems={stPostItems}
          onClose={() => setStOpen(false)}
        />
      ) : (
        <>
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
              // 「我」页资料卡元数据固定取本人博文（列表排序后 items[0] 不一定是本人）
              (() => {
                const ownerBase =
                  items.find((i) => i.sender === p.owner) ?? items[0];
                return (
                  <div className="weibo-profile">
                    {meta(ownerBase, "profileCover") && (
                      <div
                        className="weibo-profile-cover"
                        style={{
                          backgroundImage: `url(${meta(ownerBase, "profileCover")})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <div className="weibo-cover-bar">
                          <span className="weibo-cover-spacer" />
                          <button aria-label="拍摄">
                            <Camera size={19} />
                          </button>
                          <button aria-label="搜索">
                            <Search size={19} />
                          </button>
                          <button aria-label="更多">
                            <MoreHorizontal size={19} />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="weibo-profile-card">
                      <div className="weibo-profile-head">
                        <VAvatar
                          name={p.owner ?? "我"}
                          src={ownerBase?.avatar}
                          gold
                        />
                        <h2>
                          {p.owner ?? "我"}
                          <NameBadges />
                        </h2>
                      </div>
                      <div className="weibo-profile-stats">
                        <span>
                          <b>{meta(ownerBase, "profileFans")}</b> 粉丝
                        </span>
                        <span>
                          <b>{meta(ownerBase, "profileFollowing")}</b> 关注
                        </span>
                        <span>
                          <b>{meta(ownerBase, "profileInteractions")}</b> 转评赞
                        </span>
                      </div>
                  <div className="weibo-profile-tags">
                    <span>昨日阅读人数10万+</span>
                    <span>本月互动人数100万</span>
                    <ChevronDown size={16} className="weibo-tags-more" />
                  </div>
                  <div className="weibo-profile-verify">
                    <ShieldCheck size={14} />
                    歌手 演员 NINE PERCENT 成员 传奇星艺人
                  </div>
                  <div className="weibo-profile-cards">
                    <button
                      className="weibo-mini-card"
                      onClick={() => setStOpen(true)}
                    >
                      <div>
                        <div className="weibo-mini-title">
                          <Diamond size={15} />
                          超话
                        </div>
                        <p>533.5万农糖</p>
                      </div>
                      {ownerBase?.avatar && (
                        <img
                          className="weibo-mini-thumb"
                          src="images/st-avatar.jpg"
                          alt=""
                        />
                      )}
                    </button>
                    <div className="weibo-mini-card">
                      <div>
                        <div className="weibo-mini-title">
                          <Users size={15} />
                          粉丝群
                        </div>
                        <p>25个群聊</p>
                      </div>
                    </div>
                  </div>
                  <span className="weibo-profile-count">
                    {items.length} 条微博
                  </span>
                    </div>
                  </div>
                );
              })()
            ) : tab === "发现" ? (
              <DiscoverPage p={p} items={items} setViewer={setViewer} />
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
          <div className="weibo-filter-sticky">
            <div className="weibo-count-bar">
              <span>
                {todayMode
                  ? `那年今天(${ownerList.length})`
                  : `全部微博(${ownerList.length})`}
              </span>
              <button
                className={filterOpen ? "selected" : ""}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <ListFilter size={15} aria-hidden="true" />
                筛选
              </button>
            </div>
            {filterOpen && !todayMode && (
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
              <img
                className="weibo-td-art"
                src="images/nianianjintian.jpg"
                alt="那年今天：那年的你在今天有什么动态"
                draggable={false}
              />
            </button>
            <div className="weibo-manage-row">
              <span>管理定时发博</span>
              <span>草稿箱(99+)</span>
            </div>
          </>
        )}
        {tab !== "发现" &&
          (tab === "我" ? ownerList : list).map((i) => (
            <WeiboPostCard key={i.id} p={p} item={i} setViewer={setViewer} />
          ))}
        {tab !== "发现" && <Empty items={tab === "我" ? ownerList : list} />}
      </div>
          </>
        )}
      {viewer && !stOpen && (
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
