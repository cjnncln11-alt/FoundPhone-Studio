import { useRef, useState } from "react";
import {
  MoreHorizontal,
  Repeat2,
  MessageCircle,
  ThumbsUp,
  ScanSearch,
  ChevronDown,
} from "lucide-react";
import { Avatar } from "./shared";
import "./image-viewer.css";

export function ImageViewer({
  images,
  index,
  setIndex,
  sender,
  avatar,
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
  reposts: string;
  comments: string;
  likes: string;
  onClose: () => void;
}) {
  const [chrome, setChrome] = useState(true);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const go = (d: number) => {
    const n = images.length;
    if (n) setIndex((index + d + n) % n);
  };
  return (
    <div className="image-viewer" role="dialog" aria-label="查看图片">
      {chrome && (
        <header className="image-viewer-top">
          <span className="image-viewer-index">
            {index + 1} / {images.length}
          </span>
          <span className="image-viewer-author">
            <Avatar name={sender} src={avatar} />
            <strong>{sender}</strong>
            <i className="image-viewer-badge" aria-label="认证">
              V
            </i>
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
      )}
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
          else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) setChrome(!chrome);
        }}
      >
        <img
          className="image-viewer-img"
          alt={`${sender} 图片 ${index + 1}`}
          src={images[index]}
          draggable={false}
        />
      </div>
      {chrome && (
        <>
          <button className="image-viewer-pill">
            查看更多{sender}美图
          </button>
          <footer className="image-viewer-bottom">
            <button className="image-viewer-collapse" aria-label="收起" onClick={onClose}>
              <ChevronDown size={20} />
            </button>
            <div className="image-viewer-actions">
              <button aria-label="转发图片">
                <Repeat2 size={22} />
                {reposts}
              </button>
              <button aria-label="评论图片">
                <MessageCircle size={22} />
                {comments}
              </button>
              <button aria-label="赞图片">
                <ThumbsUp size={22} />
                {likes}
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
