"use client";

import { useState, useTransition } from "react";
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
} from "@dnd-kit/sortable";

import { 
  addSongsToSetlist, 
  removeSongsFromSetlist,
  reorderSetlist,
} from "@/app/actions";

import { SortableItem } from "./SortableItem";
import { AddSongModal } from "./AddSongModal";

import { SetlistWithRelations, Song } from "@/types";

export function SetlistDetail({ setlist, allSongs }: { setlist: SetlistWithRelations; allSongs: Song[] }) {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
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

  const handleBulkAddSongs = (selectedSongIds: number[]) => {
    if (selectedSongIds.length === 0) return;
    startTransition(async () => {
      await addSongsToSetlist(setlist.id, selectedSongIds);
      setIsAddModalOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="pb-20">
      {/* ヘッダー */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-b border-border h-16 flex items-center justify-center transition-colors">
        <div className="w-full max-w-md px-4 flex items-center justify-between relative">
          
          <div className="flex items-center gap-1 z-10 w-24"> 
            {isEditMode ? (
              <button onClick={toggleEditMode} className="text-sm font-bold text-primary px-2 py-1 transition-colors">完了</button>
            ) : (
              <>
                <button onClick={() => setIsAddModalOpen(true)} className="p-2 -ml-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>
                </button>
                <button onClick={toggleEditMode} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M18.75 12.75h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013 12zM9 3.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM9 15.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /></svg>
                </button>
              </>
            )}
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[50%] text-center">
            {isEditMode && selectedIds.length > 0 ? (
               <span className="font-bold text-foreground">{selectedIds.length}件 選択中</span>
            ) : (
               <h1 className="font-bold text-lg text-foreground truncate">{setlist.title}</h1>
            )}
          </div>

          <div className="ml-auto z-10 w-24 flex justify-end">
             {isEditMode ? (
               <button onClick={handleBulkDelete} disabled={selectedIds.length === 0} className={`p-2 rounded-full transition-colors ${selectedIds.length > 0 ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-muted-foreground/50"}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" /></svg>
               </button>
             ) : (
               <button onClick={() => router.push("/setlists")} className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors block">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
               </button>
             )}
          </div>
        </div>
      </div>

      <div className="pt-16">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
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
           <div className="text-center py-10 text-muted-foreground font-bold transition-colors">曲がありません。<br/>左上の「＋」ボタンで追加してね！</div>
        )}
      </div>

      <AddSongModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        allSongs={allSongs} 
        onAdd={handleBulkAddSongs}
        isPending={isPending}
      />
    </div>
  );
}