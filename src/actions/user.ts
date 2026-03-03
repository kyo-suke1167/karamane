"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signupSchema, profileSchema, type SignupSchema } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";

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

  await prisma.user.update({
    where: { id: userId },
    data: { minNoteId, maxNoteId },
  });
}