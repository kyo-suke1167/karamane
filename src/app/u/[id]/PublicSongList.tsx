"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

type PublicSong = {
  id: number;
  title: string;
  artist: string;
  status: string;
  youtubeUrl: string | null;
  createdAt: Date;
};

export default function PublicSongList({ songs }: { songs: PublicSong[], now?: number }) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNow(Date.now());
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
    const textToCopy = `リクエスト：${song.title} / ${song.artist}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(song.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("コピーに失敗しました", err);
      alert("コピーに失敗しました。お手数ですが手動で入力をお願いします🙇‍♂️");
    }
  };

  // ==========================================
  // 仮想スクロールの設定
  // ==========================================
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
  }, [debouncedQuery]); // 検索結果が変わった時も再計算！

  const rowVirtualizer = useWindowVirtualizer({
    count: filteredSongs.length,
    estimateSize: () => 74,
    overscan: 10,
    scrollMargin: listOffset,
  });

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="曲名やアーティストで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-shadow text-foreground shadow-sm placeholder:text-muted-foreground text-sm sm:text-base font-medium"
        />
        {/* 検索中（文字を打っている最中）はクリアボタンを出す */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}
      </div>

      {filteredSongs.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border border-dashed">
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
            const isNew = now !== null && (now - new Date(song.createdAt).getTime() < THIRTY_DAYS_MS);
            
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
                {/* カードの中身 */}
                <div className="bg-card border border-border px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-sm flex items-center justify-between gap-2 sm:gap-3 transition-all hover:bg-muted/50 hover:shadow-md group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5 sm:mb-0">
                      <h3 className="font-bold text-sm sm:text-base text-foreground truncate leading-tight">
                        {song.title}
                      </h3>
                      {isNew && (
                        <span className="shrink-0 bg-linear-to-r from-cyan-500 to-blue-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-sm transform -skew-x-6">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                      {song.artist}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyRequest(song)}
                    title="リクエスト文をコピー"
                    className={`shrink-0 flex items-center justify-center gap-1 w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg sm:font-bold transition-all shadow-sm active:scale-95 ${
                      copiedId === song.id 
                        ? "bg-green-500 text-white shadow-green-500/20" 
                        : "bg-primary text-primary-foreground hover:bg-primary-hover"
                    }`}
                  >
                    {copiedId === song.id ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-3.5 sm:h-3.5">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline text-[10px] sm:text-xs">完了</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-3.5 sm:h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.566 2.25h-3.132a2.25 2.25 0 00-2.1 1.638m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184m-7.332 0h13.332c.12.031.233.076.338.134m-13.67 0c-.105.058-.218.103-.338.134m13.67 0a2.10 2.10 0 00-3.182-3.182m0 0a2.10 2.10 0 01-3.182 3.182M12 12.75l3 3m0 0l3-3m-3 3v-7.5" />
                        </svg>
                        <span className="hidden sm:inline text-[10px] sm:text-xs">リクエスト</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}