"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {

  const { data: session, status } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* ロゴ */}
        <Link href="/" className="text-xl font-black text-amber-500 tracking-tight hover:opacity-80 transition">
          KARAMANE
        </Link>

        {/* 右側のメニューエリア */}
        <nav className="flex items-center gap-4">
          
          {/* ローディング中は何も出さない（チラつき防止） */}
          {status === "loading" ? null : (
            <>
              {/* ログインしている時 */}
              {session ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-600 hidden sm:block">
                    {session.user?.name} さん
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-xs font-bold text-gray-500 hover:text-red-500 transition"
                  >
                    ログアウト
                  </button>
                  <Link
                    href="/songs/create"
                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-full transition shadow-sm"
                  >
                    + 追加
                  </Link>
                </div>
              ) : (
                /* ログインしていない時 */
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-bold text-gray-600 hover:text-amber-500 transition"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold px-4 py-2 rounded-full transition shadow-sm"
                  >
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