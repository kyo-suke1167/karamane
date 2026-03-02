"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path
                fill="#4285F4"
                d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
              />
              <path
                fill="#34A853"
                d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
              />
              <path
                fill="#FBBC05"
                d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
              />
              <path
                fill="#EA4335"
                d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
              />
            </g>
          </svg>
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
