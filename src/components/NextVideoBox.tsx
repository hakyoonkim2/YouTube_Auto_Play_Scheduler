/* NextVideoBox.tsx */
import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import styles from "../NextVideoBox.module.scss";
import { MAX_QUEUE, STORAGE_KEY, STORAGE_THEME_KEY } from "../utils/constants";
import { fetchMeta } from "../utils/fetchMeta";
import DropArea from "./DropArea";
import SortableItem from "./SortableItem";
import FloatingButton from "./FloatingButton";

export type VideoItem = {
  url: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelIcon: string;
};

const NextVideoBox = () => {
  const [queue, setQueue] = useState<VideoItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) setQueue(result[STORAGE_KEY]);
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

      if (videoEnded && queue.length > 0) {
        const next = queue[0];
        const newQueue = queue.slice(1);
        chrome.storage.local.set({ [STORAGE_KEY]: newQueue });
        setQueue(newQueue);
        clearInterval(intervalId);
        setTimeout(() => (window.location.href = next.url), 1000);
      }
    };

    const waitForVideo = () => {
      const video = document.querySelector("video");
      if (video) intervalId = setInterval(detectEnd, 500);
      else setTimeout(waitForVideo, 500);
    };

    waitForVideo();
    return () => clearInterval(intervalId);
  }, [queue]);

  const handleDropLink = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (queue.length >= MAX_QUEUE) return;
    const text = e.dataTransfer.getData("text/plain");
    const isValid = text.includes("youtube.com/watch") || text.includes("youtube.com/shorts");
    if (!isValid) return;

    const meta = await fetchMeta(text);
    if (meta) setQueue((prev) => [...prev, meta]);
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

  if (isFullscreen) return null;

  return (
    <>
      {!isOpen && <FloatingButton onOpen={() => setIsOpen(true)} />}
      {isOpen && (
        <div className={`${styles.container} ${styles[theme]}`}>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✖</button>
          <button
            className={styles.themeToggle}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <DropArea
            onDrop={handleDropLink}
            isFull={queue.length >= MAX_QUEUE}
          />
          <div className={styles.queueTitle}>📋 Queue</div>
          {queue.length === 0 ? (
            <p className={styles.empty}>No videos scheduled.</p>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
              <SortableContext items={queue.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
                <ul className={styles.videoList}>
                  {queue.map((item, index) => (
                    <SortableItem
                      key={index}
                      item={item}
                      index={index}
                      onClick={handleClick}
                      onDelete={handleDelete}
                    />
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