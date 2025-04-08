import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import styles from "./NextVideoBox.module.scss";

type VideoItem = {
  url: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelIcon: string;
};

const STORAGE_KEY = "yt-next-queue";
const STORAGE_THEME_KEY = "yt-next-queue-theme";
const MAX_QUEUE = 5;

const NextVideoBox = () => {
  const [queue, setQueue] = useState<VideoItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) {
        setQueue(result[STORAGE_KEY]);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ [STORAGE_KEY]: queue });
  }, [queue]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout>;

    const detectEnd = () => {
      const video = document.querySelector("video") as HTMLVideoElement | null;
      const endTitle = document.querySelector(".videowall-endscreen.ytp-show-tiles");

      const videoEnded =
        (video && !isNaN(video.duration) &&
          (video.ended ||
            video.currentTime >= video.duration - 0.5 ||
            (video.paused && video.currentTime === video.duration))) || endTitle;

      if (videoEnded) {
        if (queue.length === 0) return;

        const next = queue[0];
        const newQueue = queue.slice(1);

        chrome.storage.local.set({ [STORAGE_KEY]: newQueue });
        setQueue(newQueue);
        clearInterval(intervalId);

        setTimeout(() => {
          window.location.href = next.url;
        }, 1000);
      }
    };

    const waitForVideo = () => {
      const video = document.querySelector("video");
      if (video) {
        intervalId = setInterval(detectEnd, 500);
      } else {
        setTimeout(waitForVideo, 500);
      }
    };

    waitForVideo();
    return () => clearInterval(intervalId);
  }, [queue]);

  const fetchMeta = async (url: string): Promise<VideoItem | null> => {
    try {
      const parsedUrl = new URL(url);
      let videoId: string | null = null;

      if (parsedUrl.pathname.startsWith("/watch")) {
        videoId = parsedUrl.searchParams.get("v");
      } else if (parsedUrl.pathname.startsWith("/shorts/")) {
        videoId = parsedUrl.pathname.split("/shorts/")[1].split(/[/?#]/)[0];
      }

      if (!videoId) return null;

      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      return {
        url,
        title: data.title,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        channelName: data.author_name,
        channelIcon: `https://www.google.com/s2/favicons?domain=youtube.com`,
      };
    } catch {
      return null;
    }
  };

  const handleDropLink = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (queue.length >= MAX_QUEUE) return;

    const text = e.dataTransfer.getData("text/plain");
    const isValidYoutubeUrl =
      text.includes("youtube.com/watch") || text.includes("youtube.com/shorts");
    if (!isValidYoutubeUrl) return;

    const meta = await fetchMeta(text);
    if (meta) {
      setQueue((prev) => [...prev, meta]);
    }
  };

  const handleDelete = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClick = (index: number) => {
    const next = queue[index];
    const newQueue = queue.filter((_, i) => i !== index);
    chrome.storage.local.set({ [STORAGE_KEY]: newQueue });
    setQueue(newQueue);
    window.location.href = next.url;
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = queue.findIndex((_, i) => i.toString() === active.id);
      const newIndex = queue.findIndex((_, i) => i.toString() === over.id);
      setQueue((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  useEffect(() => {
    chrome.storage.local.get([STORAGE_THEME_KEY], (result) => {
      if (result[STORAGE_THEME_KEY] === "dark" || result[STORAGE_THEME_KEY] === "light") {
        setTheme(result[STORAGE_THEME_KEY]);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ [STORAGE_THEME_KEY]: theme });
  }, [theme]);


  const SortableItem = ({ item, index }: { item: VideoItem; index: number }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: index.toString() });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <li ref={setNodeRef} style={style} className={styles.videoItem} {...attributes}>
        <button {...listeners} className={styles.dragHandle}>⠿</button>
        <div className={styles.videoContent} onClick={() => handleClick(index)}>
          <img src={item.thumbnail} className={styles.thumbnail} alt="thumb" />
          <div className={styles.videoInfo}>
            <div className={styles.videoTitle}>{item.title}</div>
            <div className={styles.channelInfo}>
              <img src={item.channelIcon} className={styles.channelIcon} alt="channel" />
              {item.channelName}
            </div>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(index); }} className={styles.deleteBtn}>❌</button>
      </li>
    );
  };

  if (isFullscreen) return null;

  return (
    <>
      {!isOpen && (
        <button
          className={styles.floatingBtn}
          onClick={() => setIsOpen(true)}
          onDragOver={() => setIsOpen(true)}
          title="Open YouTube Queue"
        >
          ▶ Queue
        </button>
      )}

      {isOpen && (
        <div className={`${styles.container} ${styles[theme]}`}>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✖</button>
          <button
            className={styles.themeToggle}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <div
            className={styles.dropArea}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropLink}
          >
            {queue.length >= MAX_QUEUE
              ? "❌ No more items can be saved."
              : "🎯 Drag and drop a YouTube link here"}
          </div>
          <div className={styles.queueTitle}>📋 Queue</div>
          {queue.length === 0 ? (
            <p className={styles.empty}>No videos scheduled.</p>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
              <SortableContext items={queue.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
                <ul className={styles.videoList}>
                  {queue.map((item, index) => (
                    <SortableItem key={index} item={item} index={index} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </>
  );
};

export default NextVideoBox;
