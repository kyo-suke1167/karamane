"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

type Props = {
  currentUser?: {
    name: string | null;
    image?: string | null;
  } | null;
};

export default function Header({ currentUser }: Props) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
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

                  {isMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10 cursor-default" 
                        onClick={() => setIsMenuOpen(false)}
                      />
                      
                      <div className="absolute right-0 top-12 w-48 bg-card rounded-xl shadow-xl border border-border-light overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="sm:hidden px-4 py-3 bg-muted border-b border-border-light text-sm font-bold text-foreground">
                          {displayName}さん
                        </div>

                        {/* 🦁 新機能：一括インポートへの導線！ */}
                        <Link
                          href="/songs/import"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 transition"
                        >
                          YouTubeから一括追加
                        </Link>

                        <Link
                          href="/settings/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-bold text-foreground hover:bg-muted hover:text-primary-hover transition border-t border-border-light"
                        >
                          ユーザー設定
                        </Link>

                        <Link
                          href="/pitch-test"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-bold text-foreground hover:bg-muted hover:text-primary-hover transition"
                        >
                          音域を測定する
                        </Link>

                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            signOut({ callbackUrl: "/login" });
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition border-t border-border-light"
                        >
                          ログアウト
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-sm font-bold text-foreground hover:text-primary transition">
                    ログイン
                  </Link>
                  <Link href="/signup" className="bg-foreground text-background hover:opacity-90 text-sm font-bold px-4 py-2 rounded-full transition shadow-sm">
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