import { prisma } from "@/lib/prisma";
import EditSongForm from "@/components/song/SongForm";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSongPage({ params }: Props) {
  const { id } = await params;
  const songId = Number(id);

  if (isNaN(songId)) return notFound();

  const song = await prisma.song.findUnique({
    where: { id: songId },
  });

  if (!song) return notFound();

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        ✏️ 登録情報を編集
      </h1>
      
      <EditSongForm song={song} />
    </div>
  );
}