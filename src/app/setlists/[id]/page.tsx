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

  const userId = session.user.id;
  const { id } = await params;
  const setlistId = Number(id);

  if (isNaN(setlistId)) notFound();

  const setlist = await prisma.setlist.findUnique({
    where: { 
      id: setlistId,
      userId, 
    },
    include: {
      entries: {
        orderBy: { order: "asc" },
        include: {
          song: true,
        },
      },
    },
  });

  if (!setlist) notFound();

  const allSongs = await prisma.song.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // 曲の並び順が変わったり、増減したらキーが変わるようにする
  const uniqueKey = setlist.entries.map((e) => e.id).join("-");

  return (
    <SetlistDetail 
      key={uniqueKey} 
      setlist={setlist} 
      allSongs={allSongs} 
    />
  );
}