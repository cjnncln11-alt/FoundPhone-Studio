import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LockKeyhole,
  Plus,
  Search,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import type { SkinProps } from "../AppSkins";
import { safeMedia, type Item } from "../schema";
export type Props = SkinProps;
export const meta = (
  i: Pick<Item, "meta"> | undefined,
  key: string,
  fallback = "",
) => String(i?.meta?.[key] ?? fallback);
export function Header({ p, children }: { p: Props; children?: ReactNode }) {
  return (
    <header
      className="app-nav catalog-nav"
      data-authoring={p.creator}
      data-root={!p.thread}
    >
      <button aria-label="返回" onClick={p.onBack}>
        <ChevronLeft size={22} />
      </button>
      <strong>{p.name}</strong>
      <div>
        {children}
        {p.creator && (
          <button aria-label="新增内容" onClick={p.onAdd}>
            <Plus size={21} />
          </button>
        )}
      </div>
    </header>
  );
}
export function Tabs({
  tabs,
  value,
  set,
  icons,
}: {
  tabs: string[];
  value: string;
  set: (s: string) => void;
  icons?: ReactNode[];
}) {
  return (
    <nav className="catalog-tabs">
      {tabs.map((t, i) => (
        <button
          key={t}
          className={value === t ? "selected" : ""}
          onClick={() => set(t)}
        >
          {icons?.[i]}
          <span>{t}</span>
        </button>
      ))}
    </nav>
  );
}
export function SearchBox({
  value,
  set,
  placeholder = "搜索",
}: {
  value: string;
  set: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="catalog-search">
      <Search size={15} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    </label>
  );
}
export function Avatar({
  name,
  round = true,
  src = "",
}: {
  name: string;
  round?: boolean;
  src?: string;
}) {
  return (
    <span className={`catalog-avatar ${round ? "round" : ""}`}>
      {safeMedia(src)?.startsWith("data:image/") ? (
        <img src={safeMedia(src)} alt="" />
      ) : (
        name.slice(0, 1) || "人"
      )}
    </span>
  );
}
export function VAvatar({
  name,
  src = "",
  gold = false,
}: {
  name: string;
  src?: string;
  gold?: boolean;
}) {
  const a = <Avatar name={name} src={src} />;
  return gold ? (
    <span className="avatar-v-wrap">
      {a}
      <i className="v-badge-gold" aria-label="金V认证">
        V
      </i>
    </span>
  ) : (
    a
  );
}
export function NameBadges() {
  return (
    <span className="name-badges">
      <i className="gender-badge" aria-label="性别">
        ♂
      </i>
      <i className="svip-badge" aria-label="会员等级">
        👑SVIP9
      </i>
    </span>
  );
}
export const wanCount = (n: number) =>
  n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, "") + "万" : String(n);
