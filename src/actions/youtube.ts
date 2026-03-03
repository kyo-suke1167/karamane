"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SongStatus } from "@/generated/prisma";

function extractPlaylistId(url: string) {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function extractVideoId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?]+)/,
  );
  return match ? match[1] : null;
}

type YoutubePlaylistItem = {
  snippet: {
    title: string;
    resourceId: { videoId: string };
    videoOwnerChannelTitle?: string;
    channelTitle?: string;
  };
};

export async function fetchYoutubePlaylist(url: string) {
  const playlistId = extractPlaylistId(url);
  if (!playlistId)
    return {
      error:
        "無効なYouTubeプレイリストURLです。「list=...」が含まれているか確認してください。",
    };

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey)
    return { error: "APIキーが設定されていません。管理者に連絡してください。" };

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  let existingUrls: string[] = [];

  if (userId) {
    const existingSongs = await prisma.song.findMany({
      where: { userId, youtubeUrl: { not: null } },
      select: { youtubeUrl: true },
    });
    existingUrls = existingSongs
      .map((s) => s.youtubeUrl)
      .filter(Boolean) as string[];
  }

  try {
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`,
      { cache: "no-store" },
    );
    const playlistData = await playlistRes.json();

    if (playlistData.error) {
      return { error: `YouTube APIエラー: ${playlistData.error.message}` };
    }

    const playlistTitle =
      playlistData.items?.[0]?.snippet?.title || "インポートしたセットリスト";

    let allItems: YoutubePlaylistItem[] = [];
    let nextPageToken = "";
    const maxPages = 20;
    let pageCount = 0;

    do {
      const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;

      const itemsRes = await fetch(apiUrl, { cache: "no-store" });
      const itemsData = await itemsRes.json();

      if (!itemsData.items) {
        if (pageCount === 0)
          return {
            error:
              "プレイリストが取得できませんでした。限定公開か公開設定になっているか確認してください。",
          };
        break; // 2ページ目以降でカラの場合はループ終了
      }

      allItems = [...allItems, ...itemsData.items];
      nextPageToken = itemsData.nextPageToken;
      pageCount++;
    } while (nextPageToken && pageCount < maxPages);

    const songs = allItems
      .map((item: YoutubePlaylistItem) => {
        const rawTitle = item.snippet.title;
        if (rawTitle === "Private video" || rawTitle === "Deleted video")
          return null;

        const videoId = item.snippet.resourceId.videoId;
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const channelTitle =
          item.snippet.videoOwnerChannelTitle ||
          item.snippet.channelTitle ||
          "";

        let title = rawTitle;
        let artist = "";

        if (rawTitle.includes(" / ")) {
          const parts = rawTitle.split(" / ");
          title = parts[0].trim();
          artist = parts[1].trim();
        } else if (rawTitle.includes(" - ")) {
          const parts = rawTitle.split(" - ");
          artist = parts[0].trim();
          title = parts[1].trim();
        } else if (rawTitle.includes("「") && rawTitle.includes("」")) {
          const match = rawTitle.match(/^(.*?)「(.*?)」/);
          if (match) {
            artist = match[1].trim();
            title = match[2].trim();
          }
        }

        title = title
          .replace(/Official|Music Video|MV|Lyric Video|Audio/gi, "")
          .replace(/【.*?】/g, "")
          .replace(/\[.*?\]/g, "")
          .replace(/[()（）]/g, "")
          .trim();

        artist = artist.replace(/Official|Channel/gi, "").trim();
        const cleanChannelName = channelTitle
          .replace(/ - Topic|Official|Channel|公式/gi, "")
          .trim();
        const finalArtist = artist || cleanChannelName;
        let finalTitle = title;

        if (
          finalArtist &&
          finalTitle.includes(finalArtist) &&
          finalTitle !== finalArtist
        ) {
          finalTitle = finalTitle.replace(finalArtist, "").trim();
          finalTitle = finalTitle
            .replace(/^[-\s/・〜]+|[-\s/・〜]+$/g, "")
            .trim();
        }

        const isDuplicate = existingUrls.includes(youtubeUrl);

        return {
          title: finalTitle || rawTitle,
          artist: finalArtist || "不明なアーティスト",
          youtubeUrl,
          status: "LEARNED",
          key: 0,
          minNoteId: null,
          maxNoteId: null,
          memo: "YouTubeからインポート",
          selected: !isDuplicate,
          isDuplicate,
        };
      })
      .filter((song): song is NonNullable<typeof song> => song !== null);

    return { playlistTitle, songs };
  } catch (error: unknown) {
    console.error("YouTube System Error:", error);
    return { error: "システムエラーが発生しました。取得に失敗しました。" };
  }
}

export async function fetchYoutubeVideo(url: string) {
  const videoId = extractVideoId(url);
  if (!videoId) return { error: "無効なYouTube動画URLです。" };

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return { error: "APIキーが設定されていません。" };

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`,
      { cache: "no-store" },
    );
    const data = await res.json();

    if (data.error)
      return { error: `YouTube APIエラー: ${data.error.message}` };
    if (!data.items || data.items.length === 0)
      return { error: "動画が見つかりませんでした。" };

    const snippet = data.items[0].snippet;
    const rawTitle = snippet.title;
    const channelTitle = snippet.channelTitle || "";

    let title = rawTitle;
    let artist = "";

    if (rawTitle.includes(" / ")) {
      const parts = rawTitle.split(" / ");
      title = parts[0].trim();
      artist = parts[1].trim();
    } else if (rawTitle.includes(" - ")) {
      const parts = rawTitle.split(" - ");
      artist = parts[0].trim();
      title = parts[1].trim();
    } else if (rawTitle.includes("「") && rawTitle.includes("」")) {
      const match = rawTitle.match(/^(.*?)「(.*?)」/);
      if (match) {
        artist = match[1].trim();
        title = match[2].trim();
      }
    }

    title = title
      .replace(/Official|Music Video|MV|Lyric Video|Audio/gi, "")
      .replace(/【.*?】/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/[()（）]/g, "")
      .trim();

    artist = artist.replace(/Official|Channel/gi, "").trim();
    const cleanChannelName = channelTitle
      .replace(/ - Topic|Official|Channel|公式/gi, "")
      .trim();
    const finalArtist = artist || cleanChannelName;
    let finalTitle = title;

    if (
      finalArtist &&
      finalTitle.includes(finalArtist) &&
      finalTitle !== finalArtist
    ) {
      finalTitle = finalTitle.replace(finalArtist, "").trim();
      finalTitle = finalTitle.replace(/^[-\s/・〜]+|[-\s/・〜]+$/g, "").trim();
    }

    return {
      title: finalTitle || rawTitle,
      artist: finalArtist || "不明なアーティスト",
    };
  } catch (error: unknown) {
    console.error("YouTube System Error:", error);
    return { error: "システムエラーが発生しました。" };
  }
}

