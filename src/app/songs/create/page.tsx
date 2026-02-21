"use client";

import { createSong } from "@/app/actions";
import Link from "next/link";
import { NOTE_OPTIONS } from "@/lib/noteUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { songSchema, type SongSchema } from "@/lib/schema";
import { useTransition } from "react";

export default function CreateSongPage() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SongSchema>({
    resolver: zodResolver(songSchema) as any,
    defaultValues: {
      title: "",
      artist: "",
      youtubeUrl: "",
      status: "LEARNED",
      minNoteId: null ,
      maxNoteId: null ,
      memo: "",
    },
  });

  const onSubmit = (data: SongSchema) => {
    startTransition(async () => {
      await createSong(data);
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">🎤 新しい持ち歌を登録</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6 transition-colors">
        
        {/* 曲名 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">曲名 <span className="text-red-500">*</span></label>
          <input {...register("title")} type="text" placeholder="例: 怪獣の花唄" 
            className={`w-full bg-background text-foreground border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-colors placeholder:text-muted-foreground ${
              errors.title ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-900" : "border-border focus:ring-ring"
            }`} 
          />
          {errors.title && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-bold">{errors.title.message}</p>}
        </div>

        {/* アーティスト */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">アーティスト <span className="text-red-500">*</span></label>
          <input {...register("artist")} type="text" placeholder="例: Vaundy" 
            className={`w-full bg-background text-foreground border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-colors placeholder:text-muted-foreground ${
              errors.artist ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-900" : "border-border focus:ring-ring"
            }`} 
          />
          {errors.artist && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-bold">{errors.artist.message}</p>}
        </div>

        {/* YouTube URL */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">YouTube URL</label>
          <input {...register("youtubeUrl")} type="text" placeholder="https://youtu.be/..." 
            className={`w-full bg-background text-foreground border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-colors placeholder:text-muted-foreground ${
              errors.youtubeUrl ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-900" : "border-border focus:ring-ring"
            }`} 
          />
          {errors.youtubeUrl && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-bold">{errors.youtubeUrl.message}</p>}
        </div>

        {/* ステータス選択 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">今のレベル <span className="text-red-500">*</span></label>
          <div className="flex flex-col sm:flex-row gap-4 text-foreground">
            <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border p-3 rounded-lg hover:bg-muted transition-colors has-checked:bg-blue-50 dark:has-checked:bg-blue-900/20 has-checked:border-blue-300 dark:has-checked:border-blue-700">
              <input {...register("status")} type="radio" value="PRACTICING" className="accent-blue-500" />
              <span className="font-bold">🔰 練習中</span>
            </label>
            <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border p-3 rounded-lg hover:bg-muted transition-colors has-checked:bg-green-50 dark:has-checked:bg-green-900/20 has-checked:border-green-300 dark:has-checked:border-green-700">
              <input {...register("status")} type="radio" value="LEARNED" className="accent-green-500" />
              <span className="font-bold">🎤 持ち歌</span>
            </label>
            <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border p-3 rounded-lg hover:bg-muted transition-colors has-checked:bg-primary/10 has-checked:border-primary/50">
              <input {...register("status")} type="radio" value="MASTERED" className="accent-primary" />
              <span className="font-bold">👑 十八番</span>
            </label>
          </div>
          {errors.status && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-bold">{errors.status.message}</p>}
        </div>

        {/* 音域入力 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">最低音</label>
            <div className="relative">
              <select {...register("minNoteId", { setValueAs: (v) => v === "" ? null : Number(v) })} 
                className={`w-full border rounded-lg px-4 py-2 appearance-none outline-none cursor-pointer text-foreground transition-colors ${
                  errors.minNoteId ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-border bg-background"
                }`}
              >
                <option value="" className="bg-background text-foreground">未設定</option>
                {NOTE_OPTIONS.map((note) => <option key={note.id} value={note.value} className="bg-background text-foreground">{note.label}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">▼</div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">最高音</label>
            <div className="relative">
              <select {...register("maxNoteId", { setValueAs: (v) => v === "" ? null : Number(v) })} 
                className={`w-full border rounded-lg px-4 py-2 appearance-none outline-none cursor-pointer text-foreground transition-colors ${
                  errors.maxNoteId ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-border bg-background"
                }`}
              >
                <option value="" className="bg-background text-foreground">未設定</option>
                {NOTE_OPTIONS.map((note) => <option key={note.id} value={note.value} className="bg-background text-foreground">{note.label}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">▼</div>
            </div>
          </div>
        </div>
        
        {/* 音域エラー表示 */}
        {errors.minNoteId && (
          <div className="text-red-500 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-3 rounded-lg text-center transition-colors">
            ⚠️ {errors.minNoteId.message}
          </div>
        )}

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">メモ</label>
          <textarea {...register("memo")} rows={4} 
            className="w-full bg-background text-foreground border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring outline-none resize-none transition-colors placeholder:text-muted-foreground" 
          />
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
          <Link href="/" className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors font-bold">
            キャンセル
          </Link>
          <button type="submit" disabled={isPending} 
            className={`px-6 py-2 rounded-lg font-bold transition-colors shadow-md ${
              isPending 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-primary text-primary-foreground hover:bg-primary-hover"
            }`}
          >
            {isPending ? "登録中..." : "登録"}
          </button>
        </div>
      </form>
    </div>
  );
}