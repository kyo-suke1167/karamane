import { z } from "zod";

// ==========================================
// 共通ルール
// ==========================================
const emailRule = z
  .string()
  .min(1, "メールアドレスを入力してください")
  .email("正しいメールアドレスの形式ではありません")
  .trim()
  .toLowerCase();

const passwordRule = z
  .string()
  .min(8, "パスワードは8文字以上で入力してください")
  .regex(/^[\x20-\x7e]+$/, "半角英数字・記号で入力してください");

const noteIdSchema = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined || val === "null") return null;
  const parsed = Number(val);
  // 数字ではない場合や 0 の場合は null にする
  if (Number.isNaN(parsed) || parsed === 0) return null;
  return parsed;
}, z.number().nullable().optional());

// ==========================================
// 新規登録 (Sign Up)
// ==========================================
export const signupSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  email: emailRule,
  password: passwordRule,
});

export type SignupSchema = z.infer<typeof signupSchema>;

// ==========================================
// ログイン (Login)
// ==========================================
export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "パスワードを入力してください"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

// ==========================================
// 曲の登録・編集 (Song)
// ==========================================
export const songSchema = z.object({
  title: z.string().min(1, "曲名は必須です").max(100),
  artist: z.string().min(1, "アーティスト名は必須です").max(100),
  youtubeUrl: z.string().url("URLの形式が正しくありません").or(z.literal("")).optional(),
  status: z.enum(["PRACTICING", "LEARNED", "MASTERED"]),
  minNoteId: noteIdSchema,
  maxNoteId: noteIdSchema,
  memo: z.string().max(500).optional(),
}).refine((data) => {
  if (data.minNoteId != null && data.maxNoteId != null) {
    return data.minNoteId <= data.maxNoteId;
  }
  return true;
}, {
  message: "最低音は最高音より低く設定してください",
  path: ["minNoteId"],
});

export type SongSchema = z.infer<typeof songSchema>;

// ==========================================
// プロフィール編集
// ==========================================
export const profileSchema = z.object({
  name: z.string().min(1, "名前を入力してください").max(50),
  minNoteId: noteIdSchema,
  maxNoteId: noteIdSchema,
}).refine((data) => {
  if (data.minNoteId != null && data.maxNoteId != null) {
    return data.minNoteId <= data.maxNoteId;
  }
  return true;
}, {
  message: "最低音は最高音より低く設定してください",
  path: ["minNoteId"],
});

// ==========================================
// セットリスト (Setlist)
// ==========================================
export const setlistSchema = z.object({
  title: z
    .string()
    .min(1, "セットリスト名は必須です")
    .max(100, "セットリスト名は100文字以内で入力してください"),
  description: z
    .string()
    .max(500, "説明は500文字以内で入力してください")
    .optional(),
});

export type SetlistSchema = z.infer<typeof setlistSchema>;