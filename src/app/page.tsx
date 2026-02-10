import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getNoteName, getNoteColor } from "@/lib/noteUtils";
import { getStatusStyle } from "@/lib/statusUtils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SortSelect } from "@/components/SortSelect";
import { Prisma } from "@prisma/client";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const session = await getServerSession(authOptions);

  // =========================================================
  // パターンA: ログインしていない場合 → LP（ようこそ画面）を表示
  // =========================================================
  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <h1 className="text-4xl font-black text-gray-800 mb-4 tracking-tight">
          KARAMANE
        </h1>
        <p className="text-xl text-gray-600 mb-8 font-bold leading-relaxed">
          あなたの「持ち歌」を、<br />もっと賢く管理！
        </p>

        <div className="space-y-4 w-full max-w-xs">
          <Link
            href="/signup"
            className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-105"
          >
            今すぐ始める
          </Link>
          <Link
            href="/login"
            className="block w-full bg-white border-2 border-amber-500 text-amber-500 font-bold py-4 rounded-xl hover:bg-amber-50 transition"
          >
            ログインする
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-500 w-full max-w-2xl">
          <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">🎤</div>
            <div className="font-bold text-gray-700 mb-1">持ち歌管理</div>
            レパートリーを<br />ステータス管理
          </div>
          <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-bold text-gray-700 mb-1">キー提案</div>
            音域に合わせた<br />最適キーを表示
          </div>
          <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">📱</div>
            <div className="font-bold text-gray-700 mb-1">スマホ対応</div>
            カラオケで<br />サッと確認
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // パターンB: ログインしている場合 → 自分専用リストを表示
  // =========================================================

  // ログイン中のユーザーIDを取得
  const userId = (session.user as any).id;

  // ソート順の決定ロジック
  const params = await searchParams;
  const sortParam = params.sort || "latest";

  let orderBy: Prisma.SongOrderByWithRelationInput = { createdAt: "desc" };

  switch (sortParam) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "title_asc":
      orderBy = { title: "asc" };
      break;
    case "artist_asc":
      orderBy = { artist: "asc" };
      break;
    default: // "latest"
      orderBy = { createdAt: "desc" };
  }

  // 自分のデータだけを検索 (where: { userId })
  const songs = await prisma.song.findMany({
    where: { userId: userId },
    orderBy: orderBy, // 動的に変更されたソート順を適用
    include: { user: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* ヘッダーエリア */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {user?.name}さんの持ち歌
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-bold">
            全 {songs.length} 曲
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto items-center">
          {/* ソート選択プルダウンを追加 */}
          <SortSelect />

          {/* ※検索機能は後で実装予定（今はコメントアウトかそのまま） */}
          <input
            type="text"
            placeholder="曲名で検索..."
            className="hidden sm:block border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
          />
          <Link
            href="/songs/create"
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-full shadow-md transition flex-1 sm:flex-none text-center whitespace-nowrap"
          >
            + 曲を追加
          </Link>
        </div>
      </div>

      {/* 持ち歌カードのリスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {songs.length === 0 ? (
          <div className="col-span-2 text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold mb-4">
              まだ曲が登録されていません...
            </p>
            <Link
              href="/songs/create"
              className="text-amber-500 font-bold underline hover:text-amber-600"
            >
              最初の1曲を登録！
            </Link>
          </div>
        ) : (
          songs.map((song) => {
            const statusStyle = getStatusStyle(song.status);

            return (
              <Link
                key={song.id}
                href={`/songs/${song.id}`}
                className={`block bg-white border border-gray-200 border-l-4 rounded-xl shadow-sm hover:shadow-md transition px-4 py-3 ${statusStyle.cardBorder} ${statusStyle.cardBg}`}
              >
                {/* 上段：ステータスとキー */}
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    {/* ステータスバッジ */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.badgeColor}`}
                    >
                      {statusStyle.icon} {statusStyle.label}
                    </span>

                    {/* キー表示（0以外なら表示） */}
                    {song.key !== 0 && (
                      <span className="text-[11px] font-mono font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                        key:{song.key > 0 ? `+${song.key}` : song.key}
                      </span>
                    )}
                  </div>

                  {/* 音域バッジ */}
                  <div className="flex gap-1">
                    {song.maxNoteId && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getNoteColor(
                          song.maxNoteId
                        )}`}
                      >
                        最高音: {getNoteName(song.maxNoteId)}
                      </span>
                    )}
                    {song.minNoteId && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getNoteColor(
                          song.minNoteId
                        )}`}
                      >
                        最低音: {getNoteName(song.minNoteId)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 中段：曲情報 */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">
                    {song.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold">
                    {song.artist}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}