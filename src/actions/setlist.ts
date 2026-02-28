"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setlistSchema, type SetlistSchema } from "@/lib/schema";

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

  redirect(`/setlists/${setlist.id}`);
}

export async function updateSetlist(id: number, data: SetlistSchema) {
  const parsed = setlistSchema.parse(data);
  await prisma.setlist.update({
    where: { id },
    data: parsed,
  });
}

export async function deleteSetlist(id: number) {
  await prisma.setlist.delete({ where: { id } });
  redirect("/setlists");
}

export async function addSongToSetlist(setlistId: number, songId: number) {
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
  await prisma.setlistEntry.delete({ where: { id: entryId } });
}

export async function reorderSetlist(items: { id: number; order: number }[]) {
  await prisma.$transaction(
    items.map((item) =>
      prisma.setlistEntry.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    ),
  );
}

export async function removeSongsFromSetlist(entryIds: number[]) {
  if (entryIds.length === 0) return;
  await prisma.setlistEntry.deleteMany({
    where: { id: { in: entryIds } },
  });
}

export async function addSongsToSetlist(setlistId: number, songIds: number[]) {
  if (songIds.length === 0) return;

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