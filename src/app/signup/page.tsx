"use client";

import { useState } from "react";
import { registerUser, checkEmail } from "@/app/actions";
import { NOTE_OPTIONS } from "@/lib/noteUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // 入力データ
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    minNoteId: 60, // mid2C
    maxNoteId: 72, // hiC
  });

  const handleStep1Next = async() => {
    // 1. 空チェック
    if (!formData.name || !formData.email || !formData.password) {
      setError("全部入力してください！");
      return;
    }

    // 2. パスワードの長さチェック (8文字以上)
    if (formData.password.length < 8) {
      setError("パスワードは8文字以上にしてください");
      return;
    }

    // 3. 半角チェック (英数字・記号のみ許可)
    if (!/^[\x20-\x7e]+$/.test(formData.password)) {
      setError("パスワードは半角英数字・記号で入力してください");
      return;
    }

    try {
      const isEmailTaken = await checkEmail(formData.email);
      if (isEmailTaken) {
        setError("そのメールアドレスは既に登録されています！");
        return;
      }
    } catch (e) {
      setError("サーバーと通信できませんでした...");
      return;
    }

    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    try {
      if (formData.minNoteId > formData.maxNoteId) {
        setError("音域が逆転しています");
        return;
      }
      
      await registerUser(formData);
      
      router.push("/login");
    } catch (e: any) {
      setError(e.message || "登録に失敗しました...");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg">
        
        {/* Step 1: 基本情報 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">はじめまして！</h1>
              <p className="text-gray-500 mt-2">まずはあなたについて教えてください！</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">お名前 (ニックネーム)</label>
                <input 
                  type="text" 
                  className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="カラオケ太郎"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">メールアドレス</label>
                <input 
                  type="email" 
                  className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="lion@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">パスワード</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 pr-10" // pr-10で右側に余白確保
                    placeholder="半角英数字8文字以上"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-amber-500 transition"
                  >
                    {showPassword ? (
                      // 目が開いているアイコン (表示中)
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      // 目に斜線が入っているアイコン (非表示中)
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

            <button 
              onClick={handleStep1Next}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition shadow-md"
            >
              次へ進む
            </button>
            
            <div className="text-center text-sm">
              すでにアカウントを持ってる？ <Link href="/login" className="text-blue-500 underline">ログイン</Link>
            </div>
          </div>
        )}

        {/* Step 2: 音域設定 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">音域チェック！</h1>
              <p className="text-gray-500 mt-2">
                {formData.name}さんの声の高さはどれくらいですか？<br/>
                <span className="text-xs">※あとで変更できます</span>
              </p>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">最低音</label>
                <div className="relative">
                  <select 
                    value={formData.minNoteId}
                    onChange={(e) => setFormData({...formData, minNoteId: Number(e.target.value)})}
                    className="w-full border p-3 rounded-lg appearance-none bg-white"
                  >
                    {NOTE_OPTIONS.map(n => <option key={n.id} value={n.value}>{n.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">最高音</label>
                <div className="relative">
                  <select 
                    value={formData.maxNoteId}
                    onChange={(e) => setFormData({...formData, maxNoteId: Number(e.target.value)})}
                    className="w-full border p-3 rounded-lg appearance-none bg-white"
                  >
                    {NOTE_OPTIONS.map(n => <option key={n.id} value={n.value}>{n.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition"
              >
                戻る
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-[2] bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition shadow-md"
              >
                登録完了
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}