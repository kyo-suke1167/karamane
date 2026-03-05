import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PublicSongList from "./PublicSongList";
import PublicHeader from "./PublicHeader";

// 60秒間はDBを見に行かず、Vercelのキャッシュを返す
export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PublicPortalPage({ params }: Props) {
  const { id: userId } = await params;

  // ユーザー情報と曲リストを同時に取得
  const [user, songs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true },
    }),
    prisma.song.findMany({
      where: {
        userId: userId,
        status: { in: ["LEARNED", "MASTERED", "PRACTICING"] },
      },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        artist: true,
        status: true,
        youtubeUrl: true,
        createdAt: true,
      }
    })
  ]);

  // ユーザーが存在しない場合は 404
  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-24">
      <PublicHeader user={user} songCount={songs.length} />

      <div className="max-w-3xl mx-auto pt-16 sm:pt-20 pb-6 px-4">
        <PublicSongList songs={songs} />
      </div>
    </div>
  );
}