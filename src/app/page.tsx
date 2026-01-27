import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getNoteName, getNoteColor } from "@/lib/noteUtils";
import { getStatusStyle } from "@/lib/statusUtils";

export default async function Home() {
  // DBから曲データを全部取得
  // include: { user: true } で、投稿者の名前も一緒に取得
  const songs = await prisma.song.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
    },
  });

  return (
    <div>
      <div className="flex flex-col justify-between items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          🎵 みんなの持ち歌リスト
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="曲名で検索..."
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
          />
          <Link
            href="/songs/create"
            className="bg-amber-500 text-white px-4 py-2 rounded"
          >
            + 追加
          </Link>
        </div>
      </div>

      {/* 持ち歌カードのリスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {songs.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center py-10">
            まだ登録された曲がありません... 🎤
          </p>
        ) : (
          songs.map((song) => {
            const statusStyle = getStatusStyle(song.status);

            return (
              <Link
                key={song.id}
                href={`/songs/${song.id}`}
                className={`block bg-white border border-gray-200 border-l-4 rounded-xl shadow-sm hover:shadow-md transition px-4 py-2 ${statusStyle.cardBorder} ${statusStyle.cardBg}`}
              >
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2 border-b border-gray-200/50 pb-2">
                  {/* ステータス */}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.badgeColor}`}
                  >
                    {statusStyle.icon} {statusStyle.label}
                  </span>

                  <div className="flex gap-2">
                    {/* 最高音 */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getNoteColor(song.maxNoteId)}`}
                    >
                      最高: {getNoteName(song.maxNoteId)}
                    </span>

                    {/* 最低音 */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getNoteColor(song.minNoteId)}`}
                    >
                      最低: {getNoteName(song.minNoteId)}
                    </span>
                  </div>
                </div>

                {/* 中段：曲情報 */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-800 leading-tight">
                    {song.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{song.artist}</p>
                </div>

                {/* 下段：フッター情報  */}
                {/* <div className="border-t border-gray-200/50 pt-2 flex justify-between items-center text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    👤 {song.user?.name ?? "名無し"}
                  </span>
                  <span>{song.createdAt.toLocaleDateString()}</span>
                </div> */}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
