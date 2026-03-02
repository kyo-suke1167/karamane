"use client";

import { useState } from "react";
import { getStatusStyle } from "@/lib/statusUtils";
import { Song } from "@/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  allSongs: Song[];
  onAdd: (selectedIds: number[]) => void;
  isPending: boolean;
};

export function AddSongModal({
  isOpen,
  onClose,
  allSongs,
  onAdd,
  isPending,
}: Props) {
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const handleToggleSongSelect = (id: number) => {
    setSelectedSongIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleAdd = () => {
    onAdd(selectedSongIds);
    setSelectedSongIds([]);
    setSearchQuery("");
  };

  const handleClose = () => {
    setSelectedSongIds([]);
    setSearchQuery("");
    onClose();
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
        {/* ヘッダー */}
        <div className="p-4 border-b border-border-light flex justify-between items-center bg-card z-20 shrink-0">
          <h2 className="text-lg font-black text-foreground">曲を追加</h2>
          <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-full">
            {selectedSongIds.length}曲 選択中
          </span>
        </div>

        {/* 検索窓（固定） */}
        <div className="p-3 bg-card border-b border-border-light z-10 shrink-0 shadow-sm">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="曲名やアーティスト名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground placeholder:font-normal"
            />
            {/* クリアボタン */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* リスト部分 */}
        <div className="overflow-y-auto p-2 flex-1 bg-background/30">
          {allSongs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground font-bold">
                追加できる曲がありません
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                先に「新しい曲を登録」から曲を追加してね！
              </p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground font-bold text-sm">
                「{searchQuery}」に一致する曲が見つかりません
              </p>
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
                    ${
                      isSelected
                        ? "bg-primary/10 border-primary/50 shadow-sm"
                        : "bg-card border-transparent hover:border-border hover:bg-muted"
                    }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0
                      ${isSelected ? "bg-primary border-primary" : "border-border bg-background group-hover:border-primary/50"}`}
                    >
                      {isSelected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-3.5 h-3.5 text-primary-foreground"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`font-bold text-sm transition-colors truncate ${isSelected ? "text-primary" : "text-foreground"}`}
                      >
                        {song.title}
                      </div>
                      <div className="text-xs text-muted-foreground font-bold truncate">
                        {song.artist}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 ml-2 text-[10px] px-1.5 py-0.5 rounded border ${style.badgeColor}`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      {style.icon}
                    </div>
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-border-light bg-muted flex gap-3 transition-colors z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] shrink-0">
          <button
            onClick={handleClose}
            className="flex-1 bg-card border border-border hover:bg-background text-foreground font-bold py-3.5 rounded-xl transition-colors shadow-sm active:scale-95"
          >
            キャンセル
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedSongIds.length === 0 || isPending}
            className={`flex-2 font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95
              ${
                selectedSongIds.length === 0 || isPending
                  ? "bg-background border border-border text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary-hover text-primary-foreground"
              }`}
          >
            {isPending ? "追加中..." : `${selectedSongIds.length}曲を追加する`}
          </button>
        </div>
      </div>
    </div>
  );
}
