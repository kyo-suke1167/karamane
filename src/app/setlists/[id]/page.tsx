import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SetlistDetail } from "@/components/setlist/SetlistDetail";
import { notFound, redirect } from "next/navigation";

export default async function SetlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  // 型アサーションや拡張でidが取れる前提（NextAuthのセッション設定に依存）
  const userId = (session.user as { id: string }).id;
  
  const { id } = await params;
  const setlistId = Number(id);

  if (isNaN(setlistId)) notFound();

  // Promise.allで「セットリスト」と「全曲リスト」を同時に取得
  const [setlist, allSongs] = await Promise.all([
    // ① セットリストの取得
    // findUnique ではなく findFirst を使い、自分のuserIdで確実にロックをかける！（IDOR対策）
    prisma.setlist.findFirst({
      where: {
        id: setlistId,
        userId, // 自分のセトリしか絶対に見せない
      },
      include: {
        entries: {
          orderBy: { order: "asc" },
          include: {
            song: true, // 曲の情報も一緒に取得
          },
        },
      },
    }),
    // モーダル用の全曲リストの取得
    prisma.song.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // 自分のセットリストが見つからなかったら 404
  if (!setlist) notFound();

  // 曲の並び順が変わったり、増減したらキーが変わるようにする
  const uniqueKey = setlist.entries.map((e) => e.id).join("-");

  return (
    <SetlistDetail key={uniqueKey} setlist={setlist} allSongs={allSongs} />
  );
}