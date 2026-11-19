import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LockKeyhole,
  Plus,
  Search,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
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
  const img = safeMedia(src);
  return (
    <span className={`catalog-avatar ${round ? "round" : ""}`}>
      {img?.startsWith("data:image/") || img?.startsWith("/images/") ? (
        <img src={img} alt="" />
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
  blue = false,
  crown = false,
  orange = false,
  yellow = false,
}: {
  name: string;
  src?: string;
  gold?: boolean;
  blue?: boolean;
  crown?: boolean;
  /** 橙V（个人机构认证） */
  orange?: boolean;
  /** 黄V（个人认证） */
  yellow?: boolean;
}) {
  const a = <Avatar name={name} src={src} />;
  const pendant = crown ? <CrownPendant /> : null;
  if (blue || orange || yellow)
    return (
      <span className="avatar-v-wrap">
        {a}
        {pendant}
        <i
          className={
            blue
              ? "v-badge-blue"
              : orange
                ? "v-badge-orange"
                : "v-badge-yellow"
          }
          aria-label={blue ? "蓝V认证" : orange ? "橙V认证" : "黄V认证"}
        >
          V
        </i>
      </span>
    );
  return gold ? (
    <span className="avatar-v-wrap">
      {a}
      {pendant}
      <i className="v-badge-gold" aria-label="金V认证">
        V
      </i>
    </span>
  ) : (
    a
  );
}
/** 超话作者行徽章：铁粉皇冠(👑I) + 超话等级紫钻 + 主持人，全部与昵称同行（对照原帖截图） */
export function StNameBadges({
  role,
  level,
  crown = true,
}: {
  role?: string;
  level?: string;
  crown?: boolean;
}) {
  return (
    <span className="st-name-badges">
      {crown && (
        <svg className="st-crown-ico" viewBox="0 0 34 19" aria-hidden="true">
          <path
            d="M3 15.5 L1.8 5.5 L8.8 10 L14.5 2.5 L20.2 10 L27 5.5 L25.8 15.5 Z"
            fill="#f7b500"
            stroke="#d99a00"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="1.9" cy="4.8" r="1.9" fill="#ffd257" stroke="#d99a00" strokeWidth="1" />
          <circle cx="14.5" cy="2.4" r="1.9" fill="#ffd257" stroke="#d99a00" strokeWidth="1" />
          <circle cx="26.8" cy="4.8" r="1.9" fill="#ffd257" stroke="#d99a00" strokeWidth="1" />
          <rect x="26.2" y="4.2" width="7.6" height="11.4" rx="2" fill="#fb7d2e" />
          <path
            d="M29.3 7.2 h2.2 M30.4 7.2 v5.4"
            stroke="#fff"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      )}
      {level && (
        <span className="st-level-diamond" aria-label={`超话等级${level}`}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M10 1.5 L18 7 L10 18.5 L2 7 Z"
              fill="url(#stDiamond)"
              stroke="#7d3cff"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="stDiamond" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#c79bff" />
                <stop offset="1" stopColor="#8a4bff" />
              </linearGradient>
            </defs>
          </svg>
          <b>{level}</b>
        </span>
      )}
      {role && (
        <span className="st-role-pill" aria-label={role}>
          <i>{role}</i>
        </span>
      )}
    </span>
  );
}
/** 会员皇冠挂件：压在头像左上角（对照会员昵称截图） */
export function CrownPendant() {
  return (
    <svg className="avatar-crown" viewBox="0 0 32 26" aria-hidden="true">
      <path
        d="M3 20 L1.5 7 L9 12 L16 3 L23 12 L30.5 7 L29 20 Z"
        fill="#ffb62e"
        stroke="#e89a12"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="1.6" cy="6" r="2.1" fill="#ffc95c" stroke="#e89a12" strokeWidth="1" />
      <circle cx="16" cy="2.6" r="2.1" fill="#ffc95c" stroke="#e89a12" strokeWidth="1" />
      <circle cx="30.4" cy="6" r="2.1" fill="#ffc95c" stroke="#e89a12" strokeWidth="1" />
    </svg>
  );
}
/** 仅粉丝可见提示条：信息流卡片顶部（带折叠箭头）与详情页顶部共用 */
export function WeiboFansOnly({ chevron = false }: { chevron?: boolean }) {
  return (
    <div className="weibo-fansonly" aria-label="仅粉丝可见">
      <span className="weibo-fansonly-label">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <rect
            x="4.2"
            y="9"
            width="15.6"
            height="11"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 17.6c-1.9-1.3-3-2.4-3-3.6 0-.9.7-1.6 1.6-1.6.6 0 1.1.3 1.4.8.3-.5.8-.8 1.4-.8.9 0 1.6.7 1.6 1.6 0 1.2-1.1 2.3-3 3.6Z"
            fill="currentColor"
          />
        </svg>
        仅粉丝可见
      </span>
      {chevron && (
        <svg className="weibo-fansonly-chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 9.5l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
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
/** 工作室博文头部的铁粉等级徽章 + 超话标识（对照真实截图 1:1） */
export function StudioBadges({ withSuper = true }: { withSuper?: boolean }) {
  return (
    <span className="studio-badges">
      <svg
        className="fan-level-badge"
        viewBox="0 0 46 20"
        aria-label="铁粉I级"
      >
        {/* 深蓝皇冠 + 金描边 + 金星 */}
        <path
          d="M2 13 Q2 6 4 6 L5.5 2.6 L9 5.6 L13 1.6 L17 5.6 L20.5 2.6 L22 6 Q24 6 24 13 Q24 17 20 17 L6 17 Q2 17 2 13 Z"
          fill="#20263f"
          stroke="#d9a231"
          strokeWidth="1.3"
        />
        <circle cx="5.5" cy="2.6" r="1.3" fill="#e8b13c" />
        <circle cx="13" cy="1.6" r="1.3" fill="#e8b13c" />
        <circle cx="20.5" cy="2.6" r="1.3" fill="#e8b13c" />
        <path
          d="M13 7.2 L14.3 10.2 L17.5 10.4 L15 12.4 L15.9 15.5 L13 13.7 L10.1 15.5 L11 12.4 L8.5 10.4 L11.7 10.2 Z"
          fill="#e8b13c"
        />
        {/* 金色箭头旗 + I */}
        <path
          d="M24 5 L38 5 Q39.5 5 40.5 6 L45 10 L40.5 14 Q39.5 15 38 15 L24 15 Q23 15 23 14 L23 6 Q23 5 24 5 Z"
          fill="url(#fanGold)"
          stroke="#c98d1f"
          strokeWidth="1"
        />
        <path d="M28 5 L29.5 15 M33 5 L34.5 15" stroke="#c98d1f" strokeWidth="0.8" opacity="0.7" />
        <text
          x="36.5"
          y="12.6"
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="800"
          fill="#8c3d10"
          fontFamily="Georgia, serif"
        >
          I
        </text>
        <defs>
          <linearGradient id="fanGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe27a" />
            <stop offset="0.5" stopColor="#f7c53c" />
            <stop offset="1" stopColor="#eda723" />
          </linearGradient>
        </defs>
      </svg>
      {withSuper && (
        <>
          <span className="st-super-link">
            <svg viewBox="0 0 14 14" aria-hidden="true">
              <rect
                x="3.2"
                y="3.2"
                width="7.6"
                height="7.6"
                fill="none"
                stroke="#7b8ba1"
                strokeWidth="1.4"
                transform="rotate(45 7 7)"
              />
            </svg>
            陈立农超话
          </span>
          <span className="st-super-sticker" aria-hidden="true">
            超话
          </span>
        </>
      )}
    </span>
  );
}
export const wanCount = (n: number) =>
  n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, "") + "万" : String(n);

/** 故事时间线的"现在"是 2026 年：当年的博文只显示"月-日"，往年的带上年份 */
export const WEIBO_NOW_YEAR = 2026;
/** 博文头部的发布日期："5-17" / 往年 "2024-5-17" */
export const weiboDate = (t: string) => {
  const m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return t;
  return +m[1] >= WEIBO_NOW_YEAR
    ? `${+m[2]}-${+m[3]}`
    : `${m[1]}-${+m[2]}-${+m[3]}`;
};
/** 评论时间戳：往年的补上年份前缀 */
export const weiboStamp = (t: string, year?: number) => {
  if (!year || year >= WEIBO_NOW_YEAR || /^\d{4}-/.test(t)) return t;
  return `${year}-${t}`;
};
/**
 * 视频滚出可视区域时自动暂停播放（feed 与详情页通用）。
 * IntersectionObserver 以浏览器视口为根，内部滚动容器同样生效。
 * 右下角自定义放大按钮：全屏后锁定横屏；竖屏视口下横向视频旋转 90° 模拟横屏。
 */
export const SEEK_STEP = 10;
/** 双击热区：左侧 35% 后退、右侧 35% 前进、中间留给播放/暂停 */
export const seekZone = (ratio: number): "back" | "forward" | null =>
  ratio <= 0.35 ? "back" : ratio >= 0.65 ? "forward" : null;
/** 目标时间：夹在 [0, duration] 内（duration 未知时只保底 0） */
export const seekTarget = (
  current: number,
  duration: number,
  delta: number,
) => {
  const end =
    Number.isFinite(duration) && duration > 0 ? duration : Number.MAX_VALUE;
  return Math.min(Math.max(current + delta, 0), end);
};
export const clockText = (t: number) => {
  const v = Number.isFinite(t) && t > 0 ? t : 0;
  return `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, "0")}`;
};

/** 起播兜底：自动播放（带声）被浏览器拦截时退回静音起播 */
function safePlay(el: HTMLVideoElement): Promise<void> {
  return el.play().catch(() => {
    if (el.muted) return;
    el.muted = true;
    return el.play().catch(() => {});
  });
}

export function PausingVideo({
  className = "",
  src,
  autoStart = false,
  tapToggle = false,
  onDoubleTap,
  ...rest
}: ComponentProps<"video"> & {
  autoStart?: boolean;
  /** 单击暂停/继续（双击则交给 onDoubleTap 处理，如抖音点赞） */
  tapToggle?: boolean;
  /** 双击回调（抖音：点赞）；提供后双击不再触发 ±10s 快进快退 */
  onDoubleTap?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  // HLS 分片播放：静态托管不带 Range 支持，整段 mp4 无法定位，改由 m3u8 + hls.js 按片加载
  const isHls = typeof src === "string" && /\.m3u8(?:$|\?)/.test(src);
  const tapRef = useRef<{ t: number; paused: boolean } | null>(null);
  const hintTimer = useRef<number | null>(null);
  const tapToggleTimer = useRef<number | null>(null);
  const burstTimer = useRef<number | null>(null);
  const [hint, setHint] = useState<{
    side: "back" | "forward";
    text: string;
  } | null>(null);
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null);
  // 临近视口才初始化 HLS，避免信息流里几十个实例同时拉清单和分片
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) setNear(true);
          // 可视面积不足一半即立即停止，避免翻页动画中相邻两条同时出声
          if (!en.isIntersecting || en.intersectionRatio < 0.5) {
            if (!el.paused) el.pause();
          } else if (autoStart && en.intersectionRatio >= 0.65) {
            // 竖屏信息流（抖音）：落定到可视区才续播
            if (el.paused) void safePlay(el);
          }
        }
      },
      { threshold: [0, 0.2, 0.5, 0.65, 1], rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // 全屏（包裹层）时锁定横屏；竖屏视口下横向视频旋转 90° 铺满
  useEffect(() => {
    const el = ref.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    const apply = () => {
      const fsing = document.fullscreenElement === stage;
      const portrait = window.innerHeight > window.innerWidth;
      const horiz = el.videoWidth > el.videoHeight;
      el.classList.toggle("fs-landscape", fsing && portrait && horiz);
    };
    const lock = (o: string) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (screen.orientation as any)?.lock?.(o)?.catch?.(() => {});
      } catch {
        /* 桌面端或不支持时静默忽略 */
      }
    };
    const onFs = () => {
      if (document.fullscreenElement === stage) {
        lock("landscape");
        apply();
      } else if (!document.fullscreenElement) {
        try {
          screen.orientation?.unlock?.();
        } catch {
          /* ignore */
        }
        el.classList.remove("fs-landscape");
      }
    };
    const onResize = () => apply();
    const onMeta = () => apply();
    document.addEventListener("fullscreenchange", onFs);
    window.addEventListener("resize", onResize);
    el.addEventListener("loadedmetadata", onMeta);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);
  // HLS：优先 hls.js（MSE 可控分片），不支持 MSE 时退回原生（iOS Safari）
  useEffect(() => {
    const el = ref.current;
    if (!el || !isHls || typeof src !== "string" || !near) return;
    let hls: { destroy: () => void; startLoad: () => void } | null = null;
    let dead = false;
    const onPlay = () => hls?.startLoad();
    const nativeHls = () => {
      if (dead || !ref.current) return;
      ref.current.preload = "metadata";
      ref.current.src = src;
    };
    void import("hls.js")
      .then((mod) => {
        const Hls = mod.default;
        if (dead || !ref.current) return;
        if (!Hls.isSupported()) {
          nativeHls();
          return;
        }
        // 不自动起播：点播放、拖进度时再按片拉流，信息流滚动不浪费流量；
        // autoStart（抖音竖屏流）则挂载后立即拉流并循环起播
        const inst = new Hls({
          maxBufferLength: 30,
          backBufferLength: 30,
          autoStartLoad: !autoStart,
        });
        hls = inst;
        inst.loadSource(src);
        inst.attachMedia(ref.current);
        ref.current.addEventListener("play", onPlay);
        ref.current.addEventListener("seeking", onPlay);
        if (autoStart) {
          inst.startLoad();
          const el = ref.current;
          // 数据就绪仍未播（部分浏览器拦截首次 play）时自动补播
          const tryPlay = () => {
            if (el.paused) void safePlay(el);
          };
          el.addEventListener("canplay", tryPlay);
          void safePlay(el);
        }
        // 挂载前用户已点过播放（此时没人监听 play 事件）：补一次起流
        if (!ref.current.paused && ref.current.readyState < 3) onPlay();
      })
      .catch(nativeHls);
    return () => {
      dead = true;
      ref.current?.removeEventListener("play", onPlay);
      ref.current?.removeEventListener("seeking", onPlay);
      hls?.destroy();
    };
  }, [src, isHls, near, autoStart]);
  useEffect(
    () => () => {
      if (hintTimer.current) window.clearTimeout(hintTimer.current);
      if (tapToggleTimer.current) window.clearTimeout(tapToggleTimer.current);
      if (burstTimer.current) window.clearTimeout(burstTimer.current);
    },
    [],
  );
  const flashHint = (side: "back" | "forward", text: string) => {
    setHint({ side, text });
    if (hintTimer.current) window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(null), 900);
  };
  /** 双击左右两侧 ±10 秒；抖音模式：单击暂停/继续，双击点赞 */
  const onSeekTap = (e: ReactPointerEvent<HTMLVideoElement>) => {
    const el = ref.current;
    if (!el) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const rect = el.getBoundingClientRect();
    const y = e.clientY - rect.top;
    // 底部原生控件条交给浏览器（进度条拖动等）
    if (y > rect.height - 44) return;
    const x = e.clientX - rect.left;
    const now = Date.now();
    const prev = tapRef.current;
    tapRef.current = { t: now, paused: el.paused };
    if (!prev || now - prev.t > 320) {
      // 单击暂停/继续：延迟片刻以区分双击点赞
      if (tapToggle) {
        if (tapToggleTimer.current) window.clearTimeout(tapToggleTimer.current);
        tapToggleTimer.current = window.setTimeout(() => {
          tapToggleTimer.current = null;
          const v = ref.current;
          if (!v) return;
          if (v.paused) {
            // 用户手势起播：恢复声音（此前若因自动播放受限退化为静音）
            v.muted = false;
            void safePlay(v);
          } else v.pause();
        }, 280);
      }
      return;
    }
    tapRef.current = null;
    if (tapToggleTimer.current) {
      window.clearTimeout(tapToggleTimer.current);
      tapToggleTimer.current = null;
    }
    e.preventDefault();
    e.stopPropagation();
    // 双击点赞：红心在指尖绽放，播放状态不变
    if (onDoubleTap) {
      setBurst({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      if (burstTimer.current) window.clearTimeout(burstTimer.current);
      burstTimer.current = window.setTimeout(() => setBurst(null), 850);
      onDoubleTap();
      return;
    }
    const zone = seekZone(x / Math.max(1, rect.width));
    if (!zone) return;
    const delta = zone === "forward" ? SEEK_STEP : -SEEK_STEP;
    const target = seekTarget(el.currentTime, el.duration, delta);
    try {
      el.currentTime = target;
    } catch {
      /* 不支持定位时静默忽略 */
    }
    // 双击的第一下可能已切换过播放状态，按第一次点击前的状态恢复
    if (prev.paused) el.pause();
    else void el.play().catch(() => {});
    flashHint(
      zone,
      `${zone === "forward" ? "+" : "−"}${SEEK_STEP}s · ${clockText(target)}`,
    );
  };
  const enterFs = () => {
    const stage = stageRef.current;
    if (!stage) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen?.();
      return;
    }
    const stageWithWebkit = stage as HTMLSpanElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    const req =
      stage.requestFullscreen?.bind(stage) ??
      stageWithWebkit.webkitRequestFullscreen?.bind(stage);
    try {
      const p = req?.();
      p?.catch?.(() => {});
    } catch {
      /* ignore */
    }
  };
  return (
    <span ref={stageRef} className="fs-stage">
      <video
        ref={ref}
        className={className}
        controls
        playsInline
        controlsList="nofullscreen"
        src={isHls ? undefined : src}
        onPointerUp={onSeekTap}
        onDoubleClick={(e) => e.preventDefault()}
        {...rest}
      />
      {hint && (
        <span
          className={`v-seek-hint is-${hint.side}`}
          aria-hidden="true"
        >
          {hint.text}
        </span>
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
      <button
        type="button"
        className="fs-btn"
        aria-label="全屏播放"
        onClick={(e) => {
          e.stopPropagation();
          enterFs();
        }}
      >
        <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
          <path
            d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </span>
  );
}
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
      <PausingVideo
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
      <PausingVideo
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

/** 长文案折叠：超过 maxLines 行时收起，显示「全文 / 收起」按钮（微博式交互） */
export function Foldable({
  text,
  children,
  maxLines = 6,
  className,
}: {
  text?: string;
  children?: React.ReactNode;
  maxLines?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  // null = 尚未测量（先按折叠态渲染才能量出行数差）；true = 超行；false = 无需折叠
  const [over, setOver] = useState<boolean | null>(null);
  const ref = useRef<HTMLParagraphElement & HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) setOver(el.scrollHeight > el.clientHeight + 2);
  }, [text, children]);
  const clamped = over !== false && !open;
  const Tag = (text !== undefined ? "p" : "div") as "p";
  return (
    <>
      <Tag
        ref={ref}
        className={[className, clamped ? "wb-clamp" : ""].filter(Boolean).join(" ") || undefined}
        style={clamped ? ({ WebkitLineClamp: maxLines } as React.CSSProperties) : undefined}
      >
        {text !== undefined ? text : children}
      </Tag>
      {over === true && (
        <button
          className="wb-fold-btn"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          {open ? "收起" : "全文"}
        </button>
      )}
    </>
  );
}
