"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addSingingRecord(data: {
  songId: number;
  score?: number | null;
  key?: number | null;
  memo?: string | null;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("ログインしてください");

  await prisma.singingRecord.create({
    data: {
      userId: session.user.id,
      songId: data.songId,
      score: data.score,
      key: data.key,
      memo: data.memo,
    },
  });

  revalidatePath(`/songs/${data.songId}`);
}

export async function deleteSingingRecord(recordId: number, songId: number) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("ログインしてください");

  await prisma.singingRecord.delete({
    where: {
      id: recordId,
      userId: session.user.id,
    },
  });

  revalidatePath(`/songs/${songId}`);
}