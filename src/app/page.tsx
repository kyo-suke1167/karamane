import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientSongList } from "@/components/song/SongList";
import VocalRangePrompt from "@/components/profile/VocalRangePrompt";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // =========================================================
  // パターンA: ログインしていない場合 → LP（ようこそ画面）を表示
  // =========================================================
  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <h1 className="text-4xl font-black text-foreground mb-4 tracking-tight">
          KARAMANE
        </h1>
        <p className="text-xl text-muted-foreground mb-8 font-bold leading-relaxed">
          あなたの「持ち歌」を、<br />もっと賢く管理！
        </p>

        <div className="space-y-4 w-full max-w-xs">
          <Link
            href="/signup"
            className="block w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-105"
          >
            今すぐ始める
          </Link>
          <Link
            href="/login"
            className="block w-full bg-background border-2 border-primary text-primary font-bold py-4 rounded-xl hover:bg-primary/10 transition"
          >
            ログインする
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-muted-foreground w-full max-w-2xl">
          <div className="p-5 bg-card rounded-xl shadow-sm border border-border">
            <div className="text-2xl mb-2">🎤</div>
            <div className="font-bold text-foreground mb-1">持ち歌管理</div>
            レパートリーを<br />ステータス管理
          </div>
          <div className="p-5 bg-card rounded-xl shadow-sm border border-border">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-bold text-foreground mb-1">キー提案</div>
            音域に合わせた<br />最適キーを表示
          </div>
          <div className="p-5 bg-card rounded-xl shadow-sm border border-border">
            <div className="text-2xl mb-2">📱</div>
            <div className="font-bold text-foreground mb-1">スマホ対応</div>
            カラオケで<br />サッと確認
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // パターンB: ログインしている場合 → 自分専用リストを表示
  // =========================================================

  const userId = session.user.id;

  const allSongs = await prisma.song.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const isVocalRangeMissing = user?.minNoteId === null || user?.maxNoteId === null;

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 pb-20 relative">
      <VocalRangePrompt isMissing={isVocalRangeMissing} />

      <ClientSongList 
        initialSongs={allSongs} 
        userName={user?.name || "ゲスト"} 
      />
    </div>
  );
}