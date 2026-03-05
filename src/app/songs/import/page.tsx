import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImportScreen } from "@/components/song/ImportScreen";

export default async function YoutubeImportPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-20">
      <ImportScreen />
    </div>
  );
}