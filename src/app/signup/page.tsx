"use client";

import { useState, useTransition } from "react";
import { registerUser, checkEmail } from "@/actions/user";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupSchema } from "@/lib/schema";
import { signIn } from "next-auth/react";
import { GoogleIcon, EyeIcon, EyeSlashIcon } from "@/components/ui/Icons";

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
      } catch (error: unknown) {
        if (error instanceof Error) {
          setServerError(error.message);
        } else {
          setServerError("登録に失敗しました");
        }
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
                  {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
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
                ${
                  !isValid || isPending || googleLoading
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary-hover"
                }`}
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
            <GoogleIcon />
            {googleLoading ? "接続中..." : "Googleで登録・ログイン"}
          </button>

          <div className="text-center text-sm text-muted-foreground mt-4">
            すでにアカウントを持ってる？{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:underline"
            >
              ログイン
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
