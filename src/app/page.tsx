import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  // DBから曲データを全部取得
  // include: { user: true } で、投稿者の名前も一緒に取得
  const songs = await prisma.song.findMany({
    orderBy: { createdAt: "desc" }, // 新しい順
    include: {
      user: true, 
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          🎵 みんなの持ち歌リスト
        </h2>
        {/* まだ機能しないけど雰囲気作り */}
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="曲名で検索..." 
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
          />
        </div>
      </div>

      {/* 持ち歌カードのリスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {songs.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center py-10">
            まだ登録された曲がありません...
          </p>
        ) : (
          songs.map((song) => (
            <Link 
              key={song.id} 
              href={`/songs/${song.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition hover:border-amber-400"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {song.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {song.artist}
                  </p>
                </div>
                {/* 音域バッジ */}
                <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                  キー: {song.maxNoteId ? `hi${song.maxNoteId - 72 > 0 ? "+" : ""}` : "?"}
                  {/* ↑とりあえず適当な表示ロジック */}
                </div>
              </div>
              
              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center text-xs text-gray-500">
                <span>👤 {song.user.name ?? "名無し"}</span>
                <span>📅 {song.createdAt.toLocaleDateString()}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}