type ImportSongData = {
  title: string;
  artist: string;
  youtubeUrl: string;
  status: SongStatus;
  key: number;
  memo: string;
};

export async function saveImportedSongs(
  songs: ImportSongData[],
  setlistTitle?: string,
): Promise<{ success?: boolean; error?: string }> {
  
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { error: "ログインしてください" };
  const userId = session.user.id;

  if (songs.length === 0) return { error: "保存する曲がありません" };

  try {
    const createdSongs = await prisma.$transaction(
      songs.map((song) =>
        prisma.song.create({
          data: {
            title: song.title,
            artist: song.artist,
            youtubeUrl: song.youtubeUrl,
            status: song.status,
            key: song.key,
            memo: song.memo,
            userId,
          },
        }),
      ),
    );

    if (setlistTitle) {
      const setlist = await prisma.setlist.create({
        data: {
          title: setlistTitle,
          description: "YouTubeからインポート",
          userId,
        },
      });

      await prisma.setlistEntry.createMany({
        data: createdSongs.map((song, index) => ({
          setlistId: setlist.id,
          songId: song.id,
          order: index,
        })),
      });
    }

    return { success: true };

  } catch (error) {
    console.error("保存中にエラー:", error);
    return { error: "データベースの保存に失敗しました。" };
  }
}