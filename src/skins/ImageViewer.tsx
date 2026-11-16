import { useRef, useState } from "react";
import {
  MoreHorizontal,
  Repeat2,
  MessageCircle,
  ThumbsUp,
  ScanSearch,
  ChevronDown,
} from "lucide-react";
import { Avatar, NameBadges, VAvatar, wanCount } from "./shared";
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
  const touch = useRef<{ x: number; y: number } | null>(null);
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
    <div className="image-viewer" role="dialog" aria-label="查看图片">
      <header className="image-viewer-top">
        <span className="image-viewer-index">
          {index + 1} / {images.length}
        </span>
        <span className="image-viewer-author">
          <VAvatar
            name={sender}
            src={avatar}
            gold={sender === owner}
          />
          <strong>{sender}</strong>
          {sender === owner && <NameBadges />}
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
          touch.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          if (!touch.current) return;
          const dx = e.clientX - touch.current.x,
            dy = e.clientY - touch.current.y;
          touch.current = null;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
          else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) onClose();
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
          onClick={onClose}
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
