"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "latest"; // デフォルトは新着順

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value;
    router.push(`/?sort=${sort}`); // URLを更新（ページがリロードされる）
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <label htmlFor="sort" className="text-sm font-bold text-gray-600">
        並び替え:
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={handleChange}
        className="p-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="latest">登録が新しい順</option>
        <option value="oldest">登録が古い順</option>
        <option value="title_asc">曲名 (A-Z)</option>
        <option value="artist_asc">歌手名 (A-Z)</option>
      </select>
    </div>
  );
}
