"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setlistSchema, type SetlistSchema } from "@/lib/schema";
import { createSetlist, deleteSetlist, updateSetlist } from "@/actions/setlist";

type Setlist = {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  _count: { entries: number };
};

export function SetlistList({ setlists }: { setlists: Setlist[] }) {
  const router = useRouter(); 
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(setlistSchema),
    defaultValues: { title: "", description: "" },
    mode: "onChange",
  });

  const openCreateModal = () => {
    setEditId(null);
    reset({ title: "", description: "" });
    setIsOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, list: Setlist) => {
    e.preventDefault(); 
    e.stopPropagation();
    setEditId(list.id);
    reset({ title: list.title, description: list.description || "" });
    setIsOpen(true);
  };

  const onSubmit = (data: SetlistSchema) => {
    startTransition(async () => {
      if (editId) {
        await updateSetlist(editId, data);
        router.refresh(); 
      } else {
        await createSetlist(data);
      }
      setIsOpen(false);
      reset();
    });
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if(!confirm("本当にこのセットリストを削除しますか？\n中身の曲は消えません。")) return;

    startTransition(async () => {
      await deleteSetlist(id);
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          セットリスト
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/songs/import"
            className="flex-1 sm:flex-none bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold px-3 py-2 sm:px-4 rounded-full transition-colors flex items-center justify-center gap-1.5 border border-primary/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="hidden sm:inline">YouTubeから再生リストを追加</span>
            <span className="sm:hidden">一括追加</span>
          </Link>

          <button
            onClick={openCreateModal}
            className="flex-1 sm:flex-none bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold px-3 py-2 sm:px-4 rounded-full shadow-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            新規作成
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {setlists.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-muted rounded-xl border border-dashed border-border transition-colors">
            <p className="font-bold">まだセットリストがありません</p>
            <p className="text-sm mt-1">右上のボタンから作ってみよう！</p>
          </div>
        ) : (
          setlists.map((list) => (
            <Link
              key={list.id}
              href={`/setlists/${list.id}`}
              className="block bg-card p-5 rounded-xl shadow-sm border border-border hover:border-primary transition-colors relative group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <h3 className="font-bold text-lg text-foreground line-clamp-1">{list.title}</h3>
                  <button
                    onClick={(e) => openEditModal(e, list)}
                    className="text-muted-foreground/40 hover:text-primary transition-colors z-10 p-1 shrink-0"
                    title="タイトルと詳細を編集"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                    </svg>
                  </button>
                </div>
                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap ml-2 transition-colors">
                  {list._count.entries}曲
                </span>
              </div>
              
              {list.description && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {list.description}
                </p>
              )}

              <div className="flex justify-between items-center border-t border-border-light pt-2 mt-2 transition-colors">
                <span className="text-xs text-muted-foreground font-medium">
                  作成日: {new Date(list.createdAt).toLocaleDateString()}
                </span>

                <button
                  onClick={(e) => handleDelete(e, list.id)}
                  className="text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full transition-colors z-10"
                  title="セットリストを削除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </Link>
          ))
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 transition-colors">
            <h2 className="text-xl font-bold mb-4 text-center text-foreground">
              {editId ? "セットリストの編集" : "新しいセットリスト"}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">タイトル</label>
                <input
                  {...register("title")}
                  placeholder="例: 2026夏ライブ"
                  className="w-full bg-background text-foreground border border-border p-3 rounded-lg outline-none focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground"
                  autoFocus
                />
                {errors.title && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-bold">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-1">説明 (メモ)</label>
                <textarea
                  {...register("description")}
                  placeholder="例: 盛り上げ重視のリスト"
                  rows={3}
                  className="w-full bg-background text-foreground border border-border p-3 rounded-lg outline-none focus:ring-2 focus:ring-ring resize-none transition-colors placeholder:text-muted-foreground"
                />
                {errors.description && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-bold">{errors.description.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-muted hover:opacity-80 text-foreground font-bold py-3 rounded-xl transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!isValid || isPending}
                  className={`flex-2 font-bold py-3 rounded-xl transition-colors shadow-md
                    ${(!isValid || isPending) 
                      ? "bg-muted text-muted-foreground cursor-not-allowed" 
                      : "bg-primary hover:bg-primary-hover text-primary-foreground"}`}
                >
                  {isPending ? "保存中..." : editId ? "保存する" : "作成する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}