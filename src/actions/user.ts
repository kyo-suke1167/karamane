"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signupSchema, profileSchema, type SignupSchema } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";

// マジックナンバーを定数化してメンテナビリティUP
const BCRYPT_ROUNDS = 12; 

export async function registerUser(data: SignupSchema) {
  try {
    const parsed = signupSchema.parse(data);
    
    // 定数 BCRYPT_ROUNDS を使用
    const hashedPassword = await bcrypt.hash(parsed.password, BCRYPT_ROUNDS);
    
    await prisma.user.create({
      data: {
        name: parsed.name,
        // メールアドレスの保存時は強制的に小文字＆空白除去（重複登録のバグを防ぐ）
        email: parsed.email.toLowerCase().trim(), 
        password: hashedPassword,
      },
    });
  } catch (error: unknown) {
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("このメールアドレスは既に登録されています");
      }
    }
    
    throw error;
  }
}

export async function checkEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  return !!existingUser;
}

export async function updateProfile(formData: FormData) {
  const userId = await requireAuth();

  const rawData = {
    name: formData.get("name"),
    minNoteId: formData.get("minNoteId"),
    maxNoteId: formData.get("maxNoteId"),
  };

  const parsed = profileSchema.parse(rawData);

  await prisma.user.update({
    where: { id: userId },
    data: parsed,
  });
}

export async function saveVocalRange(minNoteId: number, maxNoteId: number) {
  const userId = await requireAuth();

  // 悪意のあるデータ（-999など）を弾く鉄壁のバリデーション
  // MIDIノート番号の一般的な範囲（0〜127）でチェックし、最小値が最大値を上回らないかも確認
  if (
    !Number.isInteger(minNoteId) ||
    !Number.isInteger(maxNoteId) ||
    minNoteId < 0 ||
    maxNoteId > 127 ||
    minNoteId > maxNoteId
  ) {
    throw new Error("不正な音域データが送信されました");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { minNoteId, maxNoteId },
  });
}