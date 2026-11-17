import {
  fanNormalTexts,
  fanNotifNames,
  fanNotifTexts,
  ownerLikeStore,
  persistWeiboRuntime,
  runtimeCommentStore,
} from "./weiboData";
import { pushWeiboNotif } from "./weiboNotify";

// 全局"粉丝点赞风暴"：即使离开微博页面（组件卸载），计时器仍在模块级继续运行
let timers: number[] = [];
let stormRunning = false;
// 恢复上次会话的评论 id 序号，避免持久化后 id 冲突
let rcSeq = Math.max(
  0,
  ...Object.values(runtimeCommentStore)
    .flat()
    .map((c) => c.id),
);
let inWeibo = true;
let exitAt = 0;
/** 用户上滑/点击关掉弹窗后，在此时间点之前一律静默 */
let silencedUntil = 0;
/** 上滑关掉弹窗后：本次离开微博期间不再弹任何微博消息，直到重新进入微博 */
let muted = false;
/** 退出微博后的静默冷却（30 秒内不弹任何微博消息） */
const EXIT_COOLDOWN = 30000;
const listeners = new Set<() => void>();

/** 由 Phone 在切换 App 时同步：当前是否在微博内 */
export function setStormInWeibo(v: boolean) {
  if (inWeibo && !v) exitAt = performance.now();
  // 回到微博：解除上滑静默
  if (v) {
    silencedUntil = 0;
    muted = false;
  }
  inWeibo = v;
}
export const isInWeibo = () => inWeibo;
/** 用户上滑/点击关掉弹窗：本次离开微博期间不再弹任何微博消息 */
export function silenceWeiboNotifs() {
  silencedUntil = performance.now() + EXIT_COOLDOWN;
  muted = true;
}
/** 是否已被用户上滑静音（微博外有效） */
export const isWeiboMuted = () => muted && !inWeibo;
/** 还需静默多久（毫秒），0 表示可以弹窗 */
export function weiboCooldownRemaining() {
  if (muted && !inWeibo) return EXIT_COOLDOWN;
  const silenced = Math.max(0, silencedUntil - performance.now());
  if (silenced > 0) return silenced;
  // 微博内、或点赞风暴进行中：照常弹，退出微博也不打断风暴
  if (inWeibo || stormRunning) return 0;
  return Math.max(0, EXIT_COOLDOWN - (performance.now() - exitAt));
}

export function subscribeOwnerData(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
const emit = () => {
  listeners.forEach((fn) => fn());
  persistWeiboRuntime();
};

export const isStormRunning = () => stormRunning;

export function stopOwnerLikeStorm() {
  timers.forEach((t) => clearTimeout(t));
  timers = [];
  stormRunning = false;
}

/** 重新进入微博时，确保自己的评论赞数至少为五位数（即使当时提前退出） */
export function ensureFiveDigitLikes() {
  let changed = false;
  Object.keys(ownerLikeStore).forEach((k) => {
    if (ownerLikeStore[k] > 0 && ownerLikeStore[k] < 10000) {
      ownerLikeStore[k] = 10000;
      changed = true;
    }
  });
  if (changed) emit();
}

export function startOwnerLikeStorm(opts: {
  seed: string;
  preview: string;
  allowBeg: boolean;
  postId: string;
  photos: string[];
}) {
  stopOwnerLikeStorm();
  stormRunning = true;
  ownerLikeStore[opts.seed] = 0;
  emit();
  const startedAt = performance.now();
  const rand = (a: number, b: number) =>
    a + Math.floor(Math.random() * (b - a + 1));
  // 一轮内文案不重复（用尽后重新洗牌）
  let pool: string[] = [];
  const nextCommentText = () => {
    if (!pool.length) {
      pool = [...fanNormalTexts, ...(opts.allowBeg ? fanNotifTexts : [])]
        .map((t) => ({ t, k: Math.random() }))
        .sort((a, b) => a.k - b.k)
        .map((e) => e.t);
    }
    return pool.pop() ?? "";
  };
  let lastCommentAt = -1000,
    added = 0;
  // 最近用过的昵称不再重复出现，避免弹窗里同一个人反复刷屏
  const recentNames: string[] = [];
  const pickName = () => {
    let name = fanNotifNames[Math.floor(Math.random() * fanNotifNames.length)];
    for (let guard = 0; guard < 12 && recentNames.includes(name); guard++) {
      name = fanNotifNames[Math.floor(Math.random() * fanNotifNames.length)];
    }
    recentNames.unshift(name);
    if (recentNames.length > 10) recentNames.pop();
    return name;
  };
  const tick = () => {
    const elapsed = performance.now() - startedAt;
    if (elapsed > 60000) {
      stormRunning = false;
      return;
    }
    const name = pickName();
    // 前 10 秒直接冲到五位数，之后逐步放缓
    const bump =
      elapsed < 10000
        ? rand(250, 620)
        : elapsed < 22000
          ? rand(120, 320)
          : elapsed < 38000
            ? rand(40, 120)
            : rand(10, 45);
    ownerLikeStore[opts.seed] = (ownerLikeStore[opts.seed] ?? 0) + bump;
    emit();
    const isLike = Math.random() < 0.5;
    const text = isLike
      ? "赞了你的评论：" + opts.preview.slice(0, 26)
      : nextCommentText();
    // 风暴期间不中断：退出微博也继续按风暴节奏弹，只有用户上滑关掉才暂停
    const shouldPush = weiboCooldownRemaining() === 0;
    if (shouldPush) {
      pushWeiboNotif({ name, text, photos: opts.photos });
    }
    // 弹窗里的评论同步进入评论区（节流 + 上限）
    if (!isLike && elapsed - lastCommentAt > 700 && added < 14) {
      const list =
        runtimeCommentStore[opts.postId] ||
        (runtimeCommentStore[opts.postId] = []);
      list.push({ id: ++rcSeq, name, text });
      if (list.length > 40) list.splice(0, list.length - 40);
      lastCommentAt = elapsed;
      added += 1;
      emit();
    }
    const gap =
      elapsed < 10000
        ? 300
        : elapsed < 22000
          ? 650 + ((elapsed - 10000) / 12000) * 400
          : elapsed < 38000
            ? 1500 + ((elapsed - 22000) / 16000) * 600
            : 2400 + ((elapsed - 38000) / 17000) * 800;
    timers.push(window.setTimeout(tick, gap));
  };
  timers.push(window.setTimeout(tick, 400));
}
