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
  } = useForm({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: "",
      artist: "",
      youtubeUrl: "",
      status: "LEARNED",
      minNoteId: 60,
      maxNoteId: 72,
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
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">🎤 新しい持ち歌を登録</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">曲名 <span className="text-red-500">*</span></label>
          <input {...register("title")} type="text" placeholder="例: 怪獣の花唄" className={`w-full border rounded-lg px-4 py-2 focus:ring-2 outline-none ${errors.title ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-amber-500"}`} />
          {errors.title && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">アーティスト <span className="text-red-500">*</span></label>
          <input {...register("artist")} type="text" placeholder="例: Vaundy" className={`w-full border rounded-lg px-4 py-2 focus:ring-2 outline-none ${errors.artist ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-amber-500"}`} />
          {errors.artist && <p className="text-red-500 text-xs mt-1 font-bold">{errors.artist.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
          <input {...register("youtubeUrl")} type="text" placeholder="https://youtu.be/..." className={`w-full border rounded-lg px-4 py-2 focus:ring-2 outline-none ${errors.youtubeUrl ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-amber-500"}`} />
          {errors.youtubeUrl && <p className="text-red-500 text-xs mt-1 font-bold">{errors.youtubeUrl.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">今のレベル <span className="text-red-500">*</span></label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer border-2 border-gray-400 p-3 rounded-lg hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
              <input {...register("status")} type="radio" value="PRACTICING" className="accent-blue-500" /><span>🔰 練習中</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer border-2 border-gray-400 p-3 rounded-lg hover:bg-gray-50 has-[:checked]:bg-green-50 has-[:checked]:border-green-300">
              <input {...register("status")} type="radio" value="LEARNED" className="accent-green-500" /><span>🎤 持ち歌</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer border-2 border-gray-400 p-3 rounded-lg hover:bg-gray-50 has-[:checked]:bg-amber-50 has-[:checked]:border-amber-300">
              <input {...register("status")} type="radio" value="MASTERED" className="accent-amber-500" /><span>👑 十八番</span>
            </label>
          </div>
          {errors.status && <p className="text-red-500 text-xs mt-1 font-bold">{errors.status.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最低音</label>
            <select {...register("minNoteId")} className={`w-full border rounded-lg px-4 py-2 outline-none ${errors.minNoteId ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}>
              {NOTE_OPTIONS.map((note) => <option key={note.id} value={note.value}>{note.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最高音</label>
            <select {...register("maxNoteId")} className={`w-full border rounded-lg px-4 py-2 outline-none ${errors.maxNoteId ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}>
              {NOTE_OPTIONS.map((note) => <option key={note.id} value={note.value}>{note.label}</option>)}
            </select>
          </div>
        </div>
        {errors.minNoteId && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg">⚠️ {errors.minNoteId.message}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
          <textarea {...register("memo")} rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none" />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link href="/" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">キャンセル</Link>
          <button type="submit" disabled={isPending} className={`px-6 py-2 rounded-lg font-bold transition shadow-md ${isPending ? "bg-gray-300 text-gray-500" : "bg-amber-500 text-white hover:bg-amber-600"}`}>
            {isPending ? "登録中..." : "登録"}
          </button>
        </div>
      </form>
    </div>
  );
}