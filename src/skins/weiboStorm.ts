import {
  fanNormalTexts,
  fanNotifNames,
  fanNotifTexts,
  ownerLikeStore,
  runtimeCommentStore,
} from "./weiboData";
import { pushWeiboNotif } from "./weiboNotify";

// 全局"粉丝点赞风暴"：即使离开微博页面（组件卸载），计时器仍在模块级继续运行
let timers: number[] = [];
let stormRunning = false;
let rcSeq = 0;
const listeners = new Set<() => void>();

export function subscribeOwnerData(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
const emit = () => listeners.forEach((fn) => fn());

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
  const tick = () => {
    const elapsed = performance.now() - startedAt;
    if (elapsed > 60000) {
      stormRunning = false;
      return;
    }
    const name = fanNotifNames[Math.floor(Math.random() * fanNotifNames.length)];
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
    pushWeiboNotif({ name, text, photos: opts.photos });
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
