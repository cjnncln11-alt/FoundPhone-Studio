import { AudioPlayer, useTrack } from "../audio";
import { useSkinState } from "../skinState";
import {
  AtSign,
  Bookmark,
  Check,
  ChevronLeft,
  Clock,
  Compass,
  Heart,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  Maximize2,
  MessageCircle,
  MonitorPlay,
  Music,
  Play,
  Plus,
  Search,
  Share2,
  ShoppingBag,
  SkipForward,
  Smile,
  ThumbsDown,
  User,
  Users,
  Video,
  Wallet,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type UIEvent as ReactUIEvent,
} from "react";
import { safeMedia, type Item } from "../schema";
import { PausingVideo } from "./shared";
import {
  Avatar,
  Empty,
  groupItems,
  Header,
  Media,
  meta,
  SearchBox,
  Tabs,
  useContent,
  type Props,
} from "./shared";
/** 图集原声 BGM：进场自动播，滑走自动停；被自动播放拦截时等任意手势恢复 */
function PhotoBgm({
  src,
  stage,
}: {
  src: string;
  stage: RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    const st = stage.current;
    if (!el || !st || typeof IntersectionObserver === "undefined") return;
    const tryPlay = () => {
      void el.play().catch(() => {});
    };
    tryPlay();
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.intersectionRatio < 0.2) el.pause();
          else if (en.intersectionRatio >= 0.5 && el.paused) tryPlay();
        }
      },
      { threshold: [0, 0.2, 0.5, 1] },
    );
    io.observe(st);
    // 无手势时浏览器拦截带声自动播放：任意点击后恢复
    const resume = () => {
      if (el.paused) tryPlay();
    };
    document.addEventListener("pointerdown", resume, true);
    document.addEventListener("touchstart", resume, true);
    return () => {
      io.disconnect();
      document.removeEventListener("pointerdown", resume, true);
      document.removeEventListener("touchstart", resume, true);
      el.pause();
    };
  }, [src, stage]);
  return <audio ref={ref} src={src} loop preload="auto" />;
}

/** 信息流强制一次手势只翻一个作品（抖音式翻页：触摸 + 滚轮） */
function useFeedPager(
  ref: RefObject<HTMLDivElement | null>,
  active: boolean,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    let startY = 0;
    let startX = 0;
    let startTop = 0;
    let moved = false;
    let locked = false;
    let wheelLock = false;
    let timer: number | null = null;
    const finish = () => {
      el.style.scrollSnapType = "";
      locked = false;
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
      el.removeEventListener("scrollend", finish);
    };
    const flip = (target: number) => {
      locked = true;
      el.style.scrollSnapType = "none";
      el.scrollTo({ top: target * el.clientHeight, behavior: "smooth" });
      el.addEventListener("scrollend", finish);
      // scrollend 兼容兜底
      timer = window.setTimeout(finish, 700);
    };
    const pageIndex = () =>
      Math.max(0, Math.round((el.scrollHeight - el.clientHeight) / el.clientHeight));
    const onStart = (e: TouchEvent) => {
      if (locked) return;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      startTop = el.scrollTop;
      moved = false;
    };
    const onMove = (e: TouchEvent) => {
      if (locked) {
        e.preventDefault();
        return;
      }
      if (moved) return;
      const y = e.touches[0].clientY;
      const dy = startY - y;
      const dx = e.touches[0].clientX - startX;
      // 横向滑动（图集翻照片）交给原生横滑
      if (Math.abs(dx) > Math.abs(dy)) return;
      if (Math.abs(dy) > 45) {
        moved = true;
        e.preventDefault();
        const idx = Math.round(startTop / el.clientHeight);
        const target = Math.max(0, Math.min(pageIndex(), dy > 0 ? idx + 1 : idx - 1));
        if (target !== idx) flip(target);
        else finish();
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 4) return;
      e.preventDefault();
      if (locked || wheelLock) return;
      wheelLock = true;
      window.setTimeout(() => {
        wheelLock = false;
      }, 450);
      const idx = Math.round(el.scrollTop / el.clientHeight);
      const target = Math.max(
        0,
        Math.min(pageIndex(), e.deltaY > 0 ? idx + 1 : idx - 1),
      );
      if (target !== idx) flip(target);
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("wheel", onWheel);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [ref, active]);
}

