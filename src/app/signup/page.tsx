"use client";

import { useState, useTransition } from "react";
import { registerUser, checkEmail } from "@/app/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupSchema } from "@/lib/schema";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: SignupSchema) => {
    startTransition(async () => {
      try {
        setServerError("");
        
        // メールアドレスの重複チェック
        const isTaken = await checkEmail(data.email);
        if (isTaken) {
          setServerError("そのメールアドレスは既に登録されています");
          return;
        }

        // 問題なければ登録実行
        await registerUser(data);
        router.push("/login?registered=true");
      } catch (e: any) {
        setServerError(e.message || "登録に失敗しました");
      }
    });
  };

  // Googleで登録・ログインボタンを押した時の処理
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-10 px-4">
      <div className="bg-card border border-border max-w-md w-full p-8 rounded-2xl shadow-lg transition-colors">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              はじめまして！
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">
                お名前 (ニックネーム)
              </label>
              <input
                {...register("name")}
                className={`w-full bg-background text-foreground border p-3 rounded-lg outline-none transition
                  ${errors.name ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-border focus:ring-2 focus:ring-primary"}`}
                placeholder="カラオケ太郎"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 font-bold">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">
                メールアドレス
              </label>
              <input
                {...register("email")}
                type="email"
                className={`w-full bg-background text-foreground border p-3 rounded-lg outline-none transition
                  ${errors.email ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-border focus:ring-2 focus:ring-primary"}`}
                placeholder="lion@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-bold">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">
                パスワード
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={`w-full bg-background text-foreground border p-3 rounded-lg outline-none transition pr-10
                    ${errors.password ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-border focus:ring-2 focus:ring-primary"}`}
                  placeholder="半角英数字8文字以上"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-amber-500 transition"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    )}
                  </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-bold">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-red-500 text-sm text-center font-bold bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                ⚠️ {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || isPending || googleLoading}
              className={`w-full font-bold py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2 mt-2
                ${!isValid || isPending || googleLoading
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary-hover"}`
              }
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  登録中...
                </>
              ) : (
                "登録する"
              )}
            </button>
          </form>

          {/* Googleログイン（登録） */}
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
            disabled={isPending || googleLoading}
            className="mt-6 w-full flex items-center justify-center gap-3 bg-background text-foreground border border-border font-bold py-3 rounded-xl hover:bg-muted transition-colors shadow-sm disabled:opacity-50 active:scale-95"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            {googleLoading ? "接続中..." : "Googleで登録・ログイン"}
          </button>

          <div className="text-center text-sm text-muted-foreground mt-4">
            すでにアカウントを持ってる？{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              ログイン
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}