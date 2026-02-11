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
  type SignupSchema,
  type SongSchema 
} from "@/lib/schema";

// ==========================================
// ユーザー登録
// ==========================================
export async function registerUser(data: SignupSchema) {
  // Zodで検証 & 整形 (小文字化など)
  const parsed = signupSchema.parse(data);

  // 重複チェック
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.email },
  });
  if (existingUser) {
    throw new Error("そのメールアドレスは既に使われています！");
  }

  // パスワードハッシュ化
  const hashedPassword = await bcrypt.hash(parsed.password, 10);

  // 作成
  await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      password: hashedPassword,
      minNoteId: parsed.minNoteId,
      maxNoteId: parsed.maxNoteId,
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
      userId: (session.user as any).id,
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

  const rawData = {
    title: formData.get("title"),
    artist: formData.get("artist"),
    youtubeUrl: formData.get("youtubeUrl"),
    memo: formData.get("memo"),
    status: formData.get("status"),
    minNoteId: formData.get("minNoteId"),
    maxNoteId: formData.get("maxNoteId"),
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
    where: { id: (session.user as any).id },
    data: parsed,
  });
}