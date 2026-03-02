import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import {
  addSongsToSetlist,
  removeSongsFromSetlist,
  reorderSetlist,
} from "@/actions/setlist";
import type { SetlistWithRelations } from "@/types";

export function useSetlistDetail(setlist: SetlistWithRelations) {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [items, setItems] = useState(setlist.entries);
  const [isPending, startTransition] = useTransition();

  // ドラッグ＆ドロップのセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedIds([]);
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
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
    setItems(items.filter((item) => !selectedIds.includes(item.id)));
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

  const handleBack = () => {
    router.push("/setlists");
  };

  return {
    items,
    isEditMode,
    selectedIds,
    isAddModalOpen,
    setIsAddModalOpen,
    isPending,
    sensors,
    toggleEditMode,
    handleToggleSelect,
    handleDragEnd,
    handleBulkDelete,
    handleBulkAddSongs,
    handleBack,
  };
}
