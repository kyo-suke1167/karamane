import { createSong } from "@/app/actions";
import Link from "next/link";

export default function CreateSongPage() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🎤 新しい持ち歌を登録
      </h1>

      <form action={createSong} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        
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

        {/* 音域（仮実装：数値入力） */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最低音 (Note ID)
            </label>
            <input
              name="minNoteId"
              type="number"
              defaultValue={60}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            <p className="text-xs text-gray-400 mt-1">※60=mid2C</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最高音 (Note ID)
            </label>
            <input
              name="maxNoteId"
              type="number"
              defaultValue={72}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            <p className="text-xs text-gray-400 mt-1">※72=hiC</p>
          </div>
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
            className="bg-amber-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-600 transition shadow-md"
          >
            登録する
          </button>
        </div>
      </form>
    </div>
  );
}