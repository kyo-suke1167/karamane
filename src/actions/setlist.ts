"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { setlistSchema, type SetlistSchema } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";

export async function createSetlist(data: SetlistSchema) {
  const userId = await requireAuth();
  const parsed = setlistSchema.parse(data);

  const setlist = await prisma.setlist.create({
    data: {
      title: parsed.title,
      description: parsed.description,
      userId,
    },
  });

  redirect(`/setlists/${setlist.id}`);
}

export async function updateSetlist(id: number, data: SetlistSchema) {
  const userId = await requireAuth();
  const parsed = setlistSchema.parse(data);
  
  const result = await prisma.setlist.updateMany({
    where: { id, userId },
    data: parsed,
  });

  if (result.count === 0) {
    throw new Error("セットリストが存在しないか、更新する権限がありません。");
  }
}

export async function deleteSetlist(id: number) {
  const userId = await requireAuth();
  
  const result = await prisma.setlist.deleteMany({
    where: { id, userId },
  });

  if (result.count === 0) {
    throw new Error("セットリストが存在しないか、削除する権限がありません。");
  }
  
  redirect("/setlists");
}

export async function addSongToSetlist(setlistId: number, songId: number) {
  const userId = await requireAuth();

  const setlist = await prisma.setlist.findFirst({
    where: { id: setlistId, userId },
  });
  if (!setlist) throw new Error("セトリの権限がありません");

  // 100曲制限チェック
  const currentCount = await prisma.setlistEntry.count({ where: { setlistId } });
  if (currentCount >= 100) {
    throw new Error("1つのセットリストに登録できるのは最大100曲までです。");
  }

  // この曲（songId）が本当に自分のものかチェック
  const song = await prisma.song.findUnique({
    where: { id: songId, userId },
  });
  if (!song) throw new Error("他人の曲は追加できません");

  const maxOrderEntry = await prisma.setlistEntry.findFirst({
    where: { setlistId },
    orderBy: { order: "desc" },
  });

  const nextOrder = maxOrderEntry ? maxOrderEntry.order + 1 : 0;

  await prisma.setlistEntry.create({
    data: { setlistId, songId, order: nextOrder },
  });
}

export async function removeSongFromSetlist(entryId: number) {
  const userId = await requireAuth();

  await prisma.setlistEntry.deleteMany({
    where: { 
      id: entryId,
      setlist: { userId }
    },
  });
}

export async function reorderSetlist(items: { id: number; order: number }[]) {
  const userId = await requireAuth();

  await prisma.$transaction(
    async (tx) => {
      // 大量データでも安全なチャンク処理
      const chunkSize = 50;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map((item) =>
            tx.setlistEntry.updateMany({
              where: { 
                id: item.id,
                setlist: { userId }
              },
              data: { order: item.order },
            }),
          )
        );
      }
    },
    { 
      timeout: 60000 
    }
  );
}

export async function removeSongsFromSetlist(entryIds: number[]) {
  if (entryIds.length === 0) return;
  const userId = await requireAuth();

  await prisma.setlistEntry.deleteMany({
    where: { 
      id: { in: entryIds },
      setlist: { userId }
    },
  });
}

export async function addSongsToSetlist(setlistId: number, songIds: number[]) {
  if (songIds.length === 0) return;
  const userId = await requireAuth();

  const setlist = await prisma.setlist.findFirst({
    where: { id: setlistId, userId },
  });
  if (!setlist) throw new Error("権限がありません");

  // 100曲制限チェック
  const currentCount = await prisma.setlistEntry.count({ where: { setlistId } });
  if (currentCount + songIds.length > 100) {
    throw new Error(`セットリストの上限は100曲です（現在: ${currentCount}曲、追加予定: ${songIds.length}曲）。`);
  }

  // 送られてきた複数の曲（songIds）が、全部自分のものかチェック
  const validSongsCount = await prisma.song.count({
    where: {
      id: { in: songIds },
      userId: userId, 
    },
  });

  if (validSongsCount !== songIds.length) {
    throw new Error("不正な曲が含まれています。他人の曲は追加できません。");
  }

  const maxOrderEntry = await prisma.setlistEntry.findFirst({
    where: { setlistId },
    orderBy: { order: "desc" },
  });

  const nextOrder = maxOrderEntry ? maxOrderEntry.order + 1 : 0;

  await prisma.setlistEntry.createMany({
    data: songIds.map((songId, index) => ({
      setlistId,
      songId,
      order: nextOrder + index,
    })),
  });
}