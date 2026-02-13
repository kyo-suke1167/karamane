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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          セットリスト
        </h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-1 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          新規作成
        </button>
      </div>

      <div className="space-y-3">
        {setlists.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <p>まだセットリストがありません</p>
            <p className="text-sm mt-1">右上のボタンから作ってみよう！</p>
          </div>
        ) : (
          setlists.map((list) => (
            <Link
              key={list.id}
              href={`/setlists/${list.id}`}
              className="block bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-amber-300 transition relative group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{list.title}</h3>
                <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap ml-2">
                  {list._count.entries}曲
                </span>
              </div>
              
              {list.description && (
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                  {list.description}
                </p>
              )}

              <div className="flex justify-between items-center border-t border-gray-50 pt-2 mt-2">
                <span className="text-xs text-gray-400 font-medium">
                  作成日: {new Date(list.createdAt).toLocaleDateString()}
                </span>

                <button
                  onClick={(e) => handleDelete(e, list.id)}
                  className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition z-10"
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
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4 text-center">新しいセットリスト</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">タイトル</label>
                <input
                  {...register("title")}
                  placeholder="例: 2026夏ライブ"
                  className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-400"
                  autoFocus
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">説明 (メモ)</label>
                <textarea
                  {...register("description")}
                  placeholder="例: 盛り上げ重視のリスト"
                  rows={3}
                  className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1 font-bold">{errors.description.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!isValid || isPending}
                  className={`flex-2 font-bold py-3 rounded-xl transition shadow-md
                    ${(!isValid || isPending) ? "bg-gray-300 text-gray-500" : "bg-amber-500 hover:bg-amber-600 text-white"}`}
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