"use server";

import { prisma } from "../lib/prisma";
import { redirect } from "next/navigation";
import { SongStatus } from "@/generated/prisma";

export async function createSong(formData: FormData) {
  const title = formData.get("title") as string;
  const artist = formData.get("artist") as string;
  const youtubeUrl = formData.get("youtubeUrl") as string;
  
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
      status,
      minNoteId,
      maxNoteId,
      userId: "user_1",
    },
  });

  redirect("/");
}