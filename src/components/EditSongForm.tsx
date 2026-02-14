"use client";

import { updateSong, deleteSong } from "@/app/actions";
import { NOTE_OPTIONS } from "@/lib/noteUtils";
import { useState } from "react";
import Link from "next/link";
import type { Song } from "@/generated/prisma";

type Props = {
  song: Song; // 編集対象の曲データをもらう
};

export default function EditSongForm({ song }: Props) {
  // 初期値を設定
  const [minNoteId, setMinNoteId] = useState(song.minNoteId || 60);
  const [maxNoteId, setMaxNoteId] = useState(song.maxNoteId || 72);

  // 音域矛盾チェック
  const isInvalid = minNoteId > maxNoteId;

  // 削除ボタン処理
  const handleDelete = async () => {
    // 1. ブラウザ標準の確認ダイアログ
    const isConfirmed = confirm("本当にこの曲を削除してもいいですか？");
    
    if (isConfirmed) {
      // 2. 削除アクションを実行
      await deleteSong(song.id);
    }
  };

  return (
    <form action={updateSong} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
      {/* IDを送る */}
      <input type="hidden" name="id" value={song.id} />

      {/* 曲名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">曲名 <span className="text-red-500">*</span></label>
        <input name="title" type="text" required defaultValue={song.title}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
      </div>

      {/* アーティスト */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">アーティスト <span className="text-red-500">*</span></label>
        <input name="artist" type="text" required defaultValue={song.artist}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
      </div>

      {/* YouTube URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
        <input name="youtubeUrl" type="url" defaultValue={song.youtubeUrl || ""}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
      </div>

      {/* ステータス選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">今のレベル</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg hover:bg-gray-50 `has-checked:bg-blue-50` `has-checked:border-blue-300`">
            <input type="radio" name="status" value="PRACTICING" defaultChecked={song.status === "PRACTICING"} className="accent-blue-500" />
            <span>🔰 練習中</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg hover:bg-gray-50 has-:checked:bg-green-50 has-:checked:border-green-300">
            <input type="radio" name="status" value="LEARNED" defaultChecked={song.status === "LEARNED"} className="accent-green-500" />
            <span>🎤 持ち歌</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg hover:bg-gray-50 has-:checked:bg-amber-50 has-:checked:border-amber-300">
            <input type="radio" name="status" value="MASTERED" defaultChecked={song.status === "MASTERED"} className="accent-amber-500" />
            <span>👑 十八番</span>
          </label>
        </div>
      </div>

      {/* 音域入力 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">最低音</label>
          <div className="relative">
            <select name="minNoteId" value={minNoteId} onChange={(e) => setMinNoteId(Number(e.target.value))}
              className={`w-full border rounded-lg px-4 py-2 appearance-none outline-none cursor-pointer ${isInvalid ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}>
              {NOTE_OPTIONS.map((note) => (
                <option key={note.id} value={note.value}>{note.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">▼</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">最高音</label>
          <div className="relative">
            <select name="maxNoteId" value={maxNoteId} onChange={(e) => setMaxNoteId(Number(e.target.value))}
              className={`w-full border rounded-lg px-4 py-2 appearance-none outline-none cursor-pointer ${isInvalid ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}>
              {NOTE_OPTIONS.map((note) => (
                <option key={note.id} value={note.value}>{note.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">▼</div>
          </div>
        </div>
      </div>

      {/* メモ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
        <textarea name="memo" rows={4} defaultValue={song.memo || ""}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none" />
      </div>

      {/* エラー表示 */}
      {isInvalid && (
        <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg text-center">
          ⚠️ 最低音が最高音より高くなっています。修正してください。
        </div>
      )}

      {/* ボタン */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
        
        {/* 削除ボタン */}
        <button
          type="button"
          onClick={handleDelete}
          className="text-red-500 text-sm font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition"
        >
          この曲を削除する
        </button>

        {/* キャンセル、更新ボタン */}
        <div className="flex gap-3">
          <Link href={`/songs/${song.id}`} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            キャンセル
          </Link>
          <button type="submit" disabled={isInvalid}
            className={`px-6 py-2 rounded-lg font-bold transition shadow-md ${isInvalid ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-amber-500 text-white hover:bg-amber-600"}`}>
            更新する
          </button>
        </div>
      </div>
    </form>
  );
}