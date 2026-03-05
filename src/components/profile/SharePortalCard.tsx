"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CopyIcon, CheckIcon, XIcon, ExternalLinkIcon } from "@/components/ui/Icons";

type Props = {
  userId: string;
  userName: string | null;
};

export default function SharePortalCard({ userId, userName }: Props) {
  const [currentOrigin, setCurrentOrigin] = useState("");
  const [isUrlCopied, setIsUrlCopied] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentOrigin(window.location.origin);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const portalUrl = currentOrigin ? `${currentOrigin}/u/${userId}` : "";

  const handleCopyUrl = async () => {
    if (!portalUrl) return;
    
    try {
      await navigator.clipboard.writeText(portalUrl);
      setIsUrlCopied(true);
      
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

  const tweetText = encodeURIComponent(`${userName || "名無し"}さんの歌える曲リストはこちら！🎤✨\n`);
  const tweetUrl = portalUrl ? `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(portalUrl)}` : "#";

  return (
    <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/5 pointer-events-none">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>

      <div className="relative z-10">
        <h2 className="text-base sm:text-lg font-black text-foreground mb-1 flex items-center gap-2">
          あなたの「歌える曲リスト」公開ポータル
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 font-bold">
          リスナーに共有して、リクエストをもらおう！
        </p>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          
          {/* URLコピーボタン */}
          <button
            onClick={handleCopyUrl}
            className="flex-1 min-w-0 flex items-center justify-between bg-card border border-border px-3 py-3 rounded-xl hover:border-primary/50 transition-colors group shadow-sm active:scale-[0.98]"
          >
            <span className="text-xs sm:text-sm text-muted-foreground truncate mr-3 select-all text-left">
              {portalUrl || "読み込み中..."}
            </span>
            <div className={`shrink-0 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md transition-colors ${isUrlCopied ? "bg-green-500/10 text-green-500" : "bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground"}`}>
              {isUrlCopied ? (
                <><CheckIcon className="w-3.5 h-3.5" />完了</>
              ) : (
                <><CopyIcon className="w-3.5 h-3.5" />コピー</>
              )}
            </div>
          </button>

          <div className="flex items-stretch gap-2 w-full sm:w-auto">
            {/* ポータル確認ボタン */}
            <Link
              href={`/u/${userId}`}
              target="_blank"
              rel="noopener noreferrer"
              title="ポータルを確認する"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm active:scale-95 whitespace-nowrap"
            >
              <ExternalLinkIcon className="w-4 h-4" />
              確認する
            </Link>

            {/* X（Twitter）ポストボタン */}
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black px-4 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm active:scale-95 whitespace-nowrap"
            >
              <XIcon className="w-4 h-4" />
              ポスト
            </a>
          </div>
        </div>
      </div>

      {/* トースト通知 */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-100 animate-in fade-in slide-in-from-top-5 duration-300 pointer-events-none">
          <div className="bg-foreground text-background px-4 py-2.5 sm:px-5 sm:py-3 rounded-full shadow-2xl text-[11px] sm:text-xs font-bold flex items-center gap-2 max-w-[90vw] truncate">
            <CheckIcon className="w-4 h-4 text-green-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}