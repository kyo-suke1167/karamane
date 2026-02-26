"use client";

import { useState, useEffect, useTransition } from "react";
import { getStatusStyle } from "@/lib/statusUtils";
import { getUserSongsForModal, deleteSongs } from "@/app/actions";
import { useRouter } from "next/navigation";

type SongMin = {
  id: number;
  title: string;
  artist: string;
  status: any;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function BulkDeleteModal({ isOpen, onClose }: Props) {
  const [allSongs, setAllSongs] = useState<SongMin[]>([]);
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

// モーダルが開かれた瞬間に曲データを取得
  useEffect(() => {
    // 閉じた時の処理（リセット）
    if (!isOpen) {
      setSelectedSongIds([]);
      setSearchQuery("");
      return;
    }

    // 開いた時の処理
    let ignore = false; // 通信中にモーダルが閉じられた時のための安全装置

    const fetchSongs = async () => {
      setIsLoading(true);
      try {
        const data = await getUserSongsForModal();
        if (!ignore) {
          setAllSongs(data);
        }
      } catch (error) {
        console.error("曲の取得に失敗しました", error);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchSongs();

    // クリーンアップ関数（モーダルが閉じられたら ignore を true にする）
    return () => {
      ignore = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSongSelect = (id: number) => {
    setSelectedSongIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    // 誤操作防止の最終確認
    if (!confirm(`本当に ${selectedSongIds.length} 曲を削除しますか？\n※この操作は取り消せません！`)) return;

    startTransition(async () => {
      await deleteSongs(selectedSongIds);
      router.refresh(); // 画面を更新して消えたことを反映
      onClose();
    });
  };

  const filteredSongs = allSongs.filter((song) => {
    const query = searchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-sm h-[80vh] sm:h-150 rounded-2xl flex flex-col shadow-2xl relative transition-colors overflow-hidden">
        
        {/* ヘッダー（赤色仕様！） */}
        <div className="p-4 border-b border-border-light flex justify-between items-center bg-card z-20 shrink-0">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
            曲を一括削除
          </h2>
          <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 px-2 py-1 rounded-full">
            {selectedSongIds.length}曲 選択中
          </span>
        </div>

        {/* 検索窓（固定） */}
        <div className="p-3 bg-card border-b border-border-light z-10 shrink-0 shadow-sm">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="削除したい曲を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-400 transition-all text-foreground placeholder:text-muted-foreground placeholder:font-normal"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* リスト部分 */}
        <div className="overflow-y-auto p-2 flex-1 bg-background/30">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground font-bold animate-pulse">
              曲を読み込み中...
            </div>
          ) : allSongs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground font-bold">登録されている曲がありません</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground font-bold text-sm">「{searchQuery}」に一致する曲が見つかりません</p>
            </div>
          ) : (
            filteredSongs.map((song) => {
              const style = getStatusStyle(song.status);
              const isSelected = selectedSongIds.includes(song.id);

              return (
                <button
                  key={song.id}
                  onClick={() => handleToggleSongSelect(song.id)}
                  className={`w-full text-left p-3 mb-1.5 rounded-xl flex justify-between items-center group border transition-all
                    ${isSelected 
                      ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 shadow-sm"
                      : "bg-card border-transparent hover:border-border hover:bg-muted"}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* チェックボックス（赤色仕様） */}
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0
                      ${isSelected ? "bg-red-500 border-red-500" : "border-border bg-background group-hover:border-red-500/50"}`}
                    >
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={`font-bold text-sm transition-colors truncate ${isSelected ? "text-red-700 dark:text-red-400" : "text-foreground"}`}>
                        {song.title}
                      </div>
                      <div className="text-xs text-muted-foreground font-bold truncate">{song.artist}</div>
                    </div>
                  </div>
                  <span className={`shrink-0 ml-2 text-[10px] px-1.5 py-0.5 rounded border ${style.badgeColor}`}>
                    <div className="w-4 h-4 flex items-center justify-center">{style.icon}</div>
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-border-light bg-muted flex gap-3 transition-colors z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] shrink-0">
          <button
            onClick={onClose}
            className="flex-1 bg-card border border-border hover:bg-background text-foreground font-bold py-3.5 rounded-xl transition-colors shadow-sm active:scale-95"
          >
            キャンセル
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedSongIds.length === 0 || isPending}
            className={`flex-2 font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95
              ${(selectedSongIds.length === 0 || isPending)
                ? "bg-background border border-border text-muted-foreground cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"}`}
          >
            {isPending ? "削除中..." : `${selectedSongIds.length}曲を削除する`}
          </button>
        </div>
      </div>
    </div>
  );
}