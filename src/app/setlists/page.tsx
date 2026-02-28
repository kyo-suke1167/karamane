import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SetlistList } from "@/components/setlist/SetlistList"; 
import { redirect } from "next/navigation";

export default async function SetlistsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const userId = session.user.id;

  const setlists = await prisma.setlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      _count: {
        select: { entries: true },
      },
    },
  });

  return (
    <div className="pb-20"> 
      <SetlistList setlists={setlists} />
    </div>
  );
}