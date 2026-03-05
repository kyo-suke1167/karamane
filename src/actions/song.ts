"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { songSchema, type SongSchema } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";

export async function createSong(data: SongSchema) {
  const userId = await requireAuth();

  try {
    const parsed = songSchema.parse(data);

    await prisma.song.create({
      data: { ...parsed, userId },
    });
  } catch (error) {
    console.error("createSong error:", error);
    return { error: "曲の登録に失敗しました。入力内容を確認してください。" };
  }

  redirect("/");
}

export async function updateSong(id: number, data: SongSchema) {
  const userId = await requireAuth();

  try {
    const parsed = songSchema.parse(data);

    const result = await prisma.song.updateMany({
      where: { id, userId },
      data: parsed,
    });

    if (result.count === 0) {
      return { error: "曲が見つからないか、更新する権限がありません" };
    }
  } catch (error) {
    console.error("updateSong error:", error);
    return { error: "曲の更新に失敗しました。入力内容を確認してください。" };
  }

  redirect(`/songs/${id}`);
}

export async function updateSongKey(songId: number, newKey: number) {
  const userId = await requireAuth();

  try {
    const result = await prisma.song.updateMany({
      where: { id: songId, userId },
      data: { key: newKey },
    });

    if (result.count === 0) {
      return { error: "曲が見つからないか、更新する権限がありません" };
    }
    return { success: true };
  } catch (error) {
    console.error("updateSongKey error:", error);
    return { error: "キーの更新に失敗しました" };
  }
}

export async function deleteSong(songId: number) {
  const userId = await requireAuth();

  try {
    const result = await prisma.song.deleteMany({
      where: { id: songId, userId },
    });

    if (result.count === 0) {
      return { error: "曲が見つからないか、削除する権限がありません" };
    }
  } catch (error) {
    console.error("deleteSong error:", error);
    return { error: "曲の削除に失敗しました" };
  }

  redirect("/");
}

export async function getUserSongsForModal() {
  try {
    const userId = await requireAuth();
    return await prisma.song.findMany({
      where: { userId },
      select: { id: true, title: true, artist: true, status: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function deleteSongs(songIds: number[]) {
  const userId = await requireAuth();

  try {
    await prisma.song.deleteMany({
      where: {
        id: { in: songIds },
        userId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("deleteSongs error:", error);
    return { error: "曲の一括削除に失敗しました" };
  }
}