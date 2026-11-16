import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  ChevronLeft,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share,
  Headphones,
  Star,
  Camera,
  Crown,
  Copy,
  Send,
  Home,
  Search,
  Bell,
  Circle,
} from "lucide-react";
import { useSkinState } from "../skinState";
import { RichText } from "../RichText";
import {
  Avatar,
  FanAvatar,
  Media,
  meta,
  NameBadges,
  VAvatar,
  wanCount,
} from "./shared";
import {
  fanNormalTexts,
  fanNotifNames,
  fanNotifTexts,
  ownerLikeStore,
  runtimeCommentStore,
} from "./weiboData";
import { pushWeiboNotif } from "./weiboNotify";
import { ImageViewer } from "./ImageViewer";
import type { Item, UiValue } from "../schema";
import "./social-details.css";
export const socialDetailApps = new Set(["twitter", "weibo"]);
const count = (n: number) =>
  n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, "") + "w" : String(n);
const commentProvinces = [
  "北京",
  "上海",
  "广东",
  "江苏",
  "浙江",
  "四川",
  "湖南",
  "湖北",
  "山东",
  "河南",
  "福建",
  "陕西",
  "重庆",
  "辽宁",
  "云南",
  "广西",
  "安徽",
  "河北",
  "江西",
  "贵州",
  "山西",
  "吉林",
  "黑龙江",
  "内蒙古",
  "甘肃",
  "海南",
];
const hashStr = (s: string) => {
  let a = 5381;
  for (const ch of s) a = ((a * 33) ^ ch.charCodeAt(0)) >>> 0;
  return a;
};
const pad2 = (n: number) => String(n).padStart(2, "0");
export function SocialDetail(p: {
  app: string;
  item: Item;
  back: () => void;
  owner: string;
  ownerAvatar?: string;
  ui?: Record<string, UiValue>;
  onUi?: (key: string, value: UiValue) => void;
}) {
  const { item } = p,
    weibo = p.app === "weibo";
  const [liked, setLiked] = useSkinState<boolean>(p, "liked-" + item.id, false),
    [saved, setSaved] = useSkinState<boolean>(p, "saved-" + item.id, false),
    [followed, setFollowed] = useSkinState<boolean>(
      p,
      "followed-" + item.sender,
      false,
    ),
    [extra, setExtra] = useSkinState<string[]>(p, "replies-" + item.id, []);
  const [tab, setTab] = useState("评论"),
    [draft, setDraft] = useState(""),
    [target, setTarget] = useState(""),
    [menu, setMenu] = useState(false),
    [sort, setSort] = useState(false),
    [copied, setCopied] = useState(false),
    [viewer, setViewer] = useState<number | null>(null),
    [commentMenu, setCommentMenu] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [ownerLikes, setOwnerLikes] = useState<Record<string, number>>(
    () => ({ ...ownerLikeStore }),
  );
  const [runtimeComments, setRuntimeComments] = useState(
    () => [...(runtimeCommentStore[item.id] ?? [])],
  );
  const rcSeq = useRef(0);
  const addRuntimeComment = (name: string, text: string) => {
    const list =
      runtimeCommentStore[item.id] || (runtimeCommentStore[item.id] = []);
    list.push({ id: ++rcSeq.current, name, text });
    if (list.length > 40) list.splice(0, list.length - 40);
    setRuntimeComments([...list]);
  };
  const likeTimers = useRef<number[]>([]);
  const stopLikeStorm = () => {
    likeTimers.current.forEach((t) => clearTimeout(t));
    likeTimers.current = [];
  };
  const bumpOwnerLikes = (seed: string, delta: number) => {
    ownerLikeStore[seed] = (ownerLikeStore[seed] ?? 0) + delta;
    setOwnerLikes({ ...ownerLikeStore });
  };
  // 发布评论/回复后，粉丝陆续点赞：10 秒内冲到 2000+，之后逐渐放缓；
  // 弹窗内容为"赞了你的评论"与求翻牌评论混排
  const startLikeStorm = (
    seed: string,
    preview: string,
    allowBeg: boolean,
  ) => {
    stopLikeStorm();
    ownerLikeStore[seed] = 0;
    setOwnerLikes({ ...ownerLikeStore });
    const startedAt = performance.now();
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    let lastCommentAt = -1000,
      added = 0;
    const rand = (a: number, b: number) =>
      a + Math.floor(Math.random() * (b - a + 1));
    const tick = () => {
      const elapsed = performance.now() - startedAt;
      if (elapsed > 55000) return;
      const name =
        fanNotifNames[Math.floor(Math.random() * fanNotifNames.length)];
      const bump =
        elapsed < 10000
          ? rand(45, 125)
          : elapsed < 22000
            ? rand(25, 60)
            : elapsed < 38000
              ? rand(10, 25)
              : rand(2, 8);
      bumpOwnerLikes(seed, bump);
      // 一半是"赞了你的评论"，另一半是粉丝评论：只有回复别人时才可能出现求翻牌文案
      const isLike = Math.random() < 0.5;
      const text = isLike
        ? "赞了你的评论：" + preview.slice(0, 26)
        : allowBeg && Math.random() < 0.55
          ? pick(fanNotifTexts)
          : pick(fanNormalTexts);
      pushWeiboNotif({ name, text, photos: item.mediaList });
      // 弹窗里的评论同步出现在评论区（节流 + 上限，避免刷爆）
      if (!isLike && elapsed - lastCommentAt > 650 && added < 14) {
        addRuntimeComment(name, text);
        lastCommentAt = elapsed;
        added += 1;
      }
      const gap =
        elapsed < 10000
          ? 300
          : elapsed < 22000
            ? 650 + ((elapsed - 10000) / 12000) * 400
            : elapsed < 38000
              ? 1500 + ((elapsed - 22000) / 16000) * 600
              : 2400 + ((elapsed - 38000) / 17000) * 800;
      likeTimers.current.push(window.setTimeout(tick, gap));
    };
    likeTimers.current.push(window.setTimeout(tick, 500));
  };
  useEffect(() => {
    return () => {
      stopLikeStorm();
    };
  }, []);
  const viewerImages = item.mediaList.length
    ? item.mediaList
    : item.media
      ? [item.media]
      : [];
  const nestedSep = "\u0001";
  const isNestedReply = (c: string) => c.startsWith(nestedSep);
  const parseNestedReply = (c: string) => {
    const [to = "", text = ""] = c.slice(1).split(nestedSep);
    return { to, text };
  };
  const nestedReplies = extra
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => isNestedReply(c))
    .map(({ c, i }) => ({ ...parseNestedReply(c), i }));
  const ownerTopReplies = new Set(extra.filter((c) => !isNestedReply(c)));
  // 粉丝评论中"回复 @某人："开头的也归入楼中楼
  const fanReplyRe = /^回复\s*@(.+?)[：:]/;
  const fanReplyTarget = (c: string) => {
    const split = c.search(/[：:]/),
      hasName = split > 0 && split < 24,
      body = hasName ? c.slice(split + 1) : c;
    return body.match(fanReplyRe)?.[1] || "";
  };
  const fanNestedReplies = item.comments
    .map((c) => ({ c, to: fanReplyTarget(c) }))
    .filter((e) => e.to);
  const fanTopComments = item.comments.filter((c) => !fanReplyTarget(c));
  // 自己发布的评论始终置顶，最新的排第一条
  const ownerTopComments = extra
    .filter((c) => !isNestedReply(c))
    .slice()
    .reverse();
  const runtimeCommentsAsText = [...runtimeComments]
    .reverse()
    .map((r) => r.name + "：" + r.text);
  const comments = [
    ...ownerTopComments,
    ...runtimeCommentsAsText,
    ...fanTopComments,
  ];
  const displayComments = sort
    ? [
        ...ownerTopComments,
        ...runtimeCommentsAsText,
        ...[...fanTopComments].reverse(),
      ]
    : comments;
  const ownerBadge = p.owner ? <NameBadges /> : null;
  // 评论元信息：时间（六成跟随博文发布时间，其余随机）、随机 IP 属地、随机赞数
  const postProvince =
    (meta(item, "location", "") || "中国台湾").replace(/^发布于/, "") ||
    "中国台湾";
  const postClock = item.time.match(
    /(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})/,
  );
  const postDate = postClock
    ? {
        m: +postClock[2],
        d: +postClock[3],
        h: +postClock[4],
        min: +postClock[5],
      }
    : null;
  const commentMeta = (seed: string) => {
    const h = hashStr(item.id + "|" + seed);
    let time = "11-3 19:18";
    if (postDate) {
      if (h % 100 < 60) {
        time = `${postDate.m}-${postDate.d} ${pad2(postDate.h)}:${pad2(postDate.min)}`;
      } else {
        const nextDay = h % 3 === 0;
        const hh = nextDay
          ? 8 + ((h >>> 6) % 14)
          : postDate.h + ((h >>> 6) % (24 - postDate.h));
        const mm = (h >>> 12) % 60;
        time = `${postDate.m}-${postDate.d + (nextDay ? 1 : 0)} ${pad2(hh)}:${pad2(mm)}`;
      }
    }
    return {
      time,
      province: commentProvinces[(h >>> 4) % commentProvinces.length],
    };
  };
  const commentLikes = (index: number | string, seed: string) => {
    const h = hashStr("like|" + item.id + "|" + seed);
    if (typeof index !== "number") return 1 + (h % 60);
    if (index < 5) return 1200 + (h % 8600);
    const base = 960 * Math.pow(0.74, index - 5);
    return Math.max(1, Math.round(base * (0.75 + (h % 50) / 100)));
  };
  const removeExtraAt = (idx: number) => {
    setExtra(extra.filter((_, i) => i !== idx));
    setCommentMenu(null);
  };
  const removeOwnerTop = (idx: number) => {
    const ownerName = p.owner || "机主";
    const target = extra[idx] || "";
    const split = target.search(/[：:]/),
      body = split > 0 ? target.slice(split + 1) : "";
    stopLikeStorm();
    if (body) {
      delete ownerLikeStore[ownerName + "|" + body];
      setOwnerLikes({ ...ownerLikeStore });
    }
    setExtra(
      extra.filter(
        (c, i) =>
          i !== idx &&
          !(isNestedReply(c) && parseNestedReply(c).to === ownerName),
      ),
    );
    setCommentMenu(null);
  };
  const commentRow = (
    name: string,
    body: string,
    isOwner: boolean,
    index: number | string,
    nested: boolean,
    onDelete?: () => void,
  ): ReactElement => {
    const menuKey = "menu-" + String(index);
    const seed = name + "|" + body,
      info = commentMeta(seed),
      metaTime =
        isOwner && postDate
          ? `${postDate.m}-${postDate.d} ${pad2(postDate.h)}:${pad2(postDate.min)}`
          : info.time,
      metaProvince = isOwner ? postProvince : info.province,
      likes = isOwner
        ? (ownerLikes[seed] ?? 0)
        : commentLikes(index, seed);
    return (
      <>        <article
        key={index}
        className={
          "post-detail-comment" + (nested ? " weibo-nested-reply" : "")
        }
      >
        {isOwner ? (
          <Avatar name={name} src={p.ownerAvatar} />
        ) : (
          <FanAvatar name={name} photos={item.mediaList} />
        )}
        <div>
          <strong>
            {name}
            {isOwner && ownerBadge}
          </strong>
          <p>{body}</p>
          <div className="comment-meta-row">
            <span className="comment-meta-info">
              {metaTime} 来自 {metaProvince}
            </span>
            <span className="comment-meta-divider" />
            <div className="post-comment-actions">
              <button
                aria-label={"转发" + name}
                onClick={() => setTarget(name)}
              >
                <Repeat2 size={15} />
              </button>
              <button aria-label={"回复" + name} onClick={() => setTarget(name)}>
                <MessageCircle size={15} />
              </button>
              <button
                aria-label={"喜欢回复" + index}
                onClick={(e) => {
                  e.currentTarget.classList.toggle("liked");
                }}
              >
                <Heart size={15} />
                <span className="comment-like-count">{likes}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="comment-more-wrap">
          {onDelete ? (
            <button
              className="comment-more"
              aria-label={"更多操作" + name}
              aria-expanded={commentMenu === menuKey}
              onClick={(e) => {
                e.stopPropagation();
                setCommentMenu(commentMenu === menuKey ? null : menuKey);
              }}
            >
              <MoreHorizontal size={17} />
            </button>
          ) : (
            <span className="comment-more is-static">
              <MoreHorizontal size={17} />
            </span>
          )}
          {onDelete && commentMenu === menuKey && (
            <div className="comment-delete-menu">
              <button onClick={onDelete}>删除</button>
            </div>
          )}
        </div>
      </article>
      {!nested &&
        tab !== "转发" &&
        nestedReplies
          .filter((r) => r.to === name)
          .map((r) =>
            commentRow(
              p.owner || "机主",
              r.text,
              true,
              "n" + index + "-" + r.i,
              true,
              () => removeExtraAt(r.i),
            ),
          )}
      {!nested &&
        tab !== "转发" &&
        fanNestedReplies
          .map((e, i) => ({ e, i }))
          .filter(({ e }) => e.to === name)
          .map(({ e, i }) => {
            const split = e.c.search(/[：:]/),
              hasName = split > 0 && split < 24,
              fName = hasName ? e.c.slice(0, split) : "用户",
              fBody = hasName ? e.c.slice(split + 1) : e.c;
            return commentRow(fName, fBody, false, "f" + index + "-" + i, true);
          })}
    </>
  );
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.body);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const submit = () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setExtra([
      ...extra,
      target
        ? nestedSep + target + nestedSep + text
        : (p.owner || "机主") + "：" + text,
    ]);
    setDraft("");
    setTarget("");
    setTab("评论");
    startLikeStorm((p.owner || "机主") + "|" + text, text, !!target);
    if (!target)
      window.requestAnimationFrame(() => {
        const box = scrollRef.current,
          first = box?.querySelector(".post-detail-comments");
        if (!box || !first) return;
        const delta =
          first.getBoundingClientRect().top - box.getBoundingClientRect().top;
        box.scrollTo({
          top: Math.max(0, box.scrollTop + delta - 6),
          behavior: "smooth",
        });
      });
  };
  const actions = (
    <div className="post-detail-actions">
      <button aria-label="查看评论" onClick={() => setTab("评论")}>
        <MessageCircle />
        {count(comments.length)}
      </button>
      <button aria-label="查看转发" onClick={() => setTab("转发")}>
        <Repeat2 />
        {meta(item, "reposts", "0")}
      </button>
      <button
        aria-label="喜欢帖子"
        aria-pressed={liked}
        onClick={() => setLiked(!liked)}
      >
        <Heart
          fill={liked ? "#f91880" : "none"}
          color={liked ? "#f91880" : undefined}
        />
        {count(item.likes + (liked ? 1 : 0))}
      </button>
      <button
        aria-label="收藏帖子"
        aria-pressed={saved}
        onClick={() => setSaved(!saved)}
      >
        <Bookmark fill={saved ? "currentColor" : "none"} />
        {saved ? "1" : "0"}
      </button>
      <button aria-label="分享帖子" onClick={() => setMenu(!menu)}>
        <Share />
      </button>
    </div>
  );
  return (
    <div
      className={
        "app-post-detail " +
        (weibo
          ? "weibo-post-detail"
          : "x-post-detail" +
            (p.ui?.["x-dark"] !== false ? " x-reference-dark" : ""))
      }
    >
      {commentMenu && (
        <div
          className="comment-menu-backdrop"
          onClick={() => setCommentMenu(null)}
        />
      )}
      <header className="post-detail-nav">
        <button aria-label="返回帖子列表" onClick={p.back}>
          <ChevronLeft size={27} />
        </button>
        <strong>{weibo ? "微博正文" : "帖子"}</strong>
        <div>
          {weibo && <Headphones size={23} />}
          <button aria-label="帖子更多选项" onClick={() => setMenu(!menu)}>
            <MoreHorizontal size={26} />
          </button>
        </div>
      </header>
      <div className="post-detail-scroll" ref={scrollRef}>
        <div className="post-detail-author">
          <VAvatar
            name={item.sender || "用户"}
            src={item.avatar}
            gold={item.sender === p.owner}
          />
          <div>
            <strong>
              {item.sender || "用户"}
              {item.sender === p.owner && <NameBadges />}
            </strong>
            <small>
              {weibo
                ? item.time + " " + meta(item, "location")
                : meta(item, "handle", item.sender ? "@" + item.sender : "")}
            </small>
          </div>
          {weibo ? (
            <button
              aria-label="关注作者"
              onClick={() => setFollowed(!followed)}
            >
              <Star fill={followed ? "#ff9500" : "none"} />
            </button>
          ) : (
            <button
              className="post-follow"
              onClick={() => setFollowed(!followed)}
            >
              {followed ? "已关注" : "关注"}
            </button>
          )}
        </div>
        <div className="post-detail-body">
          <RichText value={item.richText} fallback={item.body} />
          {(item.media || item.mediaList.length > 0) && (
            <Media
              item={item}
              onImage={(index) => setViewer(index)}
            />
          )}
        </div>
        {weibo ? (
          <div className="weibo-share-options">
            {[Crown, MessageCircle, Camera, Share, Copy].map((Icon, n) => (
              <button
                key={n}
                aria-label={["会员", "微信分享", "相机", "分享", "复制"][n]}
                onClick={() => (n === 4 ? void copy() : setMenu(true))}
              >
                <Icon size={25} />
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="x-post-metadata">
              {item.time} · <b>{meta(item, "views", "0")}</b> 次查看
            </div>
            {actions}
          </>
        )}
        {weibo ? (
          <div className="weibo-detail-tabs">
            {["转发", "评论", "赞"].map((name) => (
              <button
                key={name}
                aria-pressed={tab === name}
                onClick={() => setTab(name)}
              >
                {name}{" "}
                {name === "评论"
                  ? meta(item, "commentsCount") || count(comments.length)
                  : name === "赞"
                    ? wanCount(item.likes + (liked ? 1 : 0))
                    : meta(item, "reposts", "0")}
              </button>
            ))}
          </div>
        ) : (
          <div className="x-related-row">
            <button onClick={() => setSort(!sort)}>
              {sort ? "最新" : "相关"}⌄
            </button>
            <button onClick={() => setTab(tab === "转发" ? "评论" : "转发")}>
              查看引用 ›
            </button>
          </div>
        )}
        {weibo && (
          <button className="weibo-sort" onClick={() => setSort(!sort)}>
            {sort ? "按时间" : "按热度"}⌄
          </button>
        )}
        {tab === "赞" ? (
          <div className="post-detail-comments">
            {item.likedBy.map((name, index) => (
              <article key={index} className="post-detail-comment weibo-like-row">
                <FanAvatar name={name} photos={item.mediaList} />
                <div>
                  <strong>{name}</strong>
                </div>
                <Heart size={16} fill="#f91880" color="#f91880" />
              </article>
            ))}
            {!item.likedBy.length && (
              <p className="post-comments-empty">暂无更多记录</p>
            )}
          </div>
        ) : (
          <div className="post-detail-comments">
            {(tab === "转发"
              ? sort
                ? [...item.reposts].reverse()
                : item.reposts
              : displayComments
            ).map((c, index) => {
              const isOwner = ownerTopReplies.has(c),
                split = c.search(/[：:]/),
                hasName = split > 0 && split < 24,
                name = isOwner
                  ? p.owner || "机主"
                  : hasName
                    ? c.slice(0, split)
                    : "用户",
                body = hasName ? c.slice(split + 1) : c;
              return commentRow(
                name,
                body,
                isOwner,
                index,
                false,
                isOwner
                  ? () => removeOwnerTop(extra.indexOf(c))
                  : undefined,
              );
            })}
            {(tab === "转发" ? !item.reposts.length : !comments.length) && (
              <p className="post-comments-empty">
                {tab === "转发" ? "暂无转发" : "暂无评论"}
              </p>
            )}
          </div>
        )}
      </div>
      <form
        className="post-detail-reply"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Avatar name={p.owner || "机主"} src={p.ownerAvatar} />
        <input
          aria-label="回复帖子"
          placeholder={
            target ? "回复 @" + target : weibo ? "发表你的评论" : "发布你的回复"
          }
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button aria-label="发送回复" disabled={!draft.trim()}>
          <Send size={20} />
        </button>
      </form>
      {!weibo && (
        <nav className="x-detail-bottom">
          {[Home, Search, Circle, Bell, MessageCircle].map((Icon, n) => (
            <button
              key={n}
              aria-label={
                ["返回X时间线", "X搜索", "X助手", "X通知", "X私信"][n]
              }
              onClick={p.back}
            >
              <Icon />
            </button>
          ))}
        </nav>
      )}
      {viewer !== null && viewerImages.length > 0 && (
        <ImageViewer
          images={viewerImages}
          index={viewer}
          setIndex={setViewer}
          sender={item.sender || "用户"}
          avatar={item.avatar}
          owner={p.owner}
          reposts={meta(item, "reposts", "转发")}
          comments={meta(item, "commentsCount") || count(comments.length)}
          likes={wanCount(item.likes + (liked ? 1 : 0))}
          onClose={() => setViewer(null)}
        />
      )}
      {menu && (
        <div className="post-options-menu">
          <button onClick={copy}>
            <Copy size={18} />
            {copied ? "已复制" : "复制文字"}
          </button>
          <button
            onClick={() => {
              setSaved(!saved);
              setMenu(false);
            }}
          >
            <Bookmark size={18} />
            {saved ? "取消收藏" : "收藏"}
          </button>
          <button onClick={() => setMenu(false)}>取消</button>
        </div>
      )}
    </div>
  );
}
