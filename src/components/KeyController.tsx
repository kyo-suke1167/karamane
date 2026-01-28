"use client";

import { useState } from "react";
import { updateSongKey } from "@/app/actions";
import { getNoteName } from "@/lib/noteUtils";

type Props = {
  songId: number;
  initialKey: number;
  songMax: number | null;
  songMin: number | null;
  userMax: number | null;
  userMin: number | null;
};

export default function KeyController({
  songId,
  initialKey,
  songMax,
  songMin,
  userMax,
  userMin,
}: Props) {
  const [currentKey, setCurrentKey] = useState(initialKey);
  const [isSaving, setIsSaving] = useState(false);

  // おすすめキー計算ロジック
  // 例: User最高(70:hiA#) - Song最高(72:hiC) = -2 (2つ下げれば届く)
  const recMaxKey = (userMax && songMax) ? userMax - songMax : null;
  const recMinKey = (userMin && songMin) ? userMin - songMin : null;

  // キー変更処理
  const handleKeyChange = async (newKey: number) => {
    setCurrentKey(newKey);
    setIsSaving(true);
    try {
      // サーバーに保存
      await updateSongKey(songId, newKey);
    } catch (e) {
      alert("保存に失敗しました...");
      setCurrentKey(currentKey); // 元に戻す
    } finally {
      setIsSaving(false);
    }
  };

  // 表示用ヘルパー
  const formatKey = (k: number) => (k > 0 ? `+${k}` : k === 0 ? "±0" : `${k}`);

  return (
    <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        {/* マイナスボタン */}
        <button
          onClick={() => handleKeyChange(currentKey - 1)}
          className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full text-2xl text-gray-600 hover:bg-gray-100 active:scale-95 transition shadow-sm"
        >
          －
        </button>

        {/* 現在のキー表示 */}
        <div className="text-center">
          <div className="text-4xl font-black text-gray-800 font-mono">
            {formatKey(currentKey)}
          </div>
          <p className="text-xs text-gray-400 mt-1">キー設定</p>
        </div>

        {/* プラスボタン */}
        <button
          onClick={() => handleKeyChange(currentKey + 1)}
          className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full text-2xl text-gray-600 hover:bg-gray-100 active:scale-95 transition shadow-sm"
        >
          ＋
        </button>
      </div>

      {/* アドバイス表示エリア */}
      <div className="space-y-2">
        {recMaxKey !== null && (
          <div className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-100">
            <span className="text-gray-500">あなたの最高音に合わせるなら</span>
            <button 
              onClick={() => handleKeyChange(recMaxKey)}
              className="font-bold text-blue-600 hover:underline"
            >
              {formatKey(recMaxKey)} に設定
            </button>
          </div>
        )}
        {recMinKey !== null && (
          <div className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-100">
            <span className="text-gray-500">あなたの最低音に合わせるなら</span>
            <button 
              onClick={() => handleKeyChange(recMinKey)}
              className="font-bold text-blue-600 hover:underline"
            >
              {formatKey(recMinKey)} に設定
            </button>
          </div>
        )}
      </div>
      
      {!userMax && !userMin && (
        <p className="text-xs text-gray-400 text-center mt-2">
          ※ ユーザー設定で音域を登録すると、おすすめキーが表示されます
        </p>
      )}
    </div>
  );
}