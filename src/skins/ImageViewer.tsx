import { useRef, useState } from "react";
import {
  MoreHorizontal,
  Repeat2,
  MessageCircle,
  ThumbsUp,
  ScanSearch,
  ChevronDown,
} from "lucide-react";
import { VAvatar, wanCount } from "./shared";
import "./image-viewer.css";

const parseWan = (s: string) => {
  const m = /^([\d.]+)万$/.exec(s.trim());
  return m ? Math.round(parseFloat(m[1]) * 10000) : parseInt(s, 10) || 0;
};

export function ImageViewer({
  images,
  index,
  setIndex,
  sender,
  avatar,
  owner,
  reposts,
  comments,
  likes,
  onClose,
}: {
  images: string[];
  index: number;
  setIndex: (i: number) => void;
  sender: string;
  avatar?: string;
  owner?: string;
  reposts: string;
  comments: string;
  likes: string;
  onClose: () => void;
}) {
  const touch = useRef<{ x: number; y: number; id: number } | null>(null);
  const endTouch = () => {
    touch.current = null;
  };
  const [closing, setClosing] = useState(false);
  // 延迟卸载：避免 touchend 后的合成 click 穿透到底层图片、又把查看器打开
  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 320);
  };
  const [liked, setLiked] = useState(false),
    [reposted, setReposted] = useState(false),
    [commented, setCommented] = useState(false);
  const likeBase = parseWan(likes),
    repostBase = parseWan(reposts),
    commentBase = parseWan(comments);
  const go = (d: number) => {
    const n = images.length;
    if (n) setIndex((index + d + n) % n);
  };
  return (
    <div
      className={"image-viewer" + (closing ? " is-closing" : "")}
      role="dialog"
      aria-label="查看图片"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <header className="image-viewer-top">
        <span className="image-viewer-index">
          {index + 1} / {images.length}
        </span>
        <span className="image-viewer-author">
          <VAvatar name={sender} src={avatar} gold={sender === owner} />
          <strong>{sender}</strong>
        </span>
        <span className="image-viewer-top-actions">
          <button aria-label="识别图片">
            <ScanSearch size={22} />
          </button>
          <button aria-label="更多选项">
            <MoreHorizontal size={24} />
          </button>
        </span>
      </header>
      <div
        className="image-viewer-stage"
        onPointerDown={(e) => {
          if (!e.isPrimary) return;
          touch.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        }}
        onPointerCancel={endTouch}
        onPointerLeave={endTouch}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onPointerUp={(e) => {
          const start = touch.current;
          touch.current = null;
          if (!start || start.id !== e.pointerId) return;
          const dx = e.clientX - start.x,
            dy = e.clientY - start.y,
            absX = Math.abs(dx),
            absY = Math.abs(dy);
          if (absX > 55 && absX > absY * 1.5) {
            go(dx < 0 ? 1 : -1);
          } else if (absX < 14 && absY < 14) {
            requestClose();
          }
        }}
      >
        <img
          className="image-viewer-img"
          alt={`${sender} 图片 ${index + 1}`}
          src={images[index]}
          draggable={false}
        />
      </div>
      <button className="image-viewer-pill">查看更多{sender}美图</button>
      <footer className="image-viewer-bottom">
        <button
          className="image-viewer-collapse"
          aria-label="收起"
          onClick={requestClose}
        >
          <ChevronDown size={20} />
        </button>
        <div className="image-viewer-actions">
          <button
            aria-label="转发图片"
            aria-pressed={reposted}
            className={reposted ? "interacted" : ""}
            onClick={() => setReposted(true)}
          >
            <Repeat2 size={22} />
            {reposted ? wanCount(repostBase + 1) : reposts}
          </button>
          <button
            aria-label="评论图片"
            aria-pressed={commented}
            className={commented ? "interacted" : ""}
            onClick={() => setCommented(true)}
          >
            <MessageCircle size={22} />
            {commented ? wanCount(commentBase + 1) : comments}
          </button>
          <button
            aria-label="赞图片"
            aria-pressed={liked}
            className={liked ? "liked" : ""}
            onClick={() => setLiked(!liked)}
          >
            <ThumbsUp size={22} fill={liked ? "currentColor" : "none"} />
            {liked ? wanCount(likeBase + 1) : likes}
          </button>
        </div>
      </footer>
    </div>
  );
}
