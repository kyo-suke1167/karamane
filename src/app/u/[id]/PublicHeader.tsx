"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

type Props = {
  user: {
    name: string | null;
    image: string | null;
  };
  songCount: number;
};

export default function PublicHeader({ user, songCount }: Props) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border h-14 flex items-center justify-center transition-transform duration-300 shadow-sm ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 flex items-center justify-between">
        
        {/* 左側：誰のリストか */}
        <div className="flex items-center gap-2 min-w-0 mr-2">
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-black text-foreground truncate leading-tight">
              {user.name || "名無し"}さんの曲リスト
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground leading-none mt-0.5">
              全 <span className="text-primary">{songCount}</span> 曲公開中🎤
            </p>
          </div>
        </div>

        {/* 右側：テーマ切り替え ＆ CTAボタン */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* テーマ切り替えボタン */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
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

          {/* KARAMANEの宣伝（CTA） */}
          <Link
            href="/"
            className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95"
          >
            <span className="hidden sm:inline">KARAMANEで作る</span>
            <span className="sm:hidden">KARAMANEで作る</span>
          </Link>
        </div>
      </div>
    </header>
  );
}