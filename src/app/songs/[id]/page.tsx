import { prisma } from "@/lib/prisma";
import { getNoteName, getNoteColor } from "@/lib/noteUtils";
import { getStatusStyle } from "@/lib/statusUtils";
import { getYouTubeId } from "@/lib/youtubeUtils";
import Link from "next/link";
import { notFound } from "next/navigation";
import KeyController from "@/components/KeyController";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SongDetailPage({ params }: Props) {
  const { id } = await params;

  const songId = Number(id);

  // 数値でないIDが来たら 404 にする
  if (isNaN(songId)) {
    return notFound();
  }

  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: { user: true },
  });

  if (!song) {
    return notFound();
  }

  const statusStyle = getStatusStyle(song.status);
  const videoId = getYouTubeId(song.youtubeUrl);
  const currentUser = await prisma.user.findUnique({
    where: { id: "user_1" },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="text-gray-500 hover:text-amber-500 transition flex items-center gap-1"
        >
          一覧に戻る
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* ヘッダー部分 */}
        <div className={`p-6 border-b border-gray-100 ${statusStyle.cardBg}`}>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* ステータスバッジ */}
            <span
              className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full border bg-white ${statusStyle.badgeColor}`}
            >
              {statusStyle.icon} {statusStyle.label}
            </span>

            {/* 音域バッジ */}
            <span
              className={`text-sm font-bold px-3 py-1 rounded border bg-white ${getNoteColor(song.maxNoteId)}`}
            >
              最高: {getNoteName(song.maxNoteId)}
            </span>
            <span
              className={`text-sm font-bold px-3 py-1 rounded border bg-white ${getNoteColor(song.minNoteId)}`}
            >
              最低: {getNoteName(song.minNoteId)}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 leading-tight">
            {song.title}
          </h1>
          <p className="text-lg text-gray-600 mt-2 font-medium">
            {song.artist}
          </p>
        </div>

        {/* コンテンツ部分 */}
        <div className="p-6 space-y-8">
          {/* YouTube動画エリア */}
          {videoId ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-md bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            </div>
          ) : song.youtubeUrl ? (
            // IDが取れなかった場合はリンクを表示するフォールバック
            <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-500 text-sm break-all">
              <a
                href={song.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {song.youtubeUrl}
              </a>
            </div>
          ) : null}

          {/* キーコントローラー */}
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Current Key
            </h2>
            <KeyController
              songId={song.id}
              initialKey={song.key}
              songMax={song.maxNoteId}
              songMin={song.minNoteId}
              userMax={currentUser?.maxNoteId ?? null}
              userMin={currentUser?.minNoteId ?? null}
            />
          </div>

          {/* メモ表示エリア */}
          {song.memo && (
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                Memo
              </h2>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-gray-700 whitespace-pre-wrap leading-relaxed shadow-sm">
                {song.memo}
              </div>
            </div>
          )}

          {/* メタ情報 */}
          <div className="border-t border-gray-100 pt-6 flex flex-col gap-2 text-sm text-gray-400">
            <p>登録ユーザー: {song.user?.name}</p>
            <p>登録日: {song.createdAt.toLocaleDateString()}</p>
            <p>ID: {song.id}</p>
          </div>

          {/* 編集ボタンエリア */}
          <div className="flex gap-3 pt-4">
             <Link 
               href={`/songs/${song.id}/edit`}
               className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-lg font-bold text-center transition"
             >
               編集する
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
