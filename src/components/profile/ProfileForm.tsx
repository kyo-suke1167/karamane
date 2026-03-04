"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/user";
import { NOTE_OPTIONS } from "@/lib/noteUtils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import GoogleIcon from "@/components/ui/GoogleIcon";

type ProfileFormProps = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    minNoteId: number | null;
    maxNoteId: number | null;
  };
  isLinkedWithGoogle: boolean;
};

export default function ProfileForm({
  user,
  isLinkedWithGoogle,
}: ProfileFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || "",
    minNoteId: user.minNoteId as number | null,
    maxNoteId: user.maxNoteId as number | null,
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setMessage("");
    setError("");

    try {
      const data = new FormData();
      data.append("name", formData.name);

      data.append(
        "minNoteId",
        formData.minNoteId !== null ? String(formData.minNoteId) : "",
      );
      data.append(
        "maxNoteId",
        formData.maxNoteId !== null ? String(formData.maxNoteId) : "",
      );

      await updateProfile(data);
      setMessage("プロフィールを更新しました");

      router.refresh();
      setTimeout(() => setMessage(""), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "更新に失敗しました...");
      } else {
        setError("予期せぬエラーが発生しました");
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleLink = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/settings/profile" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6 transition-colors"
    >
      {/* 名前 */}
      <div>
        <label className="block text-sm font-bold text-foreground mb-1">
          お名前 (ニックネーム)
        </label>
        <input
          type="text"
          required
          className="w-full bg-background text-foreground border border-border p-3 rounded-lg outline-none focus:ring-2 focus:ring-ring transition-colors"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      {/* 音域設定エリア */}
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-4 transition-colors">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          音域設定
          <span className="text-xs font-normal text-muted-foreground">
            ※キー提案に使われます
          </span>
        </h3>

        <Link
          href="/pitch-test"
          className="flex items-center justify-center gap-2 w-full bg-background border-2 border-primary/30 hover:border-primary text-primary font-bold py-3 rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          🎙️ マイクで自動測定する
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              最低音 (Low)
            </label>
            <div className="relative">
              <select
                value={formData.minNoteId === null ? "" : formData.minNoteId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minNoteId:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="w-full bg-background text-foreground border border-border p-2 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-ring outline-none transition-colors"
              >
                <option value="">未設定</option>
                {NOTE_OPTIONS.map((n) => (
                  <option key={n.id} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              最高音 (High)
            </label>
            <div className="relative">
              <select
                value={formData.maxNoteId === null ? "" : formData.maxNoteId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxNoteId:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="w-full bg-background text-foreground border border-border p-2 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-ring outline-none transition-colors"
              >
                <option value="">未設定</option>
                {NOTE_OPTIONS.map((n) => (
                  <option key={n.id} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* アカウント連携エリア */}
      <div className="bg-card border border-border p-4 rounded-xl space-y-4 transition-colors">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          アカウント連携
        </h3>

        {isLinkedWithGoogle ? (
          <div className="flex items-center gap-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-4 rounded-lg text-sm font-bold">
            <GoogleIcon />
            <span>Googleアカウント連携済みです</span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground">
              Googleアカウントを連携すると、パスワードを忘れた際も安全にログインできるようになります。
            </p>
            <button
              type="button"
              onClick={handleGoogleLink}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-background text-foreground border border-border font-bold py-3 rounded-xl hover:bg-muted transition-colors shadow-sm disabled:opacity-50 active:scale-95"
            >
              <GoogleIcon />
              {googleLoading ? "接続中..." : "Googleアカウントを連携する"}
            </button>
          </div>
        )}
      </div>

      {/* メッセージ表示エリア */}
      {message && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-bold border border-green-200 dark:border-green-800/50 rounded-lg text-center animate-pulse transition-colors">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-800/50 rounded-lg text-center transition-colors">
          {error}
        </div>
      )}

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || googleLoading}
          className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-3 px-8 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "更新中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}
