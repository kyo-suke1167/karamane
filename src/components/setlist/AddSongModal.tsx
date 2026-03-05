"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { getStatusStyle } from "@/lib/statusUtils";
import { Song } from "@/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  allSongs: Song[];
  onAdd: (selectedIds: number[]) => void;
  isPending: boolean;
  currentCount?: number;
};

//  【最適化】1曲ごとのUIを memo で包む
const SelectableSongItem = memo(function SelectableSongItem({
  song,
  isSelected,
  onToggle,
}: {
  song: Song;
  isSelected: boolean;
  onToggle: (id: number) => void;
}) {
  const style = getStatusStyle(song.status);

  return (
    <button
      onClick={() => onToggle(song.id)}
      className={`w-full text-left p-3 sm:p-4 rounded-xl flex justify-between items-center group border transition-all h-full
        ${
          isSelected
            ? "bg-primary/10 border-primary/50 shadow-sm"
            : "bg-card border-border sm:border-transparent sm:hover:border-border sm:hover:bg-muted shadow-sm sm:shadow-none"
        }`}
    >
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <div
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center transition-colors shrink-0
          ${isSelected ? "bg-primary border-primary" : "border-border bg-background group-hover:border-primary/50"}`}
        >
          {isSelected && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="min-w-0 pr-2">
          <div className={`font-bold text-sm sm:text-base transition-colors truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
            {song.title}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground font-bold truncate mt-0.5">
            {song.artist}
          </div>
        </div>
      </div>
      <span className={`shrink-0 text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border ${style.badgeColor}`}>
        <div className="flex items-center justify-center gap-1">
          <span className="w-3 h-3 sm:w-4 sm:h-4">{style.icon}</span>
          <span className="hidden sm:inline font-bold">{style.label}</span>
        </div>
      </span>
    </button>
  );
});

export function AddSongModal({
  isOpen,
  onClose,
  allSongs,
  onAdd,
  isPending,
  currentCount = 0,
}: Props) {
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const totalCount = currentCount + selectedSongIds.length;
  const isMaxReached = totalCount >= 100;

  const handleToggleSongSelect = useCallback((id: number) => {
    setSelectedSongIds((prev) => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        return prev.filter((item) => item !== id);
      } else {
        if (currentCount + prev.length >= 100) {
          alert(`セットリストの上限は100曲です！\n(すでに ${currentCount + prev.length} 曲選択しています)\n\nこれ以上は追加できません`);
          return prev;
        }
        return [...prev, id];
      }
    });
  }, [currentCount]);

  const handleAdd = () => {
    if (totalCount > 100) {
      alert("セットリストの上限は100曲です！チェックを外してください");
      return;
    }
    onAdd(selectedSongIds);
    setSelectedSongIds([]);
    setSearchQuery("");
  };

  const handleClose = () => {
    setSelectedSongIds([]);
    setSearchQuery("");
    onClose();
  };

  const filteredSongs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return allSongs;
    return allSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );
  }, [allSongs, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-4xl h-[85vh] sm:h-[90vh] rounded-2xl flex flex-col shadow-2xl relative transition-colors overflow-hidden">
        
        {/* ヘッダー */}
        <div className="p-4 sm:px-6 border-b border-border-light flex justify-between items-center bg-card z-20 shrink-0">
          <h2 className="text-lg sm:text-xl font-black text-foreground">曲を追加</h2>
          <span
            className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full transition-colors ${
              isMaxReached
                ? "text-red-500 bg-red-500/10 border border-red-500/20"
                : "text-primary bg-primary/10 border border-primary/20"
            }`}
          >
            {selectedSongIds.length}曲 選択中 {isMaxReached && "(上限)"}
          </span>
        </div>

        {/* 検索窓 */}
        <div className="p-3 sm:p-4 bg-card border-b border-border-light z-10 shrink-0 shadow-sm">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="曲名やアーティスト名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 sm:pl-11 pr-10 py-3 text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground placeholder:font-normal shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* リスト部分 */}
        <div className="overflow-y-auto p-3 sm:p-5 flex-1 bg-background/30">
          {allSongs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-bold text-lg">追加できる曲がありません</p>
              <p className="text-sm text-muted-foreground mt-2">先に「新しい曲を登録」から曲を追加してね！</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-bold text-base">「{searchQuery}」に一致する曲が見つかりません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 sm:gap-2">
              {filteredSongs.map((song) => (
                <SelectableSongItem
                  key={song.id}
                  song={song}
                  isSelected={selectedSongIds.includes(song.id)}
                  onToggle={handleToggleSongSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 sm:p-5 border-t border-border-light bg-muted flex gap-3 transition-colors z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] shrink-0">
          <button onClick={handleClose} className="flex-1 bg-card border border-border hover:bg-background text-foreground font-bold py-3.5 sm:py-4 sm:text-lg rounded-xl transition-colors shadow-sm active:scale-95">
            キャンセル
          </button>
          <button onClick={handleAdd} disabled={selectedSongIds.length === 0 || isPending} className={`flex-2 font-bold py-3.5 sm:py-4 sm:text-lg rounded-xl transition-all shadow-md active:scale-95 ${selectedSongIds.length === 0 || isPending ? "bg-background border border-border text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary-hover text-primary-foreground"}`}>
            {isPending ? "追加中..." : `${selectedSongIds.length}曲を追加する`}
          </button>
        </div>
      </div>
    </div>
  );
}