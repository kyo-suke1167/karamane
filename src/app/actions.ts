"use server";

import { prisma } from "../lib/prisma";
import { redirect } from "next/navigation";
import { SongStatus } from "@/generated/prisma";

export async function createSong(formData: FormData) {
  const title = formData.get("title") as string;
  const artist = formData.get("artist") as string;
  const youtubeUrl = formData.get("youtubeUrl") as string;
  const memo = formData.get("memo") as string;
  
  const minNoteId = Number(formData.get("minNoteId")) || 60;
  const maxNoteId = Number(formData.get("maxNoteId")) || 72;
  const status = formData.get("status") as SongStatus || "LEARNED";

  if (!title || !artist) {
    throw new Error("タイトルとアーティストは必須");
  }

  if (minNoteId > maxNoteId) {
    throw new Error("音域の設定に矛盾があります。修正してください。");
  }

  await prisma.song.create({
    data: {
      title,
      artist,
      youtubeUrl,
      memo,
      status,
      minNoteId,
      maxNoteId,
      userId: "user_1",
    },
  });

  redirect("/");
}

export async function updateSongKey(songId: number, newKey: number) {

  await prisma.song.update({
    where: { id: songId },
    data: { key: newKey },
  });
}

export async function updateSong(formData: FormData) {

  const id = Number(formData.get("id"));
  
  const title = formData.get("title") as string;
  const artist = formData.get("artist") as string;
  const youtubeUrl = formData.get("youtubeUrl") as string;
  const memo = formData.get("memo") as string;
  
  const minNoteId = Number(formData.get("minNoteId"));
  const maxNoteId = Number(formData.get("maxNoteId"));
  const status = formData.get("status") as any;

  if (!id || isNaN(id)) throw new Error("IDが異常です");
  if (!title || !artist) throw new Error("タイトルとアーティストは必須です");
  if (minNoteId > maxNoteId) throw new Error("音域が逆転しています");

  await prisma.song.update({
    where: { id },
    data: {
      title,
      artist,
      youtubeUrl,
      memo,
      minNoteId,
      maxNoteId,
      status,
    },
  });

  redirect(`/songs/${id}`);
}

export async function deleteSong(songId: number) {
  if (!songId) throw new Error("IDが存在していません");

  await prisma.song.delete({
    where: { id: songId },
  });

  redirect("/");
}