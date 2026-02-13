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

export function AddSongModal({ isOpen, onClose, allSongs, onAdd, isPending }: Props) {
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);

  // モーダルが開いてないときは何も表示しない
  if (!isOpen) return null;

  const handleToggleSongSelect = (id: number) => {
    setSelectedSongIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    onAdd(selectedSongIds);
    setSelectedSongIds([]); // 追加したらリセット
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm max-h-[80vh] rounded-2xl flex flex-col shadow-2xl relative">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">曲を追加</h2>
          <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
            {selectedSongIds.length}曲 選択中
          </span>
        </div>

        <div className="overflow-y-auto p-2 flex-1">
          {allSongs.length === 0 ? (
            <p className="text-center text-gray-500 py-4 font-bold">追加できる曲がありません</p>
          ) : (
            allSongs.map((song) => {
              const style = getStatusStyle(song.status);
              const isSelected = selectedSongIds.includes(song.id);

              return (
                <button
                  key={song.id}
                  onClick={() => handleToggleSongSelect(song.id)}
                  className={`w-full text-left p-3 mb-1 rounded-xl flex justify-between items-center group border transition
                    ${isSelected 
                      ? "bg-amber-50 border-amber-300 shadow-sm"
                      : "border-transparent hover:border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition
                      ${isSelected ? "bg-amber-500 border-amber-500" : "border-gray-300 bg-white"}`}
                    >
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${isSelected ? "text-amber-900" : "text-gray-800"}`}>
                        {song.title}
                      </div>
                      <div className="text-xs text-gray-500 font-bold">{song.artist}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${style.badgeColor}`}>
                    <div className="w-4 h-4 flex items-center justify-center">{style.icon}</div>
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold py-3 rounded-xl transition shadow-sm"
          >
            閉じる
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedSongIds.length === 0 || isPending}
            className={`flex-2 font-bold py-3 rounded-xl transition shadow-md
              ${(selectedSongIds.length === 0 || isPending)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-amber-500 hover:bg-amber-600 text-white"}`}
          >
            {isPending ? "追加中..." : `${selectedSongIds.length}曲を追加`}
          </button>
        </div>
      </div>
    </div>
  );
}