export function Media({
  item,
  className = "",
  onImage,
  onMore,
}: {
  item: Item;
  className?: string;
  onImage?: (index: number, images: string[]) => void;
  /** 折叠模式：超过 9 张时只显示 8 张 + 第 9 格 "+N"，点击 "+N" 触发 onMore（进入微博正文展开全部） */
  onMore?: () => void;
}) {
  const src = safeMedia(item.media);
  const list = item.mediaList
    .map((m) => safeMedia(m))
    .filter((m): m is string => !!m && item.kind !== "audio" && item.kind !== "video");
  if (item.kind === "audio")
    return <audio className={className} controls src={src} />;
  if (item.kind === "video")
    return (
      <video
        className={className}
        controls
        playsInline
        src={src}
        onClick={(e) => e.stopPropagation()}
      />
    );
  // 帖子内嵌视频（微博视频博文等）：视频本体存放在 public/videos/，封面作海报
  const postVideo = safeMedia(item.meta?.video ?? "");
  if (postVideo)
    return (
      <video
        className={className}
        controls
        playsInline
        preload="metadata"
        poster={safeMedia(item.meta?.videoCover ?? "") || undefined}
        src={postVideo}
        onClick={(e) => e.stopPropagation()}
      />
    );
  if (list.length) {
    if (!onMore)
      return (
        <div className={`media-grid media-grid-${Math.min(list.length, 9)}`}>
          {list.map((s, i) => (
            <img
              key={i}
              loading="lazy"
              alt={`${item.title} ${i + 1}`}
              src={s}
              onClick={(e) => {
                e.stopPropagation();
                onImage?.(i, list);
              }}
            />
          ))}
        </div>
      );
    const shown = list.slice(0, 8);
    const rest = list.length - shown.length;
    return (
      <div className="media-grid media-grid-9 weibo-live-grid">
        {shown.map((s, i) => (
          <div className="weibo-media-cell" key={i}>
            <img
              loading="lazy"
              alt={`${item.title} ${i + 1}`}
              src={s}
              onClick={(e) => {
                e.stopPropagation();
                onImage?.(i, list);
              }}
            />
          </div>
        ))}
        {rest > 0 && (
          <div className="weibo-media-cell">
            <img
              loading="lazy"
              alt={`${item.title} 更多`}
              src={list[8]}
              onClick={(e) => {
                e.stopPropagation();
                onMore();
              }}
            />
            <span
              className="weibo-media-more"
              onClick={(e) => {
                e.stopPropagation();
                onMore();
              }}
            >
              +{rest}
            </span>
          </div>
        )}
      </div>
    );
  }
  return src ? (
    <img
      className={className}
      loading="lazy"
      alt={item.title}
      src={src}
      onClick={(e) => {
        e.stopPropagation();
        onImage?.(0, [src]);
      }}
    />
  ) : (
    <div className={`catalog-art ${className}`}>
      <span>{item.title}</span>
    </div>
  );
}
export function Row({
  item,
  onItem,
  leading,
  children,
}: {
  item: Item;
  onItem: (i: Item) => void;
  leading?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <button className="catalog-row" onClick={() => onItem(item)}>
      {leading ?? <FileText size={22} />}
      <span>
        <strong>{item.title}</strong>
        <p>{item.body.split("\n")[0]}</p>
        <small>{item.time}</small>
      </span>
      {children ??
        (item.password ? (
          <LockKeyhole size={13} />
        ) : (
          <ChevronRight size={15} />
        ))}
    </button>
  );
}
export function Empty({
  items,
  label = "暂无内容",
}: {
  items: Item[];
  label?: string;
}) {
  return !items.length ? <p className="catalog-empty">{label}</p> : null;
}
export function Add({ p, label = "添加内容" }: { p: Props; label?: string }) {
  return p.creator ? (
    <button className="catalog-add" onClick={p.onAdd}>
      <Plus size={15} />
      {label}
    </button>
  ) : null;
}
export function useContent(p: Props, first: string) {
  const [tab, setTab] = useState(first),
    [q, setQ] = useState("");
  const items = p.items.filter((i) =>
    (
      i.title +
      i.body +
      i.sender +
      i.folder +
      Object.values(i.meta ?? {}).join(" ")
    )
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return { tab, setTab, q, setQ, items };
}
export function groupItems(items: Item[], fallback = "未分类") {
  return [...new Set(items.map((i) => i.folder || fallback))];
}

const fanPinks = [
  ["#ffd9ea", "#ffb4d3"],
  ["#ffe4f0", "#ffc0dd"],
  ["#ffd2e7", "#ffa6ca"],
  ["#ffeaf5", "#ffcde4"],
  ["#ffdfef", "#f9b5d8"],
];
const fanHash = (s: string) => {
  let a = 5381;
  for (const ch of s) a = ((a * 33) ^ ch.charCodeAt(0)) >>> 0;
  return a;
};
const fanShapes = [
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <ellipse cx="8.2" cy="7.5" rx="2.7" ry="5.2" fill="#fff" />
    <ellipse cx="15.8" cy="7.5" rx="2.7" ry="5.2" fill="#fff" />
    <ellipse cx="8.2" cy="7.5" rx="1.2" ry="3" fill="#f9b7d4" />
    <ellipse cx="15.8" cy="7.5" rx="1.2" ry="3" fill="#f9b7d4" />
    <circle cx="12" cy="15.5" r="6.2" fill="#fff" />
    <circle cx="9.8" cy="14.6" r="0.9" fill="#e2689a" />
    <circle cx="14.2" cy="14.6" r="0.9" fill="#e2689a" />
    <ellipse cx="12" cy="16.8" rx="1.2" ry="0.9" fill="#e2689a" />
  </svg>,
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12 L8.2 8.6 L8.2 15.4 Z" fill="#fff" />
    <path d="M19 12 L15.8 8.6 L15.8 15.4 Z" fill="#fff" />
    <circle cx="12" cy="12" r="4.8" fill="#fff" />
    <path d="M12 7.2 C14.2 10 14.2 14 12 16.8 C9.8 14 9.8 10 12 7.2 Z" fill="#f9b7d4" />
  </svg>,
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="7.4" r="3.4" fill="#fff" />
    <circle cx="16.4" cy="10.8" r="3.4" fill="#fff" />
    <circle cx="14.7" cy="16" r="3.4" fill="#fff" />
    <circle cx="9.3" cy="16" r="3.4" fill="#fff" />
    <circle cx="7.6" cy="10.8" r="3.4" fill="#fff" />
    <circle cx="12" cy="12" r="2.6" fill="#f9b7d4" />
  </svg>,
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 20 C4 14 4 8.5 8 7 C10.2 6.2 12 7.6 12 9 C12 7.6 13.8 6.2 16 7 C20 8.5 20 14 12 20 Z"
      fill="#fff"
    />
  </svg>,
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12 L5 7.5 L5 16.5 Z" fill="#fff" />
    <path d="M12 12 L19 7.5 L19 16.5 Z" fill="#fff" />
    <circle cx="12" cy="12" r="2.4" fill="#f9b7d4" />
  </svg>,
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4.5 L16.2 7.2 L7.8 7.2 Z" fill="#fff" />
    <path d="M12 6.5 C17 8.5 17 14 12 19 C7 14 7 8.5 12 6.5 Z" fill="#fff" />
    <circle cx="10.5" cy="11" r="0.7" fill="#f9b7d4" />
    <circle cx="13.5" cy="12.5" r="0.7" fill="#f9b7d4" />
    <circle cx="11.5" cy="14.5" r="0.7" fill="#f9b7d4" />
  </svg>,
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <ellipse cx="12" cy="15.5" rx="6.5" ry="5" fill="#fff" />
    <path d="M6.5 11 C8 7.5 16 7.5 17.5 11 Z" fill="#fff" />
    <ellipse cx="12" cy="10" rx="1.6" ry="2" fill="#f9b7d4" />
    <circle cx="9.6" cy="13.6" r="0.9" fill="#e2689a" />
    <circle cx="14.4" cy="13.6" r="0.9" fill="#e2689a" />
  </svg>,
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8" fill="#fff" />
    <path d="M6 12 A6 6 0 0 1 18 12 Z" fill="#f9b7d4" />
    <circle cx="9.6" cy="14" r="0.9" fill="#e2689a" />
    <circle cx="14.4" cy="14" r="0.9" fill="#e2689a" />
    <path d="M10.6 16.4 Q12 18 13.4 16.4" stroke="#e2689a" strokeWidth="0.9" fill="none" strokeLinecap="round" />
  </svg>,
];
export function FanAvatar({
  name,
  size = 37,
  photos = [],
  className = "",
}: {
  name: string;
  size?: number;
  photos?: string[];
  className?: string;
}) {
  const h = fanHash(name + "|avatar"),
    photo =
      photos.length && h % 100 < 24
        ? safeMedia(photos[h % photos.length])
        : "",
    shape = fanShapes[h % fanShapes.length],
    pink = fanPinks[h % fanPinks.length];
  return (
    <span
      className={`catalog-avatar round fan-avatar ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(140deg, ${pink[0]}, ${pink[1]})`,
      }}
    >
      {photo ? (
        <img src={photo} alt="" />
      ) : (
        <span
          className="fan-avatar-shape"
          style={{ width: Math.round(size * 0.64), height: Math.round(size * 0.64) }}
        >
          {shape}
        </span>
      )}
    </span>
  );
}
