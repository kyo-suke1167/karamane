"use client";

import { updateSong, deleteSong } from "@/actions/song";
import { NOTE_OPTIONS } from "@/lib/noteUtils";
import { useState } from "react";
import Link from "next/link";
import type { Song } from "@/generated/prisma";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { songSchema, type SongSchema } from "@/lib/schema";

type Props = {
  song: Song;
};

export default function EditSongForm({ song }: Props) {
  const [serverError, setServerError] = useState("");

  // RHF + Zod のセットアップ
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SongSchema>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: song.title,
      artist: song.artist,
      youtubeUrl: song.youtubeUrl || "",
      status: song.status as SongSchema["status"],
      minNoteId: song.minNoteId,
      maxNoteId: song.maxNoteId,
      memo: song.memo || "",
    },
    mode: "onChange",
  });

  // 送信処理（Zodを通った安全なデータだけがくる）
  const onSubmit = async (data: SongSchema) => {
    setServerError("");

    const result = await updateSong(song.id, data);
    
    if (result?.error) {
      setServerError(result.error);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = confirm("本当にこの曲を削除してもいいですか？");
    if (isConfirmed) {
      const result = await deleteSong(song.id);
      if (result?.error) {
        alert(result.error);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6 transition-colors"
    >
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          曲名 <span className="text-red-500">*</span>
        </label>
        <input
          {...register("title")}
          type="text"
          className={`w-full bg-background text-foreground border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-colors placeholder:text-muted-foreground
            ${errors.title ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-ring"}`}
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1 font-bold">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          アーティスト <span className="text-red-500">*</span>
        </label>
        <input
          {...register("artist")}
          type="text"
          className={`w-full bg-background text-foreground border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-colors placeholder:text-muted-foreground
            ${errors.artist ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-ring"}`}
        />
        {errors.artist && (
          <p className="text-red-500 text-xs mt-1 font-bold">
            {errors.artist.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          YouTube URL
        </label>
        <input
          {...register("youtubeUrl")}
          type="url"
          className={`w-full bg-background text-foreground border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-colors placeholder:text-muted-foreground
            ${errors.youtubeUrl ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-ring"}`}
        />
        {errors.youtubeUrl && (
          <p className="text-red-500 text-xs mt-1 font-bold">
            {errors.youtubeUrl.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          今のレベル
        </label>
        <div className="flex flex-col sm:flex-row gap-4 text-foreground">
          <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border p-3 rounded-lg hover:bg-muted transition-colors has-checked:bg-blue-50 dark:has-checked:bg-blue-900/20 has-checked:border-blue-300 dark:has-checked:border-blue-700">
            <input
              {...register("status")}
              type="radio"
              value="PRACTICING"
              className="accent-blue-500"
            />
            <span className="font-bold">🔰 練習中</span>
          </label>
          <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border p-3 rounded-lg hover:bg-muted transition-colors has-checked:bg-green-50 dark:has-checked:bg-green-900/20 has-checked:border-green-300 dark:has-checked:border-green-700">
            <input
              {...register("status")}
              type="radio"
              value="LEARNED"
              className="accent-green-500"
            />
            <span className="font-bold">🎤 持ち歌</span>
          </label>
          <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border p-3 rounded-lg hover:bg-muted transition-colors has-checked:bg-primary/10 has-checked:border-primary/50">
            <input
              {...register("status")}
              type="radio"
              value="MASTERED"
              className="accent-primary"
            />
            <span className="font-bold">👑 十八番</span>
          </label>
        </div>
      </div>

      {/* 共通の音域エラー表示 */}
      {errors.minNoteId && (
        <div className="text-red-500 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center border border-red-200 dark:border-red-800/50">
          ⚠️ {errors.minNoteId.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            最低音
          </label>
          <div className="relative">
            <select
              {...register("minNoteId")}
              className={`w-full border rounded-lg px-4 py-2 appearance-none outline-none cursor-pointer text-foreground transition-colors ${
                errors.minNoteId
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-border bg-background"
              }`}
            >
              <option value="" className="bg-background text-foreground">
                未設定
              </option>
              {NOTE_OPTIONS.map((note) => (
                <option
                  key={note.id}
                  value={note.value}
                  className="bg-background text-foreground"
                >
                  {note.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">
              ▼
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            最高音
          </label>
          <div className="relative">
            <select
              {...register("maxNoteId")}
              className={`w-full border rounded-lg px-4 py-2 appearance-none outline-none cursor-pointer text-foreground transition-colors ${
                errors.minNoteId
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-border bg-background"
              }`}
            >
              <option value="" className="bg-background text-foreground">
                未設定
              </option>
              {NOTE_OPTIONS.map((note) => (
                <option
                  key={note.id}
                  value={note.value}
                  className="bg-background text-foreground"
                >
                  {note.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">
              ▼
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          メモ
        </label>
        <textarea
          {...register("memo")}
          rows={4}
          className={`w-full bg-background text-foreground border rounded-lg px-4 py-2 focus:ring-2 outline-none resize-none transition-colors placeholder:text-muted-foreground
            ${errors.memo ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-ring"}`}
        />
        {errors.memo && (
          <p className="text-red-500 text-xs mt-1 font-bold">
            {errors.memo.message}
          </p>
        )}
      </div>

      {serverError && (
        <div className="text-red-500 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center border border-red-200 dark:border-red-800/50">
          ⚠️ {serverError}
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-4 pt-6 border-t border-border mt-6">
        <button
          type="button"
          onClick={handleDelete}
          className="text-red-500 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
        >
          この曲を削除する
        </button>

        <div className="flex gap-3 w-full sm:w-auto">
          <Link
            href={`/songs/${song.id}`}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors font-bold"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold transition-colors shadow-md ${
              !isValid || isSubmitting
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                : "bg-primary text-primary-foreground hover:bg-primary-hover"
            }`}
          >
            {isSubmitting ? "更新中..." : "更新する"}
          </button>
        </div>
      </div>
    </form>
  );
}