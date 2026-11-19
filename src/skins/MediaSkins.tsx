import { AudioPlayer, useTrack } from "../audio";
import { useSkinState } from "../skinState";
import {
  AtSign,
  Bookmark,
  Check,
  Compass,
  Heart,
  Home,
  Image as ImageIcon,
  Maximize2,
  MessageCircle,
  Music,
  Play,
  Plus,
  Search,
  Share2,
  SkipForward,
  Smile,
  ThumbsDown,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
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
function TrackPlayer({
  item,
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
        <div className="dy-photo-stage" onPointerUp={onPhotoTap}>
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
  const list = tab === "推荐" ? items : items.filter((i) => i.folder === tab);
  return (
    <div className="catalog-skin douyin-ui">
      <Header p={p} />
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
      <div className="vertical-feed">
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
      <div className="vertical-feed">
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

