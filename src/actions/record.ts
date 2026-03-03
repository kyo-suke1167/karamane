"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-utils";

export async function addSingingRecord(data: {
  songId: number;
  score?: number | null;
  key?: number | null;
  memo?: string | null;
}) {
  const userId = await requireAuth();

  await prisma.singingRecord.create({
    data: {
      userId,
      songId: data.songId,
      score: data.score,
      key: data.key,
      memo: data.memo,
    },
  });

  revalidatePath(`/songs/${data.songId}`);
}

export async function deleteSingingRecord(recordId: number, songId: number) {
  const userId = await requireAuth();

  await prisma.singingRecord.deleteMany({
    where: {
      id: recordId,
      userId,
    },
  });

  revalidatePath(`/songs/${songId}`);
}