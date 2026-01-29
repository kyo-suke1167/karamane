"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

type Props = {
  currentUser?: {
    name: string | null;
    image?: string | null;
  } | null;
};

export default function Header({ currentUser }: Props) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 表示名
  const displayName = currentUser?.name || session?.user?.name;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* ロゴ */}
        <Link 
          href="/" 
          className="text-xl font-black text-amber-500 tracking-tight hover:opacity-80 transition"
          onClick={() => setIsMenuOpen(false)} // ロゴ押したらメニュー閉じる
        >
          KARAMANE
        </Link>

        {/* 右側のメニューエリア */}
        <nav className="flex items-center gap-4">
          {status === "loading" ? null : (
            <>
              {session ? (
                <div className="relative">
                  <div className="flex items-center gap-3">
                    {/* PC版だけ名前を表示*/}
                    <span className="text-sm font-bold text-gray-600 hidden sm:block">
                      {displayName} さん
                    </span>

                    {/* ハンバーガーボタン */}
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 text-gray-500 hover:text-amber-500 hover:bg-amber-50 rounded-full transition"
                    >
                      {/* メニューが開いてたら「×」、閉じてたら「三」 */}
                      {isMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* ドロップダウンメニュー */}
                  {isMenuOpen && (
                    <>
                      {/* 背景をクリックしたら閉じるための透明な幕 */}
                      <div 
                        className="fixed inset-0 z-10 cursor-default" 
                        onClick={() => setIsMenuOpen(false)}
                      />
                      
                      {/* メニュー本体 */}
                      <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* スマホ用: 名前表示エリア */}
                        <div className="sm:hidden px-4 py-3 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-600">
                          {displayName}さん
                        </div>

                        <Link
                          href="/settings/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition"
                        >
                          ユーザー設定
                        </Link>

                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            signOut({ callbackUrl: "/login" });
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition border-t border-gray-100"
                        >
                          ログアウト
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* ログインしていない時 (変更なし) */
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-amber-500 transition">
                    ログイン
                  </Link>
                  <Link href="/signup" className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold px-4 py-2 rounded-full transition shadow-sm">
                    新規登録
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}