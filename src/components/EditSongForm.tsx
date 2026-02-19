"use client";

import { updateSong, deleteSong } from "@/app/actions";
import { NOTE_OPTIONS } from "@/lib/noteUtils";
import { useState } from "react";
import Link from "next/link";
import type { Song } from "@/generated/prisma";

type Props = {
  song: Song;
};

export default function EditSongForm({ song }: Props) {
  const [minNoteId, setMinNoteId] = useState(song.minNoteId || 60);
  const [maxNoteId, setMaxNoteId] = useState(song.maxNoteId || 72);

  const isInvalid = minNoteId > maxNoteId;

  const handleDelete = async () => {
    const isConfirmed = confirm("本当にこの曲を削除してもいいですか？");
    if (isConfirmed) {
      await deleteSong(song.id);
    }
  };

  return (
    <form action={updateSong} className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6 transition-colors">
      <input type="hidden" name="id" value={song.id} />

      {/* 曲名 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">曲名 <span className="text-red-500">*</span></label>
        <input name="title" type="text" required defaultValue={song.title}
          className="w-full bg-background text-foreground border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring outline-none transition-colors placeholder:text-muted-foreground" />
      </div>

      {/* アーティスト */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">アーティスト <span className="text-red-500">*</span></label>
        <input name="artist" type="text" required defaultValue={song.artist}
          className="w-full bg-background text-foreground border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring outline-none transition-colors placeholder:text-muted-foreground" />
      </div>

      {/* YouTube URL */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">YouTube URL</label>
        <input name="youtubeUrl" type="url" defaultValue={song.youtubeUrl || ""}
          className="w-full bg-background text-foreground border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring outline-none transition-colors placeholder:text-muted-foreground" />
      </div>

      {/* ステータス選択 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">今のレベル</label>
        <div className="flex flex-col sm:flex-row gap-4 text-foreground">
          <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border p-3 rounded-lg hover:bg-muted transition-colors has-checked:bg-blue-50 dark:has-checked:bg-blue-900/20 has-checked:border-blue-300 dark:has-checked:border-blue-700">
            <input type="radio" name="status" value="PRACTICING" defaultChecked={song.status === "PRACTICING"} className="accent-blue-500" />
            <span className="font-bold">🔰 練習中</span>
          </label>
          <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border p-3 rounded-lg hover:bg-muted transition-colors has-checked:bg-green-50 dark:has-checked:bg-green-900/20 has-checked:border-green-300 dark:has-checked:border-green-700">
            <input type="radio" name="status" value="LEARNED" defaultChecked={song.status === "LEARNED"} className="accent-green-500" />
            <span className="font-bold">🎤 持ち歌</span>
          </label>
          <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border p-3 rounded-lg hover:bg-muted transition-colors has-checked:bg-primary/10 has-checked:border-primary/50">
            <input type="radio" name="status" value="MASTERED" defaultChecked={song.status === "MASTERED"} className="accent-primary" />
            <span className="font-bold">👑 十八番</span>
          </label>
        </div>
      </div>

      {/* 音域入力 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">最低音</label>
          <div className="relative">
            <select name="minNoteId" value={minNoteId} onChange={(e) => setMinNoteId(Number(e.target.value))}
              className={`w-full border rounded-lg px-4 py-2 appearance-none outline-none cursor-pointer text-foreground transition-colors ${
                isInvalid ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-border bg-background"
              }`}>
              {NOTE_OPTIONS.map((note) => (
                <option key={note.id} value={note.value} className="bg-background text-foreground">{note.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">▼</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">最高音</label>
          <div className="relative">
            <select name="maxNoteId" value={maxNoteId} onChange={(e) => setMaxNoteId(Number(e.target.value))}
              className={`w-full border rounded-lg px-4 py-2 appearance-none outline-none cursor-pointer text-foreground transition-colors ${
                isInvalid ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-border bg-background"
              }`}>
              {NOTE_OPTIONS.map((note) => (
                <option key={note.id} value={note.value} className="bg-background text-foreground">{note.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">▼</div>
          </div>
        </div>
      </div>

      {/* メモ */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">メモ</label>
        <textarea name="memo" rows={4} defaultValue={song.memo || ""}
          className="w-full bg-background text-foreground border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring outline-none resize-none transition-colors placeholder:text-muted-foreground" />
      </div>

      {/* エラー表示 */}
      {isInvalid && (
        <div className="text-red-500 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center border border-red-200 dark:border-red-800/50">
          ⚠️ 最低音が最高音より高くなっています。修正してください。
        </div>
      )}

      {/* ボタン */}
      <div className="flex flex-wrap justify-between items-center gap-4 pt-6 border-t border-border-light mt-6">
        
        {/* 削除ボタン */}
        <button
          type="button"
          onClick={handleDelete}
          className="text-red-500 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
        >
          この曲を削除する
        </button>

        {/* キャンセル、更新ボタン */}
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href={`/songs/${song.id}`} className="flex-1 sm:flex-none text-center px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors font-bold">
            キャンセル
          </Link>
          <button type="submit" disabled={isInvalid}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold transition-colors shadow-md ${
              isInvalid 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-primary text-primary-foreground hover:bg-primary-hover"
            }`}>
            更新する
          </button>
        </div>
      </div>
    </form>
  );
}