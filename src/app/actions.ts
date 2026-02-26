"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { 
  signupSchema, 
  songSchema, 
  profileSchema, 
  setlistSchema,
  type SignupSchema,
  type SongSchema,
  type SetlistSchema
} from "@/lib/schema";

import { SongStatus } from "@/generated/prisma";

// ==========================================
// ユーザー登録
// ==========================================
export async function registerUser(data: SignupSchema) {
  // Zodで検証 & 整形 (小文字化など)
  const parsed = signupSchema.parse(data);

  // パスワードハッシュ化
  const hashedPassword = await bcrypt.hash(parsed.password, 10);

  // 作成
  await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      password: hashedPassword,
    },
  });
}

// メール重複確認用
export async function checkEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  return !!existingUser;
}

// ==========================================
// 曲の作成
// ==========================================
export async function createSong(data: SongSchema) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("ログインしてください");

  const parsed = songSchema.parse(data);

  await prisma.song.create({
    data: {
      ...parsed,
      userId: session.user.id,
    },
  });
  
  redirect("/");
}

// ==========================================
// 曲の更新
// ==========================================
export async function updateSong(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id || isNaN(id)) throw new Error("IDが存在しません");

  // 空文字が送られてきたら null として扱う
  const rawMinNoteId = formData.get("minNoteId");
  const rawMaxNoteId = formData.get("maxNoteId");

  const rawData = {
    title: formData.get("title"),
    artist: formData.get("artist"),
    youtubeUrl: formData.get("youtubeUrl"),
    memo: formData.get("memo"),
    status: formData.get("status"),
    minNoteId: rawMinNoteId === "" ? null : rawMinNoteId,
    maxNoteId: rawMaxNoteId === "" ? null : rawMaxNoteId,
  };

  const parsed = songSchema.parse(rawData);

  await prisma.song.update({
    where: { id },
    data: parsed,
  });

  redirect(`/songs/${id}`);
}

// キー変更 (シンプルなのでそのまま)
export async function updateSongKey(songId: number, newKey: number) {
  await prisma.song.update({
    where: { id: songId },
    data: { key: newKey },
  });
}

// 曲の削除
export async function deleteSong(songId: number) {
  await prisma.song.delete({ where: { id: songId } });
  redirect("/");
}

// ==========================================
// プロフィール更新
// ==========================================
export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("ログインしてください");

  const rawData = {
    name: formData.get("name"),
    minNoteId: formData.get("minNoteId"),
    maxNoteId: formData.get("maxNoteId"),
  };

  const parsed = profileSchema.parse(rawData);

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed,
  });
}

// ==========================================
// セットリスト操作 (Create / Update / Delete)
// ==========================================

// 1. セットリスト作成
export async function createSetlist(data: SetlistSchema) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("ログインしてください");

  const parsed = setlistSchema.parse(data);

  const setlist = await prisma.setlist.create({
    data: {
      title: parsed.title,
      description: parsed.description,
      userId: session.user.id,
    },
  });

  redirect(`/setlists/${setlist.id}`); // 作成したらその詳細ページへ
}

// 2. セットリスト情報更新 (タイトル・説明)
export async function updateSetlist(id: number, data: SetlistSchema) {
  const parsed = setlistSchema.parse(data);

  await prisma.setlist.update({
    where: { id },
    data: parsed,
  });

  // リダイレクトはせず、今のページを更新
}

// 3. セットリスト削除
export async function deleteSetlist(id: number) {
  await prisma.setlist.delete({
    where: { id },
  });
  redirect("/setlists");
}

// ==========================================
// セットリストの中身操作 (Add / Remove / Reorder)
// ==========================================

// 4. 曲をセットリストに追加
export async function addSongToSetlist(setlistId: number, songId: number) {
  // 現在の最大 order (順番) を取得して、その次に追加する
  const maxOrderEntry = await prisma.setlistEntry.findFirst({
    where: { setlistId },
    orderBy: { order: "desc" },
  });

  const nextOrder = maxOrderEntry ? maxOrderEntry.order + 1 : 0;

  await prisma.setlistEntry.create({
    data: {
      setlistId,
      songId,
      order: nextOrder,
    },
  });
}

// 5. 曲をセットリストから削除
export async function removeSongFromSetlist(entryId: number) {
  await prisma.setlistEntry.delete({
    where: { id: entryId },
  });
}

