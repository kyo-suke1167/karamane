"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { CheckIcon, CopyIcon, XIcon, SunIcon, MoonIcon } from "@/components/ui/Icons";

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

  // シェア機能用の状態
  const [currentUrl, setCurrentUrl] = useState("");
  const [isUrlCopied, setIsUrlCopied] = useState(false);
  
  // トースト通知用の状態とタイマー
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setCurrentUrl(window.location.href);
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

  // URLコピーの処理
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setIsUrlCopied(true);
      
      // トースト通知を表示
      setToastMessage("ポータルのURLをコピーしました！");
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setIsUrlCopied(false);
        setToastMessage(null);
      }, 2500);

    } catch (err) {
      console.error("URLのコピーに失敗しました", err);
    }
  };

  // Xシェア用テキストの生成
  const tweetText = encodeURIComponent(`${user.name || "名無し"}さんの歌える曲リストはこちら！\n`);
  const tweetUrl = currentUrl ? `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(currentUrl)}` : "#";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border h-14 flex items-center justify-center transition-transform duration-300 shadow-sm ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 flex items-center justify-between">
          
          {/* 左側：誰のリストか ＆ テーマ切り替え */}
          <div className="flex items-center gap-3 min-w-0 mr-2">
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-black text-foreground truncate leading-tight">
                {user.name || "名無し"}さんの曲リスト
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground leading-none mt-0.5">
                全 <span className="text-primary">{songCount}</span> 曲公開中🎤
              </p>
            </div>

            {/* テーマ切り替えボタン */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors shrink-0"
                aria-label="テーマ切り替え"
              >
                {theme === "dark" ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* 右側：シェアアイコン ＆ CTAボタン */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {mounted && (
              <>
                {/* 🔗 URLコピーボタン */}
                <button
                  onClick={handleCopyUrl}
                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors relative"
                  aria-label="URLをコピー"
                  title="URLをコピー"
                >
                  {isUrlCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                </button>

                {/* 𝕏 X（Twitter）シェアボタン */}
                <a
                  href={tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                  aria-label="Xでシェア"
                  title="Xでシェア"
                >
                  <XIcon className="w-4 h-4" />
                </a>
              </>
            )}

            {/* KARAMANEの宣伝（CTA） */}
            <Link
              href="/"
              className="ml-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95"
            >
              <span className="hidden sm:inline">KARAMANEで作る</span>
              <span className="sm:hidden">KARAMANE</span>
            </Link>
          </div>
        </div>
      </header>

      {/* URLコピー用のトースト通知 */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-100 animate-in fade-in slide-in-from-top-5 duration-300 pointer-events-none">
          <div className="bg-foreground text-background px-4 py-2.5 sm:px-5 sm:py-3 rounded-full shadow-2xl text-[11px] sm:text-xs font-bold flex items-center gap-2 max-w-[90vw] truncate">
            <CheckIcon className="w-4 h-4 text-green-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}