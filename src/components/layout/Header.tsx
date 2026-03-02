"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { BulkDeleteModal } from "../song/BulkDeleteModal";

type Props = {
  currentUser?: {
    name: string | null;
    image?: string | null;
  } | null;
};

export default function Header({ currentUser }: Props) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  const displayName = currentUser?.name || session?.user?.name;
  const pathname = usePathname();
  const isSetlistDetail = /^\/setlists\/\d+$/.test(pathname);

  if (isSetlistDetail) return null;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-black text-primary tracking-tight hover:opacity-80 transition"
          onClick={() => setIsMenuOpen(false)}
        >
          KARAMANE
        </Link>

        <nav className="flex items-center gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
              aria-label="テーマ切り替え"
            >
              {theme === "dark" ? (
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
                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
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
                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                  />
                </svg>
              )}
            </button>
          )}

          {status === "loading" ? null : (
            <>
              {session ? (
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground hidden sm:block">
                      {displayName} さん
                    </span>

                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition"
                    >
                      {isMenuOpen ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={() => setIsMenuOpen(false)}
                      />

                      {/* ハンバーガーメニュー */}
                      <div className="absolute right-0 top-12 w-64 bg-card border border-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                        {/* 1. ユーザー情報セクション */}
                        <div className="px-4 py-3 border-b border-border-light mb-2">
                          <p className="text-sm font-black text-foreground truncate">
                            {displayName} さん
                          </p>
                        </div>

                        {/* 2. 通常機能メニュー */}
                        <div className="flex flex-col">
                          {/* 一括インポート */}
                          <Link
                            href="/songs/import"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                />
                              </svg>
                            </div>
                            YouTubeから曲を一括追加
                          </Link>

                          {/* 音域測定 */}
                          <Link
                            href="/pitch-test"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-foreground hover:bg-muted transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                                />
                              </svg>
                            </div>
                            音域を測定する
                          </Link>

                          {/* ユーザー設定 */}
                          <Link
                            href="/settings/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-foreground hover:bg-muted transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </div>
                            ユーザー設定
                          </Link>
                        </div>

                        {/* 3. デンジャラスゾーン（赤色・破壊的アクション） */}
                        <div className="mt-2 pt-2 border-t border-border-light flex flex-col">
                          {/* 一括削除 */}
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsDeleteModalOpen(true);
                            }}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            </div>
                            曲を一括削除する
                          </button>

                          {/* ログアウト */}
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              signOut({ callbackUrl: "/login" });
                            }}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                />
                              </svg>
                            </div>
                            ログアウト
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-bold text-foreground hover:text-primary transition"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-foreground text-background hover:opacity-90 text-sm font-bold px-4 py-2 rounded-full transition shadow-sm"
                  >
                    新規登録
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>

      <BulkDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </header>
  );
}
