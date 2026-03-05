import { prisma } from "@/lib/prisma";
import EditSongForm from "@/components/song/SongForm";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSongPage({ params }: Props) {
  const { id } = await params;
  const songId = Number(id);

  if (isNaN(songId)) return notFound();

  const session = await getServerSession(authOptions);
  
  // ログインしていなければログイン画面へ強制送還
  if (!session?.user?.email) {
    redirect("/login");
  }

  // IDOR対策: 自分の曲しか編集画面を開けないようにする
  const song = await prisma.song.findFirst({
    where: { 
      id: songId,
      user: { email: session.user.email }
    },
  });

  // 曲がない、または他人の曲なら404
  if (!song) return notFound();

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        ✏️ 登録情報を編集
      </h1>

      <EditSongForm song={song} />
    </div>
  );
}