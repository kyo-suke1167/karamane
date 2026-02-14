"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions";
import { NOTE_OPTIONS } from "@/lib/noteUtils";
import { User } from "@/generated/prisma"; 
import { useRouter } from "next/navigation";

type Props = {
  user: User;
};

export default function ProfileForm({ user }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: user.name || "",
    minNoteId: user.minNoteId || 60,
    maxNoteId: user.maxNoteId || 72,
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setMessage("");
    setError("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("minNoteId", String(formData.minNoteId));
      data.append("maxNoteId", String(formData.maxNoteId));

      await updateProfile(data);
      setMessage("プロフィールを更新しました");

      router.refresh();
      
      // 3秒後にメッセージを消す演出
      setTimeout(() => setMessage(""), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "更新に失敗しました...");
      } else {
        setError("予期せぬエラーが発生しました");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
      
      {/* 名前 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">お名前 (ニックネーム)</label>
        <input
          type="text"
          required
          className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-400"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      {/* 音域設定エリア */}
      <div className="bg-amber-50 p-4 rounded-xl space-y-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          音域設定
          <span className="text-xs font-normal text-gray-500">※キー提案に使われます</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">最低音 (Low)</label>
            <div className="relative">
              <select
                value={formData.minNoteId}
                onChange={(e) => setFormData({ ...formData, minNoteId: Number(e.target.value) })}
                className="w-full border p-2 rounded-lg appearance-none bg-white cursor-pointer hover:border-amber-400 transition"
              >
                {NOTE_OPTIONS.map((n) => (
                  <option key={n.id} value={n.value}>{n.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">最高音 (High)</label>
            <div className="relative">
              <select
                value={formData.maxNoteId}
                onChange={(e) => setFormData({ ...formData, maxNoteId: Number(e.target.value) })}
                className="w-full border p-2 rounded-lg appearance-none bg-white cursor-pointer hover:border-amber-400 transition"
              >
                {NOTE_OPTIONS.map((n) => (
                  <option key={n.id} value={n.value}>{n.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* メッセージ表示エリア */}
      {message && (
        <div className="p-3 bg-green-50 text-green-600 font-bold rounded-lg text-center animate-pulse">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 font-bold rounded-lg text-center">
          {error}
        </div>
      )}

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "更新中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}