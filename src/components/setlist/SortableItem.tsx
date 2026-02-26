"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getStatusStyle } from "@/lib/statusUtils";
import { SetlistEntryWithSong } from "@/types";

type Props = {
  entry: SetlistEntryWithSong;
  index: number;
  isEditMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  setlistId: number;
};

export function SortableItem({ entry, index, isEditMode, isSelected, onToggleSelect, setlistId }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: entry.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusStyle = getStatusStyle(entry.song.status);

  // カードの中身
  const CardContent = (
    <div className={`relative flex items-center justify-between px-3 py-2 bg-card rounded-xl shadow-sm border border-border border-l-4 transition-colors h-full
      ${statusStyle.cardBorder} 
      ${isEditMode ? "" : "hover:shadow-md"}
      ${isSelected ? "bg-primary/10 ring-2 ring-primary border-l-transparent dark:bg-primary/20" : ""} 
      min-h-18 
    `}>

      <div className="flex items-center gap-3 overflow-hidden w-full">
        
        {/* 左側エリア (アイコン or チェックボックス) */}
        <div className="shrink-0 w-10 h-10 flex items-center justify-center">
          {isEditMode ? (
            // 編集モード: チェックボックス
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
              ${isSelected ? "bg-primary border-primary" : "border-border bg-background"}`}
            >
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary-foreground">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          ) : (
            // 通常モード :　トラック番号
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-sm bg-muted border-border font-black text-foreground text-sm`}>
              {index + 1}
            </div>
          )}
        </div>

        {/* 中央エリア: 曲情報 */}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-foreground leading-tight truncate text-sm sm:text-base mb-0.5">
            {entry.song.title}
          </div>
          <div className="text-xs text-muted-foreground font-bold truncate">
            {entry.song.artist}
          </div>
        </div>
      </div>

      {/* 右側エリア (ハンドル or キー情報) */}
      <div className="flex items-center justify-center w-16 shrink-0">
        {isEditMode ? (
          // 編集モード: ドラッグハンドル
          <div {...attributes} {...listeners} className="text-muted-foreground cursor-grab active:cursor-grabbing p-2 touch-none outline-none hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          // 通常モード: キー情報
          entry.song.key !== 0 ? (
            <span className="text-xs font-mono font-black bg-muted text-muted-foreground px-2 py-1 rounded-lg border border-border whitespace-nowrap">
              {entry.song.key > 0 ? `+${entry.song.key}` : entry.song.key}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground px-2 py-1 opacity-50">
              原キー
            </span>
          )
        )}
      </div>
    </div>
  );

  if (isEditMode) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        onClick={() => onToggleSelect(entry.id)}
        className="select-none cursor-pointer"
      >
        {CardContent}
      </div>
    );
  } else {
    return (
      <Link 
        href={`/songs/${entry.song.id}?backUrl=/setlists/${setlistId}`} 
        ref={setNodeRef} 
        style={style} 
        className="block"
      >
        {CardContent}
      </Link>
    );
  }
}