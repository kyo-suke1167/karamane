"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  addSongsToSetlist, 
  removeSongsFromSetlist,
  reorderSetlist,
} from "@/app/actions";
import { getStatusStyle } from "@/lib/statusUtils";

// 型定義
type Song = { 
  id: number; 
  title: string; 
  artist: string;
  status: "PRACTICING" | "LEARNED" | "MASTERED";
  key: number;
  minNoteId: number | null;
  maxNoteId: number | null; 
};

type SetlistEntry = { id: number; order: number; song: Song };

type Setlist = { 
  id: number; 
  title: string; 
  description: string | null; 
  createdAt: Date;
  entries: SetlistEntry[] 
};

function SortableItem({ 
  entry, 
  isEditMode, 
  isSelected, 
  onToggleSelect, 
  setlistId 
}: { 
  entry: SetlistEntry; 
  isEditMode: boolean; 
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  setlistId: number 
}) {
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
    <div className={`relative flex items-center justify-between px-3 py-2 bg-white rounded-xl shadow-sm border-l-4 transition h-full
      ${statusStyle.cardBorder} 
      ${isEditMode ? "" : "hover:shadow-md"}
      ${isSelected ? "bg-amber-50 ring-2 ring-amber-400 border-l-transparent" : ""} 
      min-h-18 
    `}>

      <div className="flex items-center gap-3 overflow-hidden w-full">
        
        {/* 左側エリア */}
        <div className="shrink-0 w-10 h-10 flex items-center justify-center">
          {isEditMode ? (
            // 編集モード: チェックボックス
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition
              ${isSelected ? "bg-amber-500 border-amber-500" : "border-gray-200 bg-white"}`}
            >
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center bg-white shadow-sm ${statusStyle.badgeColor}`}>
              {statusStyle.icon}
            </div>
          )}
        </div>

        {/* 中央エリア: 曲情報 */}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-gray-800 leading-tight truncate text-sm sm:text-base mb-0.5">
            {entry.song.title}
          </div>
          <div className="text-xs text-gray-500 font-bold truncate">
            {entry.song.artist}
          </div>
        </div>
      </div>

      {/* 右側エリア: w-16 (64px) で固定 */}
      <div className="flex items-center justify-end w-16 shrink-0 pl-2">
        {isEditMode ? (
          // 編集モード: ドラッグハンドル
          <div {...attributes} {...listeners} className="text-gray-400 cursor-grab active:cursor-grabbing p-2 -mr-2 touch-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          // 通常モード: キー情報
          entry.song.key !== 0 ? (
            <span className="text-xs font-mono font-black bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border border-gray-200 whitespace-nowrap">
              key:{entry.song.key > 0 ? `+${entry.song.key}` : entry.song.key}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-gray-300 px-2 py-1 opacity-50">
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
        className="touch-none select-none cursor-pointer"
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

export function SetlistDetail({ setlist, allSongs }: { setlist: Setlist; allSongs: Song[] }) {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]); 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [items, setItems] = useState(setlist.entries); 
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedIds([]);
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleToggleSongSelect = (id: number) => {
    setSelectedSongIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      const updates = newItems.map((item, index) => ({
        id: item.id,
        order: index,
      }));
      startTransition(async () => {
         await reorderSetlist(updates);
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setItems(items.filter(item => !selectedIds.includes(item.id)));
    startTransition(async () => {
      await removeSongsFromSetlist(selectedIds);
      setSelectedIds([]);
      router.refresh();
    });
  };

  const handleBulkAddSongs = () => {
    if (selectedSongIds.length === 0) return;

    startTransition(async () => {
      await addSongsToSetlist(setlist.id, selectedSongIds);
      setIsAddModalOpen(false);
      setSelectedSongIds([]); 
      router.refresh();
    });
  };

  const openAddModal = () => {
    setSelectedSongIds([]);
    setIsAddModalOpen(true);
  };

  return (
    <div className="pb-20">
      
      {/* ヘッダー */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-center">
        <div className="w-full max-w-md px-4 flex items-center justify-between relative">
          
          <div className="flex items-center gap-1 z-10 w-24"> 
            {isEditMode ? (
              <button
                onClick={toggleEditMode}
                className="text-sm font-bold text-amber-500 px-2 py-1"
              >
                完了
              </button>
            ) : (
              <>
                <button 
                  onClick={openAddModal} 
                  className="p-2 -ml-2 text-amber-500 hover:bg-amber-50 rounded-full transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={toggleEditMode}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M18.75 12.75h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013 12zM9 3.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM9 15.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                  </svg>
                </button>
              </>
            )}
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[50%] text-center">
            {isEditMode && selectedIds.length > 0 ? (
               <span className="font-bold text-gray-800">{selectedIds.length}件 選択中</span>
            ) : (
               <h1 className="font-bold text-lg text-gray-800 truncate">{setlist.title}</h1>
            )}
          </div>

          <div className="ml-auto z-10 w-24 flex justify-end">
             {isEditMode ? (
               <button
                 onClick={handleBulkDelete}
                 disabled={selectedIds.length === 0}
                 className={`p-2 rounded-full transition
                   ${selectedIds.length > 0 ? "text-red-500 hover:bg-red-50" : "text-gray-300"}`}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                   <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                 </svg>
               </button>
             ) : (
               <Link href="/setlists" className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition block">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                   <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                 </svg>
               </Link>
             )}
          </div>
        </div>
      </div>

      <div className="pt-16">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items.map((i) => i.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 px-1">
              {items.map((entry) => (
                <SortableItem
                  key={entry.id}
                  entry={entry}
                  isEditMode={isEditMode}
                  isSelected={selectedIds.includes(entry.id)}
                  onToggleSelect={handleToggleSelect}
                  setlistId={setlist.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {items.length === 0 && (
           <div className="text-center py-10 text-gray-400 font-bold">
             曲がありません。<br/>左上の「＋」ボタンで追加してね！
           </div>
        )}
      </div>

      {isAddModalOpen && (
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
                   const style = getStatusStyle(song.status as any);
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
                        {style.icon}
                      </span>
                    </button>
                   );
                })
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold py-3 rounded-xl transition shadow-sm"
              >
                閉じる
              </button>
              <button
                onClick={handleBulkAddSongs}
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
      )}
    </div>
  );
}