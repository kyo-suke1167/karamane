"use server";

import { prisma } from "@/lib/prisma";
import { SongStatus } from "@/generated/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { z } from "zod";
import { parseYouTubeTitle, extractPlaylistId, extractVideoId } from "@/lib/youtubeUtils";

// ==========================================
// 定数（マジックナンバーの排除）
// ==========================================
const YOUTUBE_MAX_PAGES = 20; // プレイリスト取得の最大ページ数

// ==========================================
// Zodスキーマ（インポートデータのバリデーション）
// ==========================================
const importSongSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  artist: z.string().min(1, "アーティスト名は必須です"),
  youtubeUrl: z.string().url("無効なURLです"),
  status: z.nativeEnum(SongStatus),
  key: z.number().int(),
  memo: z.string(),
});

const importSongsArraySchema = z.array(importSongSchema);

// ==========================================
// 型定義
// ==========================================
type YoutubeApiItem = {
  snippet: {
    title: string;
    channelTitle?: string;
    videoOwnerChannelTitle?: string;
    // プレイリストの時だけ存在するのでオプショナル（?）にする
    resourceId?: { videoId: string }; 
  };
};

type YoutubeApiResponse = {
  error?: { message: string };
  items?: YoutubeApiItem[];
  nextPageToken?: string;
};

// ==========================================
// サーバーアクション
// ==========================================

export async function fetchYoutubePlaylist(url: string) {
  const playlistId = extractPlaylistId(url);
  if (!playlistId)
    return {
      error: "無効なYouTubeプレイリストURLです。「list=...」が含まれているか確認してください。",
    };

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey)
    return { error: "APIキーが設定されていません。管理者に連絡してください。" };

  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return { error: "ログインしてください" };
  }

  const existingSongs = await prisma.song.findMany({
    where: { userId, youtubeUrl: { not: null } },
    select: { youtubeUrl: true },
  });
  const existingUrls = existingSongs
    .map((s) => s.youtubeUrl)
    .filter(Boolean) as string[];

  try {
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`,
      { cache: "no-store" },
    );
    const playlistData = (await playlistRes.json()) as YoutubeApiResponse;

    if (playlistData.error) {
      return { error: `YouTube APIエラー: ${playlistData.error.message}` };
    }

    const playlistTitle = playlistData.items?.[0]?.snippet?.title || "インポートしたセットリスト";

    let allItems: YoutubeApiItem[] = [];
    let nextPageToken = "";
    let pageCount = 0;

    do {
      const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;

      const itemsRes = await fetch(apiUrl, { cache: "no-store" });
      const itemsData = (await itemsRes.json()) as YoutubeApiResponse;

      if (!itemsData.items) {
        if (pageCount === 0)
          return { error: "プレイリストが取得できませんでした。限定公開か公開設定になっているか確認してください。" };
        break;
      }

      allItems = [...allItems, ...itemsData.items];
      nextPageToken = itemsData.nextPageToken || "";
      pageCount++;
    } while (nextPageToken && pageCount < YOUTUBE_MAX_PAGES);

    const songs = allItems
      .map((item: YoutubeApiItem) => {
        const rawTitle = item.snippet.title;
        if (rawTitle === "Private video" || rawTitle === "Deleted video") return null;

        // オプショナルチェーン（?.）を使い、無ければスキップする
        const videoId = item.snippet.resourceId?.videoId;
        if (!videoId) return null;
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const channelTitle = item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle || "";

        // 共通関数を採用
        const { title: finalTitle, artist: finalArtist } = parseYouTubeTitle(rawTitle, channelTitle);

        const isDuplicate = existingUrls.includes(youtubeUrl);

        return {
          title: finalTitle,
          artist: finalArtist,
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
  // 認証チェック
  try {
    await requireAuth();
  } catch {
    return { error: "ログインしてください" };
  }

  const videoId = extractVideoId(url);
  if (!videoId) return { error: "無効なYouTube動画URLです。" };

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return { error: "APIキーが設定されていません。" };

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`,
      { cache: "no-store" },
    );
    const data = (await res.json()) as YoutubeApiResponse;

    if (data.error) return { error: `YouTube APIエラー: ${data.error.message}` };
    if (!data.items || data.items.length === 0) return { error: "動画が見つかりませんでした。" };

    const snippet = data.items[0].snippet;
    const rawTitle = snippet.title;
    const channelTitle = snippet.channelTitle || "";

    // 共通関数を採用
    const parsed = parseYouTubeTitle(rawTitle, channelTitle);

    return parsed;
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
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return { error: "ログインしてください" };
  }

  if (songs.length === 0) return { error: "保存する曲がありません" };

  // クライアントから送られてきたデータをZodで厳密にチェック
  const validationResult = importSongsArraySchema.safeParse(songs);
  if (!validationResult.success) {
    console.error("Validation Error:", validationResult.error);
    return { error: "不正なデータが含まれています。" };
  }
  const validSongs = validationResult.data;

  try {
    const createdSongs = await prisma.song.createManyAndReturn({
      data: validSongs.map((song) => ({
        title: song.title,
        artist: song.artist,
        youtubeUrl: song.youtubeUrl,
        status: song.status,
        key: song.key,
        memo: song.memo,
        userId,
      })),
    });

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