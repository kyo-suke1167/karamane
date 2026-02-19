import { prisma } from "@/lib/prisma";
import { getNoteName, getNoteColor } from "@/lib/noteUtils";
import { getStatusStyle } from "@/lib/statusUtils";
import { getYouTubeId } from "@/lib/youtubeUtils";
import Link from "next/link";
import { notFound } from "next/navigation";
import KeyController from "@/components/vocal-range/KeyController";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SongDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const songId = Number(id);

  const query = await searchParams;
  // backUrl が指定されていればそれを、なければトップページ ("/") を使う
  const backUrl = typeof query.backUrl === "string" ? query.backUrl : "/";
  
  const backLabel = backUrl.includes("/setlists") ? "セットリストに戻る" : "一覧に戻る";

  if (isNaN(songId)) {
    return notFound();
  }

  // 1. 曲データを取得
  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: { user: true },
  });

  if (!song) {
    return notFound();
  }

  // 2. セッションから「ログイン中のユーザー」を取得
  const session = await getServerSession(authOptions);
  
  let currentUser = null;
  
  if (session?.user?.email) {
    currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
  }

  const statusStyle = getStatusStyle(song.status);
  const videoId = getYouTubeId(song.youtubeUrl);

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-6">
        <Link
          href={backUrl}
          className="text-muted-foreground hover:text-primary transition flex items-center gap-1 font-bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          {backLabel}
        </Link>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden transition-colors">
        {/* ヘッダー部分 */}
        <div className={`p-6 border-b border-border-light ${statusStyle.cardBg}`}>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* ステータスバッジ */}
            <span
              className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full border ${statusStyle.badgeColor}`}
            >
              {statusStyle.icon} {statusStyle.label}
            </span>

            {/* 音域バッジ */}
            {song.maxNoteId && (
               <span className={`text-sm font-bold px-3 py-1 rounded border ${getNoteColor(song.maxNoteId)}`}>
                 最高: {getNoteName(song.maxNoteId)}
               </span>
            )}
            {song.minNoteId && (
               <span className={`text-sm font-bold px-3 py-1 rounded border ${getNoteColor(song.minNoteId)}`}>
                 最低: {getNoteName(song.minNoteId)}
               </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-foreground leading-tight">
            {song.title}
          </h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">
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
            <div className="bg-muted rounded-xl p-4 text-center text-muted-foreground text-sm break-all">
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
            <h2 className="text-sm font-bold text-primary/90 uppercase tracking-wider mb-2">
              Custom Key
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
              <h2 className="text-sm font-bold text-primary/90 uppercase tracking-wider mb-2">
                Memo
              </h2>
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-xl p-5 text-foreground whitespace-pre-wrap leading-relaxed shadow-sm transition-colors">
                {song.memo}
              </div>
            </div>
          )}

          {/* メタ情報 */}
          <div className="border-t border-border-light pt-6 flex flex-col gap-2 text-sm text-muted-foreground">
            <p>登録ユーザー: {song.user?.name}</p>
            <p>登録日: {song.createdAt.toLocaleDateString()}</p>
          </div>

          {/* 編集ボタンエリア */}
          <div className="flex gap-3 pt-4">
             <Link 
               href={`/songs/${song.id}/edit`}
               className="flex-1 bg-muted hover:opacity-80 text-foreground py-3 rounded-lg font-bold text-center transition"
             >
               編集する
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}