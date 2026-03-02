import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // 最新のユーザー情報と連携済みアカウント情報を取得
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: true },
  });

  if (!user) {
    return (
      <div className="text-center mt-10 text-foreground">
        ユーザーが見つかりません...
      </div>
    );
  }

  // Googleアカウントが連携済みかどうかを判定
  const isLinkedWithGoogle = user.accounts.some(
    (acc) => acc.provider === "google",
  );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-black text-foreground mb-2">ユーザー設定</h1>
      <p className="text-muted-foreground mb-8">
        プロフィールや音域を変更できます
      </p>

      <ProfileForm user={user} isLinkedWithGoogle={isLinkedWithGoogle} />
    </div>
  );
}
