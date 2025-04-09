import { VideoItem } from "../components/NextVideoBox";

export const fetchMeta = async (url: string): Promise<VideoItem | null> => {
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
