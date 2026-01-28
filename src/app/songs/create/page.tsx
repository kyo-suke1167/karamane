"use client";

import { createSong } from "@/app/actions";
import Link from "next/link";
import { NOTE_OPTIONS } from "@/lib/noteUtils";
import { useState } from "react";

export default function CreateSongPage() {
  // 入力中の値を監視
  const [minNoteId, setMinNoteId] = useState(60); // デフォルト mid2C
  const [maxNoteId, setMaxNoteId] = useState(72); // デフォルト hiC

  // 矛盾チェック: 最低音が最高音より高くないか？
  const isInvalid = minNoteId > maxNoteId;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🎤 新しい持ち歌を登録
      </h1>

      <form
        action={createSong}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6"
      >
        {/* 曲名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            曲名 <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            type="text"
            required
            placeholder="例: 怪獣の花唄"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        {/* アーティスト */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            アーティスト <span className="text-red-500">*</span>
          </label>
          <input
            name="artist"
            type="text"
            required
            placeholder="例: Vaundy"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        {/* YouTube URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            YouTube URL (任意)
          </label>
          <input
            name="youtubeUrl"
            type="url"
            placeholder="https://youtu.be/..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        {/* ステータス選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            今のレベル <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer border-2 border-gray-400 p-3 rounded-lg hover:bg-gray-50 has-checked:bg-blue-50 has-checked:border-blue-300">
              <input
                type="radio"
                name="status"
                value="PRACTICING"
                className="accent-blue-500"
              />
              <span>🔰 練習中</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer border-2 border-gray-400 p-3 rounded-lg hover:bg-gray-50 has-checked:bg-green-50 has-checked:border-green-300">
              <input
                type="radio"
                name="status"
                value="LEARNED"
                defaultChecked
                className="accent-green-500"
              />
              <span>🎤 持ち歌</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer border-2 border-gray-400 p-3 rounded-lg hover:bg-gray-50 has-checked:bg-amber-50 has-checked:border-amber-300">
              <input
                type="radio"
                name="status"
                value="MASTERED"
                className="accent-amber-500"
              />
              <span>👑 十八番</span>
            </label>
          </div>
        </div>

        {/* 音域入力エリア */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最低音
            </label>
            <div className="relative">
              <select
                name="minNoteId"
                value={minNoteId}
                onChange={(e) => setMinNoteId(Number(e.target.value))}
                className={`w-full border rounded-lg px-4 py-2 appearance-none outline-none cursor-pointer
                  ${isInvalid ? "border-red-500 bg-red-50" : "border-gray-300 bg-white focus:ring-2 focus:ring-amber-500"}
                `}
              >
                {NOTE_OPTIONS.map((note) => (
                  <option key={note.id} value={note.value}>
                    {note.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">▼</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最高音
            </label>
            <div className="relative">
              <select
                name="maxNoteId"
                value={maxNoteId} 
                onChange={(e) => setMaxNoteId(Number(e.target.value))} 
                className={`w-full border rounded-lg px-4 py-2 appearance-none outline-none cursor-pointer
                  ${isInvalid ? "border-red-500 bg-red-50" : "border-gray-300 bg-white focus:ring-2 focus:ring-amber-500"}
                `}
              >
                {NOTE_OPTIONS.map((note) => (
                  <option key={note.id} value={note.value}>
                    {note.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">▼</div>
            </div>
          </div>
        </div>

        {/* エラーメッセージ表示 */}
        {isInvalid && (
          <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg flex items-center justify-center gap-2">
            ⚠️ 最低音が最高音より高くなっています！
          </div>
        )}

        {/* メモ入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メモ (気づいたことなど)
          </label>
          <textarea
            name="memo"
            rows={4}
            placeholder="例: サビのファルセットがきつい。2番の歌詞間違えやすい。"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
          />
        </div>

        {/* ボタンエリア */}
        <div className="flex justify-end gap-3 pt-4">
          <Link 
            href="/" 
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={isInvalid} // 音域が矛盾していたら押せない
            className={`px-6 py-2 rounded-lg font-bold transition shadow-md
              ${isInvalid 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-amber-500 text-white hover:bg-amber-600"}
            `}
          >
            登録
          </button>
        </div>
      </form>
    </div>
  );
}
