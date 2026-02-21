import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfileSettingsPage() {
  // 1. セッションチェック
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  // 2. 最新のユーザー情報を取得
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return <div className="text-center mt-10 text-foreground">ユーザーが見つかりません...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-black text-foreground mb-2">
        ユーザー設定
      </h1>
      <p className="text-muted-foreground mb-8">
        プロフィールや音域を変更できます
      </p>

      <ProfileForm user={user} />
    </div>
  );
}