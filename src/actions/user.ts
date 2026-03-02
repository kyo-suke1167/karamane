"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { signupSchema, profileSchema, type SignupSchema } from "@/lib/schema";

export async function registerUser(data: SignupSchema) {
  const parsed = signupSchema.parse(data);
  const hashedPassword = await bcrypt.hash(parsed.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      password: hashedPassword,
    },
  });
}

export async function checkEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  return !!existingUser;
}

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

export async function saveVocalRange(minNoteId: number, maxNoteId: number) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("ログインしてください");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { minNoteId, maxNoteId },
  });
}
