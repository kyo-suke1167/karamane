"use client";

import { useState, useTransition } from "react";
import { registerUser, checkEmail } from "@/app/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupSchema } from "@/lib/schema";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
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
                      // 目が開いているアイコン (表示中)
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
                      // 目に斜線が入っているアイコン (非表示中)
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
              disabled={!isValid || isPending}
              className={`w-full font-bold py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2 mt-2
                ${!isValid || isPending
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

          <div className="text-center text-sm text-muted-foreground">
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