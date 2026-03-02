import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PublicSongList from "./PublicSongList";
import PublicHeader from "./PublicHeader";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PublicPortalPage({ params }: Props) {
  const { id: userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true },
  });

  if (!user) {
    notFound();
  }

  const songs = await prisma.song.findMany({
    where: {
      userId: userId,
      status: { in: ["LEARNED", "MASTERED"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      artist: true,
      status: true,
      youtubeUrl: true,
      createdAt: true,
    }
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      
      <PublicHeader user={user} songCount={songs.length} />

      <div className="max-w-3xl mx-auto pt-16 sm:pt-20 pb-6 px-4">
        <PublicSongList songs={songs} />
      </div>

    </div>
  );
}