/** 互动数格式化：过万显示 x.x万 */
const fmtCount = (n: number) =>
  n >= 10000 ? `${(n / 10000).toFixed(1)}万` : `${n}`;

/** 抖音「我」页：资料卡 + 作品九宫格（板块对照真实抖音个人主页） */
function DouyinMe({
  items,
  onOpen,
}: {
  items: Item[];
  onOpen: (index: number) => void;
}) {
  const [sub, setSub] = useState("作品");
  const shown = sub === "作品" ? items : [];
  const tools = [
    { icon: <MonitorPlay size={22} />, label: "主播中心" },
    { icon: <ShoppingBag size={22} />, label: "我的订单" },
    { icon: <Clock size={22} />, label: "观看历史" },
    { icon: <Wallet size={22} />, label: "我的钱包" },
    { icon: <LayoutGrid size={22} />, label: "全部功能" },
  ];
  return (
    <div className="dy-me">
      <div className="dy-me-head">
        <div className="dy-me-id">
          <img
            className="dy-me-avatar"
            src="/images/douyin/avatar-cln.jpg"
            alt="陈立农"
          />
          <div className="dy-me-names">
            <h2>陈立农</h2>
            <small>抖音号：123822946</small>
          </div>
        </div>
        <div className="dy-me-stats">
          <div>
            <b>8826.6万</b>
            <span>获赞</span>
          </div>
          <div>
            <b>5</b>
            <span>关注</span>
          </div>
          <div>
            <b>469.3万</b>
            <span>粉丝</span>
          </div>
          <button className="dy-me-edit" type="button">
            编辑主页
          </button>
        </div>
        <p className="dy-me-bio">传奇星娱乐艺人 歌手演员</p>
        <div className="dy-me-tools">
          {tools.map((t) => (
            <div key={t.label}>
              {t.icon}
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="dy-me-tabs">
        {["作品", "日常", "收藏", "喜欢"].map((t) => (
          <button
            key={t}
            className={sub === t ? "selected" : ""}
            onClick={() => setSub(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="dy-me-grid">
        {shown.map((i, n) => (
          <button
            key={i.id}
            className="dy-me-cell"
            onClick={() => onOpen(n)}
            aria-label={`播放${i.body || i.title}`}
          >
            <img src={meta(i, "videoCover")} alt="" loading="lazy" />
            {meta(i, "pinned") === "1" && (
              <span className="dy-me-pin">置顶</span>
            )}
            <span className="dy-me-plays">
              <Play size={11} />
              {fmtCount(i.likes)}
            </span>
          </button>
        ))}
        {sub !== "作品" && <Empty items={[]} />}
      </div>
    </div>
  );
}

function TrackPlayer({  item,
  p,
  onNext,
}: {
  item: Item;
  p: Props;
  onNext: () => void;
}) {
  return (
    <div className="track-player">
      <button onClick={() => p.onItem(item)}>
        <Music size={20} />
        <span>
          {item.title}
          <small>{item.sender}</small>
        </span>
      </button>
      {item.kind === "audio" && safeMedia(item.media) ? (
        <AudioPlayer p={p} item={item} />
      ) : (
        <button onClick={() => p.onItem(item)}>查看</button>
      )}
      <button aria-label="下一首" onClick={onNext}>
        <SkipForward size={19} />
      </button>
    </div>
  );
}
export function SpotifySkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [playlist, setPlaylist] = useState(""),
    [track, setTrack] = useTrack(p, items);
  const list = playlist
    ? items.filter((i) => (i.folder || "我的音乐") === playlist)
    : items;
  return (
    <div className="catalog-skin spotify-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        <div className="spotify-heading">
          <Avatar name={p.owner ?? "我"} />
          <button
            className={tab === "首页" ? "selected" : ""}
            onClick={() => setTab("首页")}
          >
            音乐
          </button>
          <button
            className={tab === "音乐库" ? "selected" : ""}
            onClick={() => setTab("音乐库")}
          >
            音乐库
          </button>
        </div>
        {tab === "搜索" && <SearchBox value={q} set={setQ} />}
        <h1>{playlist || (tab === "音乐库" ? "音乐库" : "为你收藏")}</h1>
        {!playlist && (
          <div className="spotify-playlists">
            {groupItems(items, "我的音乐").map((g) => (
              <button key={g} onClick={() => setPlaylist(g)}>
                <Music size={29} />
                <strong>{g}</strong>
              </button>
            ))}
          </div>
        )}
        {playlist && (
          <button className="playlist-back" onClick={() => setPlaylist("")}>
            返回全部音乐
          </button>
        )}
        <div className="spotify-tracks">
          {list.map((i, n) => (
            <button
              key={i.id}
              onClick={() => {
                setTrack(i);
              }}
            >
              <span>{n + 1}</span>
              <div>
                <strong>{i.title}</strong>
                <small>
                  {i.sender} · {meta(i, "album")}
                </small>
              </div>
              <small>{meta(i, "duration")}</small>
            </button>
          ))}
        </div>
        <Empty items={list} />
      </div>
      {track && (
        <TrackPlayer
          item={track}
          p={p}
          onNext={() =>
            setTrack(
              items[
                (items.findIndex((i) => i.id === track.id) + 1) % items.length
              ],
            )
          }
        />
      )}
      <Tabs
        tabs={["首页", "搜索", "音乐库"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setPlaylist("");
        }}
        icons={[<Home />, <Search />, <Music />]}
      />
    </div>
  );
}
export function NeteaseSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "发现");
  const [folder, setFolder] = useState(""),
    [track, setTrack] = useTrack(p, items);
  const list = folder
    ? items.filter((i) => (i.folder || "我的歌单") === folder)
    : items;
  return (
    <div className="catalog-skin netease-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {tab === "发现" ? (
          <>
            <div className="netease-feature">
              <Music size={44} />
              <h2>推荐歌单</h2>
            </div>
            <div className="netease-shelves">
              {groupItems(items, "我的歌单").map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setFolder(g);
                    setTab("我的");
                  }}
                >
                  <Music size={33} />
                  <strong>{g}</strong>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="netease-profile">
              <Avatar name={p.owner ?? "我"} />
              <h2>{p.owner ?? "我的音乐"}</h2>
            </div>
            <h3>{folder || "我的歌单"}</h3>
          </>
        )}
        {list.map((i, n) => (
          <div className="netease-track" key={i.id}>
            <button
              onClick={() => {
                setTrack(i);
              }}
            >
              <span>{n + 1}</span>
              <div>
                <strong>{i.title}</strong>
                <small>
                  {i.sender} · {meta(i, "album")}
                </small>
              </div>
            </button>
            <button
              aria-label={`歌曲详情${i.title}`}
              onClick={() => p.onItem(i)}
            >
              <MessageCircle size={18} />
            </button>
          </div>
        ))}
        <Empty items={list} />
      </div>
      {track && (
        <TrackPlayer
          item={track}
          p={p}
          onNext={() =>
            setTrack(
              items[
                (items.findIndex((i) => i.id === track.id) + 1) % items.length
              ],
            )
          }
        />
      )}
      <Tabs
        tabs={["发现", "我的"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setFolder("");
        }}
        icons={[<Compass />, <Music />]}
      />
    </div>
  );
}
export function YouTubeSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [category, setCategory] = useState("全部");
  const list = items.filter((i) =>
    tab === "Shorts"
      ? i.folder === "Shorts"
      : tab === "订阅"
        ? i.folder === "订阅"
        : tab === "播放列表"
          ? i.favorite || i.folder === "播放列表"
          : category === "全部" || i.folder === category,
  );
  return (
    <div className="catalog-skin youtube-ui">
      <Header p={p} />
      <SearchBox value={q} set={setQ} />
      <div className="youtube-chips">
        {["全部", ...groupItems(items).filter((g) => g !== "未分类")].map(
          (g) => (
            <button
              className={category === g ? "selected" : ""}
              key={g}
              onClick={() => setCategory(g)}
            >
              {g}
            </button>
          ),
        )}
      </div>
      <div className="catalog-scroll">
        <div className={tab === "Shorts" ? "youtube-shorts" : "youtube-videos"}>
          {list.map((i) => (
            <article key={i.id}>
              <button className="youtube-thumb" onClick={() => p.onItem(i)}>
                <Media item={i} />
                {meta(i, "duration") && <time>{meta(i, "duration")}</time>}
              </button>
              <button className="youtube-byline" onClick={() => p.onItem(i)}>
                <Avatar name={i.sender} />
                <div>
                  <strong>{i.title}</strong>
                  <small>
                    {i.sender} · {meta(i, "views", "—")} 次播放
                  </small>
                </div>
              </button>
            </article>
          ))}
        </div>
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["首页", "Shorts", "订阅", "播放列表"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Video />, <Users />, <User />]}
      />
    </div>
  );
}
export function BilibiliSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [category, setCategory] = useState("推荐");
  const list =
    tab === "历史"
      ? items.filter((i) => i.folder === "历史")
      : tab === "动态"
        ? items.filter((i) => i.folder === "动态")
        : category === "推荐"
          ? items
          : items.filter((i) => i.folder === category);
  return (
    <div className="catalog-skin bilibili-ui">
      <Header p={p} />
      <div className="bili-search">
        <Avatar name={p.owner ?? "我"} />
        <SearchBox value={q} set={setQ} />
      </div>
      <div className="bili-categories">
        {["推荐", "动画", "音乐", "生活"].map((c) => (
          <button
            key={c}
            className={category === c ? "selected" : ""}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="catalog-scroll">
        <div className="bili-grid">
          {list.map((i) => (
            <button key={i.id} onClick={() => p.onItem(i)}>
              <div>
                <Media item={i} />
                <small>
                  <Play size={10} />
                  {meta(i, "views", "—")}
                  <time>{meta(i, "duration")}</time>
                </small>
              </div>
              <strong>{i.title}</strong>
              <span>UP · {i.sender}</span>
            </button>
          ))}
        </div>
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["首页", "动态", "历史"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <MessageCircle />, <User />]}
      />
    </div>
  );
}
function VerticalVideo({
  p,
  item,
  onComments,
}: {
  p: Props;
  item: Item;
  onComments?: (item: Item) => void;
}) {
  const [liked, setLiked] = useSkinState<boolean>(p, `liked-${item.id}`, false),
    [saved, setSaved] = useSkinState<boolean>(p, `saved-${item.id}`, false);
  // 图集（抖音图文帖）：全屏照片 + 左右滑动 + 圆点指示，双击同样可点赞
  const [dot, setDot] = useState(0);
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null);
  const tapRef = useRef<{ t: number } | null>(null);
  const burstTimer = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  useEffect(
    () => () => {
      if (burstTimer.current) window.clearTimeout(burstTimer.current);
    },
    [],
  );
  const fmt = (n: number) =>
    n >= 10000 ? `${(n / 10000).toFixed(1)}万` : `${n}`;
  const cCount = Number(meta(item, "commentsCount")) || item.comments.length;
  const sCount = Number(meta(item, "sharesCount"));
  const fCount = Number(meta(item, "collectCount"));
  // 竖屏流视频：HLS 循环自动播放，滑走即停（PausingVideo 的可视区检测）
  const vSrc = safeMedia(item.meta?.video ?? "");
  const vCover = safeMedia(item.meta?.videoCover ?? "");
  const photos: string[] = vSrc ? [] : item.mediaList;
  const musicSrc = safeMedia(item.meta?.audio ?? "");
  /** 图集双击点赞（与视频一致的 320ms 判定窗口） */
  const onPhotoTap = (e: ReactPointerEvent<HTMLDivElement>) => {
    const now = Date.now();
    const prev = tapRef.current;
    tapRef.current = { t: now };
    if (!prev || now - prev.t > 320) return;
    tapRef.current = null;
    e.preventDefault();
    setLiked(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setBurst({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (burstTimer.current) window.clearTimeout(burstTimer.current);
    burstTimer.current = window.setTimeout(() => setBurst(null), 850);
  };
  const onTrackScroll = (e: ReactUIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setDot(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  };
  return (
    <article className="vertical-video">
      {vSrc ? (
        <PausingVideo
          src={vSrc}
          loop
          autoPlay
          autoStart
          playsInline
          controls={false}
          preload="metadata"
          poster={vCover || undefined}
          // 抖音交互：单击暂停/继续，双击点赞（红心）
          tapToggle
          onDoubleTap={() => setLiked(true)}
        />
      ) : photos.length ? (
        <div className="dy-photo-stage" ref={stageRef} onPointerUp={onPhotoTap}>
          {musicSrc && <PhotoBgm src={musicSrc} stage={stageRef} />}
          <div className="dy-photo-track" onScroll={onTrackScroll}>
            {photos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${item.title} ${i + 1}`}
                draggable={false}
              />
            ))}
          </div>
          {photos.length > 1 && (
            <>
              <span className="dy-photo-hint" aria-hidden="true">
                左右滑动查看照片
              </span>
              <div className="dy-photo-dots" aria-hidden="true">
                {photos.map((_, i) => (
                  <i key={i} className={i === dot ? "on" : ""} />
                ))}
              </div>
            </>
          )}
          {burst && (
            <span
              className="dy-like-burst"
              style={{ left: burst.x, top: burst.y }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" width="86" height="86" aria-hidden="true">
                <path
                  d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                  fill="#fe2c55"
                  stroke="#fe2c55"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>
      ) : (
        <Media item={item} />
      )}
      <span className="dy-play-badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path d="M8 5.5v13l11-6.5z" fill="#fff" />
        </svg>
      </span>
      <div className="vertical-actions">
        {/* 头像无任何交互；下方红色加号为关注按钮样式（对照真实抖音） */}
        <button aria-label={`作者${item.sender}`}>
          <Avatar name={item.sender} src={item.avatar} />
          <span className="dy-follow-plus" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="13" height="13">
              <path
                d="M12 5v14M5 12h14"
                stroke="#fff"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
        </button>
        <button
          aria-label={`喜欢${item.title}`}
          onClick={() => setLiked(!liked)}
        >
          <Heart size={29} fill={liked ? "#f44368" : "white"} />
          <small>{fmt(item.likes + (liked ? 1 : 0))}</small>
        </button>
        <button
          aria-label={`评论${item.title}`}
          onClick={() =>
            onComments ? onComments(item) : p.onItem(item)
          }
        >
          <MessageCircle size={29} />
          <small>{fmt(cCount)}</small>
        </button>
        <button
          aria-label={`收藏${item.title}`}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark size={27} fill={saved ? "#f8cc55" : "none"} />
          <small>{Number.isFinite(fCount) && fCount > 0 ? fmt(fCount) : ""}</small>
        </button>
        <button aria-label={`分享${item.title}`}>
          <Share2 size={26} />
          <small>{Number.isFinite(sCount) && sCount > 0 ? fmt(sCount) : ""}</small>
        </button>
      </div>
      <div className="vertical-caption">
        <strong>@{item.sender}</strong>
        <p>{item.body}</p>
        <small>
          <Music size={11} />
          {item.title}
        </small>
      </div>
    </article>
  );
}
export function DouyinSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "推荐");
  const [cmItem, setCmItem] = useState<Item | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [curIdx, setCurIdx] = useState(0);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  useFeedPager(feedRef, tab !== "我");
  useFeedPager(playerRef, openIdx !== null);
  // 「我的作品」只在个人主页展示，不进推荐/关注信息流
  const list = (
    tab === "推荐" ? items : items.filter((i) => i.folder === tab)
  ).filter((i) => i.folder !== "我的作品");
  const myItems = items.filter((i) => i.folder === "我的作品");
  // 个人主页顺序：置顶在前
  const ordered = [
    ...myItems.filter((i) => meta(i, "pinned") === "1"),
    ...myItems.filter((i) => meta(i, "pinned") !== "1"),
  ];
  // 点开作品后定位到对应位置，之后可上下滑连续刷
  useEffect(() => {
    if (openIdx === null) return;
    const el = playerRef.current;
    if (!el) return;
    const t = window.setTimeout(() => {
      el.scrollTop = openIdx * el.clientHeight;
      setCurIdx(openIdx);
    }, 30);
    return () => window.clearTimeout(t);
  }, [openIdx]);
  return (
    <div className="catalog-skin douyin-ui">
      <Header p={p} />
      {tab !== "我" && (
        <div className="douyin-top">
          {["同城", "关注", "推荐"].map((t) => (
            <button
              className={tab === t ? "selected" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      {tab === "我" ? (
        <DouyinMe items={ordered} onOpen={setOpenIdx} />
      ) : (
        <div className="vertical-feed" ref={feedRef}>
          {list.map((i) => (
            <VerticalVideo
              key={i.id}
              p={p}
              item={i}
              onComments={setCmItem}
            />
          ))}
          <Empty items={list} />
        </div>
      )}
      {openIdx !== null && (
        <div className="dy-me-player">
          <button
            className="dy-me-back"
            aria-label="返回主页"
            onClick={() => setOpenIdx(null)}
          >
            <ChevronLeft size={26} />
          </button>
          <span className="dy-me-count">
            {curIdx + 1} / {ordered.length}
          </span>
          <div
            className="vertical-feed"
            ref={playerRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const n = Math.round(el.scrollTop / Math.max(1, el.clientHeight));
              if (n !== curIdx) setCurIdx(n);
            }}
          >
            {ordered.map((i) => (
              <VerticalVideo key={i.id} p={p} item={i} onComments={setCmItem} />
            ))}
          </div>
        </div>
      )}
      {cmItem && (
        <DouyinComments item={cmItem} onClose={() => setCmItem(null)} />
      )}
      <Tabs
        tabs={["推荐", "关注", "我"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
    </div>
  );
}
/** 抖音评论区：白色抽屉直接覆盖在仍在播放的信息流视频下方（视频不中断） */
function DouyinComments({
  item,
  onClose,
}: {
  item: Item;
  onClose: () => void;
}) {
  const cCount = Number(meta(item, "commentsCount")) || item.comments.length;
  const hotWord =
    (item.body.match(/#([\u4e00-\u9fa5\w]+)/)?.[1] as string | undefined) ??
    item.sender;
  const fallbackTimes = ["刚刚", "2分钟前", "15分钟前", "1小时前", "昨天", "2天前"];
  return (
    <div className="dy-comments">
      {/* 评论以上区域：点击任意位置收起评论（视频不受影响） */}
      <div className="dy-comments-stage" onClick={onClose}>
        <button className="dy-cm-search-btn" aria-label="搜索">
          <Search size={24} />
        </button>
      </div>
      <div className="dy-comments-sheet">
        <div className="dy-cm-search">
          <span>
            大家都在搜：<b>{hotWord}</b>
            <i>🔍</i>
          </span>
          <button aria-label="展开搜索">
            <Maximize2 size={16} />
          </button>
          <button className="dy-cm-close" aria-label="关闭评论" onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <div className="dy-cm-tabs">
          <b>评论 {cCount}</b>
          <span>AI 解析</span>
        </div>
        <div className="dy-cm-list">
          {item.comments.map((c, i) => {
            const sep = c.indexOf("：");
            const name = sep > 0 ? c.slice(0, sep) : `用户${i + 1}`;
            const text = sep > 0 ? c.slice(sep + 1) : c;
            const m = item.commentMeta[i];
            const time = m?.time || fallbackTimes[i % fallbackTimes.length];
            const prov = m?.province || "北京";
            const author = name === item.sender;
            const replies = ((m?.likes ?? (i + 2) * 7) % 190) + 1;
            return (
              <div className="dy-cm-item" key={i}>
                <span className={`dy-cm-avatar${author ? " is-author" : ""}`} />
                <div className="dy-cm-main">
                  <span className="dy-cm-name">
                    {name}
                    {author && <em className="dy-cm-author">作者</em>}
                  </span>
                  <p>{text}</p>
                  {i === 0 && <span className="dy-cm-liked">作者赞过</span>}
                  <div className="dy-cm-meta">
                    <time>
                      {time} · {prov}
                    </time>
                    <i>回复</i>
                    <button className="dy-cm-replies">
                      —— 展开{replies}条回复 <span>⌄</span>
                    </button>
                  </div>
                </div>
                <div className="dy-cm-acts">
                  <button aria-label={`赞评论${i}`}>
                    <Heart size={17} />
                    <small>{m?.likes ?? (i + 1) * 3}</small>
                  </button>
                  <button aria-label={`踩评论${i}`}>
                    <ThumbsDown size={15} />
                  </button>
                </div>
              </div>
            );
          })}
          <div className="dy-cm-end">- THE END -</div>
        </div>
        <div className="dy-cm-input">
          <span>有什么想法，展开说说</span>
          <ImageIcon size={18} />
          <AtSign size={18} />
          <Smile size={18} />
        </div>
      </div>
    </div>
  );
}
export function TikTokSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "For You");
  const feedRef = useRef<HTMLDivElement | null>(null);
  useFeedPager(feedRef, true);
  const list =
    tab === "For You"
      ? items
      : tab === "Following"
        ? items.filter((i) => i.folder === "关注" || i.folder === "Following")
        : items.filter((i) => i.folder === "个人主页");
  return (
    <div className="catalog-skin tiktok-ui">
      <Header p={p} />
      <div className="tiktok-top">
        <button
          className={tab === "Following" ? "selected" : ""}
          onClick={() => setTab("Following")}
        >
          Following
        </button>
        <button
          className={tab === "For You" ? "selected" : ""}
          onClick={() => setTab("For You")}
        >
          For You
        </button>
      </div>
      <div className="vertical-feed" ref={feedRef}>
        {list.map((i) => (
          <VerticalVideo key={i.id} p={p} item={i} />
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["For You", "Following", "Profile"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
    </div>
  );
}
export function NetflixSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [saved, setSaved] = useSkinState<string[]>(p, "saved", []);
  const list =
    tab === "我的片单"
      ? items.filter((i) => i.favorite || saved.includes(i.id))
      : items;
  const featured = list[0];
  return (
    <div className="catalog-skin netflix-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {featured && tab === "首页" && (
          <div className="netflix-feature">
            <Media item={featured} />
            <div>
              <strong>{featured.title}</strong>
              <small>
                {meta(featured, "year")} · {meta(featured, "genre")} ·{" "}
                {meta(featured, "duration")}
              </small>
              <button onClick={() => p.onItem(featured)}>
                <Play size={16} />
                播放 / 详情
              </button>
              <button
                onClick={() =>
                  setSaved(
                    saved.includes(featured.id)
                      ? saved.filter((id) => id !== featured.id)
                      : [...saved, featured.id],
                  )
                }
              >
                {saved.includes(featured.id) ? (
                  <Check size={16} />
                ) : (
                  <Plus size={16} />
                )}
                我的片单
              </button>
            </div>
          </div>
        )}
        {groupItems(list, "影片").map((g) => (
          <section className="netflix-shelf" key={g}>
            <h3>{g}</h3>
            <div>
              {list
                .filter((i) => (i.folder || "影片") === g)
                .map((i) => (
                  <button key={i.id} onClick={() => p.onItem(i)}>
                    <Media item={i} />
                    <strong>{i.title}</strong>
                  </button>
                ))}
            </div>
          </section>
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["首页", "我的片单"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Bookmark />]}
      />
    </div>
  );
}

