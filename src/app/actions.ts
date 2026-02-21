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
  setlistSchema,
  type SignupSchema,
  type SongSchema,
  type SetlistSchema
} from "@/lib/schema";

// ==========================================
// ユーザー登録
// ==========================================
export async function registerUser(data: SignupSchema) {
  // Zodで検証 & 整形 (小文字化など)
  const parsed = signupSchema.parse(data);

  // パスワードハッシュ化
  const hashedPassword = await bcrypt.hash(parsed.password, 10);

  // 作成
  await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      password: hashedPassword,
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
      userId: session.user.id,
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

  // 空文字が送られてきたら null として扱う
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
    where: { id: session.user.id },
    data: parsed,
  });
}

// ==========================================
// セットリスト操作 (Create / Update / Delete)
// ==========================================

// 1. セットリスト作成
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

  redirect(`/setlists/${setlist.id}`); // 作成したらその詳細ページへ
}

// 2. セットリスト情報更新 (タイトル・説明)
export async function updateSetlist(id: number, data: SetlistSchema) {
  const parsed = setlistSchema.parse(data);

  await prisma.setlist.update({
    where: { id },
    data: parsed,
  });

  // リダイレクトはせず、今のページを更新
}

// 3. セットリスト削除
export async function deleteSetlist(id: number) {
  await prisma.setlist.delete({
    where: { id },
  });
  redirect("/setlists");
}

// ==========================================
// セットリストの中身操作 (Add / Remove / Reorder)
// ==========================================

// 4. 曲をセットリストに追加
export async function addSongToSetlist(setlistId: number, songId: number) {
  // 現在の最大 order (順番) を取得して、その次に追加する
  const maxOrderEntry = await prisma.setlistEntry.findFirst({
    where: { setlistId },
    orderBy: { order: "desc" },
  });

  const nextOrder = maxOrderEntry ? maxOrderEntry.order + 1 : 0;

  await prisma.setlistEntry.create({
    data: {
      setlistId,
      songId,
      order: nextOrder,
    },
  });
}

// 5. 曲をセットリストから削除
export async function removeSongFromSetlist(entryId: number) {
  await prisma.setlistEntry.delete({
    where: { id: entryId },
  });
}

// 6. 順番を並べ替え (ドラッグ＆ドロップ用)
// items: { id: setlistEntryId, order: 新しい順番 } の配列を受け取る
export async function reorderSetlist(items: { id: number; order: number }[]) {
  // トランザクションで一気に更新！ (途中で失敗したら全部ロールバックされる)
  await prisma.$transaction(
    items.map((item) =>
      prisma.setlistEntry.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );
}

// 7. 一括削除機能
export async function removeSongsFromSetlist(entryIds: number[]) {
  if (entryIds.length === 0) return;
  
  await prisma.setlistEntry.deleteMany({
    where: { 
      id: { in: entryIds }
    },
  });
}

// 8. 曲を一括でセットリストに追加
export async function addSongsToSetlist(setlistId: number, songIds: number[]) {
  if (songIds.length === 0) return;

  // 現在の最大orderを取得
  const maxOrderEntry = await prisma.setlistEntry.findFirst({
    where: { setlistId },
    orderBy: { order: "desc" },
  });

  const nextOrder = maxOrderEntry ? maxOrderEntry.order + 1 : 0;

  await prisma.setlistEntry.createMany({
    data: songIds.map((songId, index) => ({
      setlistId,
      songId,
      order: nextOrder + index, // 順番をずらしながら登録
    })),
  });
}

// ==========================================
// 音域測定からの直接保存用
// ==========================================
export async function saveVocalRange(minNoteId: number, maxNoteId: number) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("ログインしてください");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      minNoteId, 
      maxNoteId 
    },
  });
}