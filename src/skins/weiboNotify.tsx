import { useEffect, useRef, useState } from "react";
import { FanAvatar } from "./shared";
import { isInWeibo } from "./weiboStorm";
import "./weibo-notify.css";

export type WeiboPush = {
  id: number;
  name: string;
  text: string;
  photos?: string[];
};

let seq = 0;
const listeners = new Set<(n: WeiboPush) => void>();
const visible = new Set<number>();
const clearers = new Set<() => void>();

/** 立即清掉当前显示的弹窗（如退出微博时） */
export function clearWeiboNotif() {
  clearers.forEach((fn) => fn());
}

export function pushWeiboNotif(p: Omit<WeiboPush, "id">) {
  const item: WeiboPush = { id: ++seq, ...p };
  visible.add(item.id);
  listeners.forEach((fn) => fn(item));
}

export function WeiboNotifLayer({ photos = [] }: { photos?: string[] }) {
  const [current, setCurrent] = useState<WeiboPush | null>(null);
  const [dy, setDy] = useState(0);
  const drag = useRef<{ y: number; id: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const close = (id: number) => {
    visible.delete(id);
    setCurrent((c) => (c?.id === id ? null : c));
    setDy(0);
  };
  useEffect(() => {
    const fn = (n: WeiboPush) => {
      if (!visible.has(n.id)) {
        setCurrent((c) => (c?.id === n.id ? null : c));
        return;
      }
      setCurrent(n);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        visible.delete(n.id);
        setCurrent((c) => (c?.id === n.id ? null : c));
      }, isInWeibo() ? 3400 : 1600);
    };
    listeners.add(fn);
    const clear = () => {
      window.clearTimeout(timer.current);
      setCurrent(null);
    };
    clearers.add(clear);
    return () => {
      listeners.delete(fn);
      clearers.delete(clear);
      window.clearTimeout(timer.current);
    };
  }, []);
  // 新弹窗替换旧弹窗时复位拖拽位移
  useEffect(() => {
    setDy(0);
  }, [current?.id]);
  if (!current) return null;
  const dismiss = () => {
    window.clearTimeout(timer.current);
    close(current.id);
  };
  return (
    <div className="weibo-notif-stack is-global" aria-live="polite">
      <button
        key={current.id}
        className="weibo-notif"
        style={{
          transform: dy ? `translateY(${dy}px)` : undefined,
          opacity: dy ? Math.max(0.25, 1 + dy / 130) : undefined,
          transition: drag.current ? "none" : "transform 0.18s ease, opacity 0.18s ease",
        }}
        onClick={dismiss}
        onPointerDown={(e) => {
          drag.current = { y: e.clientY, id: e.pointerId };
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current || drag.current.id !== e.pointerId) return;
          const d = Math.min(0, e.clientY - drag.current.y);
          setDy(d);
        }}
        onPointerUp={(e) => {
          if (!drag.current || drag.current.id !== e.pointerId) return;
          const d = e.clientY - drag.current.y;
          drag.current = null;
          // 上滑超过 26px 即消失
          if (d < -26) dismiss();
          else setDy(0);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDy(0);
        }}
      >
        <div className="weibo-notif-head">
          <span className="weibo-notif-logo">微博</span>
          <small>现在</small>
        </div>
        <div className="weibo-notif-main">
          <FanAvatar
            name={current.name}
            size={30}
            photos={current.photos?.length ? current.photos : photos}
            className="weibo-notif-avatar"
          />
          <div>
            <strong>{current.name}</strong>
            <p>{current.text}</p>
          </div>
        </div>
      </button>
    </div>
  );
}
