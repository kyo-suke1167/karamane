"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { songSchema, type SongSchema } from "@/lib/schema";

export async function createSong(data: SongSchema) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("ログインしてください");

  const parsed = songSchema.parse(data);

  await prisma.song.create({
    data: { ...parsed, userId: session.user.id },
  });

  redirect("/");
}

export async function updateSong(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id || isNaN(id)) throw new Error("IDが存在しません");

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

export async function updateSongKey(songId: number, newKey: number) {
  await prisma.song.update({
    where: { id: songId },
    data: { key: newKey },
  });
}

export async function deleteSong(songId: number) {
  await prisma.song.delete({ where: { id: songId } });
  redirect("/");
}

export async function getUserSongsForModal() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return [];

  return await prisma.song.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true, artist: true, status: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteSongs(songIds: number[]) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("ログインしてください");

  await prisma.song.deleteMany({
    where: {
      id: { in: songIds },
      userId: session.user.id,
    },
  });
}