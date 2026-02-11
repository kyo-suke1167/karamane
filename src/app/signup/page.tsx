"use client";

import { useState, useTransition } from "react";
import { registerUser, checkEmail } from "@/app/actions";
import { NOTE_OPTIONS } from "@/lib/noteUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupSchema } from "@/lib/schema";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // メールチェック中フラグ
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // RHF設定
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      minNoteId: 60, // mid2C
      maxNoteId: 72, // hiC
    },
    mode: "onChange",
  });

  // リアルタイム監視
  const name = watch("name");
  const email = watch("email");
  const password = watch("password");

  // Step 1 のボタン有効化条件（簡易チェック）
  const isStep1Valid =
    name &&
    email &&
    password &&
    !errors.name &&
    !errors.email &&
    !errors.password;

  // Step 1 -> Step 2
  const handleStep1Next = async () => {
    // チェック中は実行しない
    if (isCheckingEmail) return;

    // チェック開始
    setIsCheckingEmail(true);

    const isValid = await trigger(["name", "email", "password"]);
    if (!isValid) {
      setIsCheckingEmail(false); // 失敗したら戻す
      return;
    }

    const emailVal = watch("email");
    try {
      const isTaken = await checkEmail(emailVal);
      if (isTaken) {
        setServerError("そのメールアドレスは既に登録されています");
        setIsCheckingEmail(false); // 失敗したら戻す
        return;
      }
    } catch (e) {
      setServerError("サーバーエラーが発生しました");
      setIsCheckingEmail(false); // 失敗したら戻す
      return;
    }

    setServerError("");
    setIsCheckingEmail(false); // 完了したら戻す
    setStep(2);
  };

  // 送信処理
  const onSubmit = (data: SignupSchema) => {
    startTransition(async () => {
      try {
        await registerUser(data);
        router.push("/login");
      } catch (e: any) {
        setServerError(e.message || "登録に失敗しました");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg border border-gray-100">
        {/* Step 1: 基本情報 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">
                はじめまして！
              </h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  お名前 (ニックネーム)
                </label>
                <input
                  {...register("name")}
                  className={`w-full border p-3 rounded-lg outline-none transition
                    ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-amber-400"}`}
                  placeholder="カラオケ太郎"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className={`w-full border p-3 rounded-lg outline-none transition
                    ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-amber-400"}`}
                  placeholder="lion@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className={`w-full border p-3 rounded-lg outline-none transition pr-10
                      ${errors.password ? "border-red-500 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-amber-400"}`}
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
            </div>

            {serverError && (
              <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg">
                ⚠️ {serverError}
              </p>
            )}

            <button
              onClick={handleStep1Next}
              disabled={!isStep1Valid || isCheckingEmail} // チェック中も無効化
              className={`w-full font-bold py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2
                ${!isStep1Valid || isCheckingEmail
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" // 無効時の見た目
                  : "bg-amber-500 hover:bg-amber-600 text-white"}` // 有効時の見た目
              }
            >
              {/* ローディング表示 */}
              {isCheckingEmail ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                  確認中...
                </>
              ) : (
                "次へ進む"
              )}
            </button>
            <div className="text-center text-sm">
              すでにアカウントを持ってる？{" "}
              <Link href="/login" className="text-blue-500 underline">
                ログイン
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: 音域設定 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">
                音域チェック！
              </h1>
              <p className="text-gray-500 mt-2">
                {watch("name")}さんの声の高さは？
                <br />
                <span className="text-xs">※あとで変更できます</span>
              </p>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  最低音
                </label>
                <select
                  {...register("minNoteId")}
                  className="w-full border p-3 rounded-lg bg-white cursor-pointer"
                >
                  {NOTE_OPTIONS.map((n) => (
                    <option key={n.id} value={n.value}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  最高音
                </label>
                <select
                  {...register("maxNoteId")}
                  className="w-full border p-3 rounded-lg bg-white cursor-pointer"
                >
                  {NOTE_OPTIONS.map((n) => (
                    <option key={n.id} value={n.value}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errors.minNoteId && (
              <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg">
                ⚠️ {errors.minNoteId.message}
              </p>
            )}
            {serverError && (
              <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg">
                ⚠️ {serverError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition"
              >
                戻る
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={!isValid || isPending}
                className={`flex-2 font-bold py-3 rounded-xl transition shadow-md
                ${(!isValid || isPending)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" // 無効時の見た目
                  : "bg-amber-500 hover:bg-amber-600 text-white"}` // 有効時の見た目
              }
              >
                {isPending ? "登録中..." : "登録完了"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}