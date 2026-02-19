"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setlistSchema, type SetlistSchema } from "@/lib/schema";
import { createSetlist, deleteSetlist } from "@/app/actions";

type Setlist = {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  _count: { entries: number };
};

export function SetlistList({ setlists }: { setlists: Setlist[] }) {
  const [isOpen, setIsOpen] = useState(false);
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

  const onSubmit = (data: SetlistSchema) => {
    startTransition(async () => {
      await createSetlist(data);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          セットリスト
        </h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          新規作成
        </button>
      </div>

      <div className="space-y-3">
        {setlists.length === 0 ? (
          // 0件表示
          <div className="text-center py-10 text-muted-foreground bg-muted rounded-xl border border-dashed border-border transition-colors">
            <p className="font-bold">まだセットリストがありません</p>
            <p className="text-sm mt-1">右上のボタンから作ってみよう！</p>
          </div>
        ) : (
          setlists.map((list) => (
            <Link
              key={list.id}
              href={`/setlists/${list.id}`}
              // リストカード
              className="block bg-card p-5 rounded-xl shadow-sm border border-border hover:border-primary transition-colors relative group"
            >
              <div className="flex justify-between items-start mb-2">
                {/* タイトル */}
                <h3 className="font-bold text-lg text-foreground line-clamp-1">{list.title}</h3>
                {/* 曲数バッジ */}
                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap ml-2 transition-colors">
                  {list._count.entries}曲
                </span>
              </div>
              
              {list.description && (
                // 説明
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {list.description}
                </p>
              )}

              {/* 区切り線 */}
              <div className="flex justify-between items-center border-t border-border-light pt-2 mt-2 transition-colors">
                {/* 日付 */}
                <span className="text-xs text-muted-foreground font-medium">
                  作成日: {new Date(list.createdAt).toLocaleDateString()}
                </span>

                {/* 削除ボタン */}
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

      {/* モーダル (ポップアップ) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 transition-colors">
            <h2 className="text-xl font-bold mb-4 text-center text-foreground">新しいセットリスト</h2>
            
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
                  {isPending ? "作成中..." : "作成する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}