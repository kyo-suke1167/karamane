"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon, SearchIcon, CloseIcon } from "@/components/ui/Icons";

type PublicSong = {
  id: number;
  title: string;
  artist: string;
  status: string;
  youtubeUrl: string | null;
  createdAt: Date;
};

export default function PublicSongList({ songs }: { songs: PublicSong[] }) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const [nowState, setNowState] = useState<number | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNowState(Date.now());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  const filteredSongs = useMemo(() => {
    if (!debouncedQuery) return songs;
    const lowerQuery = debouncedQuery.toLowerCase();
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist.toLowerCase().includes(lowerQuery)
    );
  }, [songs, debouncedQuery]);

  const handleCopyRequest = async (song: PublicSong) => {
    const textToCopy = `${song.title} / ${song.artist}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(song.id);
      
      setToastMessage(`「${song.title} / ${song.artist}」をコピーしました！`);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setCopiedId(null);
        setToastMessage(null);
      }, 2500);

    } catch (err) {
      console.error("コピーに失敗しました", err);
      alert("コピーに失敗しました。お手数ですが手動で入力をお願いします🙇‍♂️");
    }
  };

  const listRef = useRef<HTMLDivElement>(null);
  const [listOffset, setListOffset] = useState(0);

  useEffect(() => {
    const updateOffset = () => {
      if (listRef.current) {
        const rect = listRef.current.getBoundingClientRect();
        setListOffset(rect.top + window.scrollY);
      }
    };
    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, [debouncedQuery]);

  const rowVirtualizer = useWindowVirtualizer({
    count: filteredSongs.length,
    estimateSize: () => 74,
    overscan: 10,
    scrollMargin: listOffset,
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      
      {/* 検索バー */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <SearchIcon className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="曲名やアーティストで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-shadow text-foreground shadow-sm placeholder:text-muted-foreground text-sm sm:text-base font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 使い方バナー */}
      <div className="flex justify-center sm:justify-start px-2 mb-1">
        <p className="text-[11px] sm:text-xs font-bold text-muted-foreground flex items-center gap-1.5">
          曲をタップするとリクエスト用にコピーされます
        </p>
      </div>

      {/* リスト表示部分 */}
      {filteredSongs.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border border-dashed mt-4">
          <p className="text-muted-foreground font-bold">
            {searchQuery ? "見つかりませんでした" : "まだ公開されている曲がありません"}
          </p>
        </div>
      ) : (
        <div 
          ref={listRef} 
          style={{ 
            position: "relative", 
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%" 
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const song = filteredSongs[virtualRow.index];
            const isNew = nowState !== null && (nowState - new Date(song.createdAt).getTime() < THIRTY_DAYS_MS);
            const isPracticing = song.status === "PRACTICING";
            
            const isCopied = copiedId === song.id;

            return (
              <div 
                key={song.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start - listOffset}px)`,
                  paddingBottom: "8px",
                }}
              >
                {/* コピー時は右に余白を作ってチェックマークを絶対配置 */}
                <button
                  onClick={() => handleCopyRequest(song)}
                  className={`relative w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-sm flex items-center justify-between transition-all active:scale-[0.98] border ${
                    isCopied 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-500 shadow-green-500/20" 
                      : "bg-card border-border hover:bg-muted/50 hover:shadow-md hover:border-primary/30"
                  }`}
                >
                  <div className={`min-w-0 flex-1 transition-all duration-200 ${isCopied ? "pr-8" : ""}`}>
                    <div className="flex items-center gap-2 mb-0.5 sm:mb-0">
                      <h3 className={`font-bold text-sm sm:text-base truncate leading-tight transition-colors ${isCopied ? "text-green-700 dark:text-green-400" : "text-foreground"}`}>
                        {song.title}
                      </h3>
                      {isPracticing && (
                        <span className="shrink-0 bg-orange-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-sm">
                          練習中
                        </span>
                      )}
                      {isNew && (
                        <span className="shrink-0 bg-linear-to-r from-cyan-500 to-blue-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-sm transform -skew-x-6">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] sm:text-xs truncate transition-colors ${isCopied ? "text-green-600/80 dark:text-green-400/80" : "text-muted-foreground"}`}>
                      {song.artist}
                    </p>
                  </div>

                  {/* コピーされた時だけ右端にチェックマークが出現 */}
                  {isCopied && (
                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 shrink-0 flex items-center justify-center">
                      <CheckIcon className="w-5 h-5 text-green-500 animate-in zoom-in duration-200" />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* トースト通知 */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-none">
          <div className="bg-foreground text-background px-4 py-2.5 sm:px-5 sm:py-3 rounded-full shadow-2xl text-[11px] sm:text-xs font-bold flex items-center gap-2 max-w-[90vw] truncate">
            <CheckIcon className="w-4 h-4 text-green-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}