"use server";

import { prisma } from "../lib/prisma";
import { redirect } from "next/navigation";

export async function createSong(formData: FormData) {
  const title = formData.get("title") as string;
  const artist = formData.get("artist") as string;
  const youtubeUrl = formData.get("youtubeUrl") as string;
  
  const minNoteId = Number(formData.get("minNoteId")) || 60;
  const maxNoteId = Number(formData.get("maxNoteId")) || 72;

  if (!title || !artist) {
    throw new Error("タイトルとアーティストは必須");
  }

  await prisma.song.create({
    data: {
      title,
      artist,
      youtubeUrl,
      minNoteId,
      maxNoteId,
      userId: "user_1",
    },
  });

  redirect("/");
}