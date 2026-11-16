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

export function pushWeiboNotif(p: Omit<WeiboPush, "id">) {
  const item: WeiboPush = { id: ++seq, ...p };
  visible.add(item.id);
  listeners.forEach((fn) => fn(item));
}

export function WeiboNotifLayer({ photos = [] }: { photos?: string[] }) {
  const [current, setCurrent] = useState<WeiboPush | null>(null);
  const timer = useRef<number | undefined>(undefined);
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
    return () => {
      listeners.delete(fn);
      window.clearTimeout(timer.current);
    };
  }, []);
  if (!current) return null;
  return (
    <div className="weibo-notif-stack is-global" aria-live="polite">
      <button
        key={current.id}
        className="weibo-notif"
        onClick={() => {
          visible.delete(current.id);
          setCurrent(null);
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