// 6. 順番を並べ替え (ドラッグ＆ドロップ用)
// items: { id: setlistEntryId, order: 新しい順番 } の配列を受け取る
export async function reorderSetlist(items: { id: number; order: number }[]) {
  // トランザクションで一気に更新！ (途中で失敗したら全部ロールバックされる)
  await prisma.$transaction(
    items.map((item) =>
      prisma.setlistEntry.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );
}

// 7. 一括削除機能
export async function removeSongsFromSetlist(entryIds: number[]) {
  if (entryIds.length === 0) return;
  
  await prisma.setlistEntry.deleteMany({
    where: { 
      id: { in: entryIds }
    },
  });
}

// 8. 曲を一括でセットリストに追加
export async function addSongsToSetlist(setlistId: number, songIds: number[]) {
  if (songIds.length === 0) return;

  // 現在の最大orderを取得
  const maxOrderEntry = await prisma.setlistEntry.findFirst({
    where: { setlistId },
    orderBy: { order: "desc" },
  });

  const nextOrder = maxOrderEntry ? maxOrderEntry.order + 1 : 0;

  await prisma.setlistEntry.createMany({
    data: songIds.map((songId, index) => ({
      setlistId,
      songId,
      order: nextOrder + index, // 順番をずらしながら登録
    })),
  });
}

// ==========================================
// 音域測定からの直接保存用
// ==========================================
export async function saveVocalRange(minNoteId: number, maxNoteId: number) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("ログインしてください");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      minNoteId, 
      maxNoteId 
    },
  });
}

// ==========================================
// YouTube プレイリスト取得・解析機能
// ==========================================

// URLからプレイリストIDを抜き出すヘルパー関数
function extractPlaylistId(url: string) {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export async function fetchYoutubePlaylist(url: string) {
  const playlistId = extractPlaylistId(url);
  if (!playlistId) return { error: "無効なYouTubeプレイリストURLです。「list=...」が含まれているか確認してください。" };

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return { error: "APIキーが設定されていません。管理者に連絡してください。" };

  // YouTube URLの重複チェック
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  let existingUrls: string[] = [];

  if (userId) {
    const existingSongs = await prisma.song.findMany({
      where: { userId, youtubeUrl: { not: null } },
      select: { youtubeUrl: true }
    });
    existingUrls = existingSongs.map(s => s.youtubeUrl).filter(Boolean) as string[];
  }

  try {
    // 1. プレイリスト自体の情報（タイトル）を取得
    const playlistRes = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`, { cache: "no-store" });
    const playlistData = await playlistRes.json();
    
    // API側からエラーが返ってきた場合
    if (playlistData.error) {
      console.error("YouTube API Error:", playlistData.error);
      return { error: `YouTube APIエラー: ${playlistData.error.message}` };
    }

    const playlistTitle = playlistData.items?.[0]?.snippet?.title || "インポートしたセットリスト";

    // 2. プレイリストの中身（動画リスト）を取得（最大50件）
    const itemsRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`, { cache: "no-store" });
    const itemsData = await itemsRes.json();

    if (!itemsData.items) return { error: "プレイリストが取得できませんでした。限定公開か公開設定になっているか確認してください。" };

    // 3. 動画データをKaramane用の曲データに変換＆タイトル解析
    const songs = itemsData.items.map((item: any) => {
      const rawTitle = item.snippet.title;
      if (rawTitle === "Private video" || rawTitle === "Deleted video") return null;

      const videoId = item.snippet.resourceId.videoId;
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      const channelTitle = item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle || "";

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

      title = title.replace(/Official|Music Video|MV|Lyric Video|Audio/gi, "")
                   .replace(/【.*?】/g, "")
                   .replace(/\[.*?\]/g, "")
                   .replace(/[()（）]/g, "")
                   .trim();
      
      artist = artist.replace(/Official|Channel/gi, "").trim();
      
      const cleanChannelName = channelTitle.replace(/ - Topic|Official|Channel|公式/gi, "").trim();

      const finalArtist = artist || cleanChannelName;
      let finalTitle = title;

      if (finalArtist && finalTitle.includes(finalArtist) && finalTitle !== finalArtist) {
        finalTitle = finalTitle.replace(finalArtist, "").trim();
        finalTitle = finalTitle.replace(/^[-\s/・〜]+|[-\s/・〜]+$/g, "").trim();
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
    }).filter(Boolean);

    return { playlistTitle, songs };

  } catch (error: any) {
    console.error("YouTube System Error:", error);
    return { error: "システムエラーが発生しました。取得に失敗しました。" };
  }
}

// ==========================================
// YouTubeからの一括保存＆セトリ作成機能
// ==========================================


type ImportSongData = {
  title: string;
  artist: string;
  youtubeUrl: string;
  status: SongStatus;
  key: number;
  memo: string;
};

export async function saveImportedSongs(songs: ImportSongData[], setlistTitle?: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("ログインしてください");
  const userId = session.user.id;

  if (songs.length === 0) return;

  // 1. 曲を一括でDBに保存する
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
      })
    )
  );

  // 2. セトリ作成がON（タイトルがある）なら、セトリを作成
  if (setlistTitle) {
    const setlist = await prisma.setlist.create({
      data: {
        title: setlistTitle,
        description: "YouTubeからインポート",
        userId,
      },
    });

    // 3. 作ったセトリに、さっき保存した曲を順番通りに紐付ける
    await prisma.setlistEntry.createMany({
      data: createdSongs.map((song, index) => ({
        setlistId: setlist.id,
        songId: song.id,
        order: index,
      })),
    });
  }

  // 終わったらトップページへ
  redirect("/");
}