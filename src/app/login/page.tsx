"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/Icons";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("メールアドレスかパスワードが間違っています。");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("ログイン中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-black text-foreground mb-6 text-center">
        ログイン
      </h1>

      <div className="bg-card border border-border p-6 rounded-xl shadow-sm transition-colors">
        {registered && (
          <div className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-3 rounded-lg text-sm font-bold mb-4">
            登録が完了しました！ログインしてください。
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 rounded-lg text-sm font-bold mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              required
              className="w-full bg-background text-foreground border border-border p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold text-muted-foreground">
                パスワード
              </label>
            </div>
            <input
              type="password"
              required
              className="w-full bg-background text-foreground border border-border p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <hr className="w-full border-border" />
          <span className="px-3 text-xs font-bold text-muted-foreground whitespace-nowrap">
            または
          </span>
          <hr className="w-full border-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="mt-6 w-full flex items-center justify-center gap-3 bg-background text-foreground border border-border font-bold py-3 rounded-xl hover:bg-muted transition-colors shadow-sm disabled:opacity-50 active:scale-95"
        >
          <GoogleIcon />
          {googleLoading ? "接続中..." : "Googleでログイン"}
        </button>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          アカウントをお持ちでない方は{" "}
          <Link
            href="/signup"
            className="text-primary font-bold hover:underline transition-colors"
          >
            新規登録
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-10 text-foreground">読み込み中...</div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
