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
import { Avatar, Media, meta, NameBadges, VAvatar, wanCount } from "./shared";
import { ImageViewer } from "./ImageViewer";
import type { Item, UiValue } from "../schema";
import "./social-details.css";
export const socialDetailApps = new Set(["twitter", "weibo"]);
const count = (n: number) =>
  n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, "") + "w" : String(n);
const fanNotifNames = [
  "农糖小甜",
  "NLNG_0713",
  "农哥的小饼干",
  "今天也要吃糖",
  "糖渍小圆子",
  "月亮邮递员",
  "农糖电台",
  "一颗农糖",
  "糖分超标",
  "橘子汽水农",
  "深夜刷博选手",
  "等翻牌的阿糖",
  "奶茶三分甜",
  "糖罐子打翻了",
  "微博冲浪选手",
  "农农的第五个季节",
  "甜度满分",
  "蹲守评论区的人",
  "小农包",
  "血肠汤饭研究员",
];
const fanNotifTexts = [
  "我去买肉夹馍，让老板多放点辣，刚吃了一口就掉到了地上沾了泥，我哭了，原来这叫辣馍喜欢泥。",
  "哥，我在评论区蹲了一天了，就等你翻我一次牌。",
  "陈立农你看到我了吗？看到请回 1，看不到请回 2。",
  "血肠汤饭到底啥味儿啊，哥你倒是说说，我馋得睡不着。",
  "我朋友说你要是回我，她就倒立洗头，哥你成全她吧。",
  "翻我翻我翻我！重要的事情说三遍。",
  "我今天生日，能不能得到一句生日快乐（不是生日也行）。",
  "我妈问我为什么对着手机傻笑，我说我在等一个台湾来的男人回我消息。",
  "刚称了体重发现自己轻了，原来是忘了带手机——手机里全是你。",
  "医生说我低血糖，要听点甜的话，哥你懂我意思吧。",
  "今天上班摸鱼被抓，老板问我鱼呢，我说鱼在陈立农的评论区。",
  "如果我有罪，法律会制裁我，而不是让我在评论区等到花儿都谢了。",
  "我这个人没什么优点，就是有耐心，比如等你翻牌。",
  "别人追星花钱，我追星掉头发，哥你赔我。",
  "风里雨里，评论区等你。",
  "刚做了个梦，梦见你回复我了，醒来一看，果然是个梦。",
  "哥你要是回我，我立刻把手机壁纸换成你——哦已经是了。",
  "请问这里是陈立农的评论区吗？我来领号码牌的，前面还有三万多人。",
  "血肠汤饭我都学会做了，就等你来验收。",
  "我买了跟你同款的格子衫，穿上像桌布，但我很开心。",
  "评论区这么多人，我就占一个位置，行不行。",
  "要不你随便回我一个字也行，'嗯'都可以。",
  "我发誓，只要你回我，我这周就不熬夜了（大概率做不到）。",
  "今天也是想让农农回复我的一天。",
  "哥，我排队排到腿软，能不能给个优先通道。",
  "你好，我是你未来的粉丝代表，请问可以握个手吗（隔着屏幕）。",
];
const fanNotifHue = (name: string) =>
  [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 360;
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
    [viewer, setViewer] = useState<number | null>(null);
  const [notifs, setNotifs] = useState<
    { id: number; name: string; text: string }[]
  >([]);
  const notifTimers = useRef<number[]>([]);
  const notifSeq = useRef(0);
  const stopNotifStorm = () => {
    notifTimers.current.forEach((t) => clearTimeout(t));
    notifTimers.current = [];
  };
  useEffect(() => stopNotifStorm, []);
  const startNotifStorm = () => {
    stopNotifStorm();
    setNotifs([]);
    const startedAt = performance.now();
    const loop = () => {
      const elapsed = performance.now() - startedAt;
      if (elapsed > 50000) return;
      const name = fanNotifNames[Math.floor(Math.random() * fanNotifNames.length)],
        text = fanNotifTexts[Math.floor(Math.random() * fanNotifTexts.length)],
        id = ++notifSeq.current;
      setNotifs((list) => [...list.slice(-2), { id, name, text }]);
      notifTimers.current.push(
        window.setTimeout(
          () => setNotifs((list) => list.filter((n) => n.id !== id)),
          3400,
        ),
      );
      const gap =
        elapsed < 9000
          ? 260
          : elapsed < 24000
            ? 420 + ((elapsed - 9000) / 15000) * 900
            : 1400 + ((elapsed - 24000) / 26000) * 2100;
      notifTimers.current.push(window.setTimeout(loop, gap));
    };
    notifTimers.current.push(window.setTimeout(loop, 700));
  };
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
    .filter(isNestedReply)
    .map(parseNestedReply);
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
  const comments = [
    ...item.comments.filter((c) => !fanReplyTarget(c)),
    ...extra.filter((c) => !isNestedReply(c)),
  ];
  const ownerBadge = p.owner ? <NameBadges /> : null;
  const commentRow = (
    name: string,
    body: string,
    isOwner: boolean,
    index: number | string,
    nested: boolean,
  ): ReactElement => (
    <>        <article
        key={index}
        className={
          "post-detail-comment" + (nested ? " weibo-nested-reply" : "")
        }
      >
        {isOwner ? (
          <Avatar name={name} src={p.ownerAvatar} />
        ) : (
          <Avatar name={name} />
        )}
        <div>
          <strong>
            {name}
            {isOwner && ownerBadge}
          </strong>
          <p>{body}</p>
          <div className="post-comment-actions">
            <button
              aria-label={"转发" + name}
              onClick={() => setTarget(name)}
            >
              {tab === "转发" ? (
                <Repeat2 size={16} />
              ) : (
                <MessageCircle size={16} />
              )}
            </button>
            <button
              aria-label={"喜欢回复" + index}
              onClick={(e) => {
                e.currentTarget.classList.toggle("liked");
              }}
            >
              <Heart size={16} />
            </button>
          </div>
        </div>
        <MoreHorizontal size={17} />
      </article>
      {!nested &&
        tab !== "转发" &&
        nestedReplies
          .map((r, i) => ({ r, i }))
          .filter(({ r }) => r.to === name)
          .map(({ r, i }) =>
            commentRow(p.owner || "机主", r.text, true, "n" + index + "-" + i, true),
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
    if (target) startNotifStorm();
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
      {notifs.length > 0 && (
        <div className="weibo-notif-stack" aria-live="polite">
          {notifs.map((n) => (
            <button
              key={n.id}
              className="weibo-notif"
              onClick={() =>
                setNotifs((list) => list.filter((x) => x.id !== n.id))
              }
            >
              <div className="weibo-notif-head">
                <span className="weibo-notif-logo">微博</span>
                <small>现在</small>
              </div>
              <div className="weibo-notif-main">
                <span
                  className="weibo-notif-avatar"
                  style={{
                    background: `hsl(${fanNotifHue(n.name)} 62% 68%)`,
                  }}
                >
                  {n.name.slice(0, 1)}
                </span>
                <div>
                  <strong>{n.name}</strong>
                  <p>{n.text}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
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
      <div className="post-detail-scroll">
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
                <Avatar name={name} />
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
              : sort
                ? [...comments].reverse()
                : comments
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
              return commentRow(name, body, isOwner, index, false);
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
