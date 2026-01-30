"use client";

import { useState } from "react";
import { updateSongKey } from "@/app/actions";

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
  
  // 1. 最高音チェック: 曲が高すぎる(diff < 0)時だけ、下げる提案をする
  const recMaxKey = (() => {
    if (!userMax || !songMax) return null;
    const diff = userMax - songMax;
    // 余裕がある(正の値)なら提案しない。足りない(負の値)なら提案する。
    return diff < 0 ? diff : null;
  })();

  // 2. 最低音チェック: 曲が低すぎる(diff > 0)時だけ、上げる提案をする
  const recMinKey = (() => {
    if (!userMin || !songMin) return null;
    const diff = userMin - songMin;
    // 余裕がある(負の値)なら提案しない。低すぎる(正の値)なら提案する。
    return diff > 0 ? diff : null;
  })();

  // 3. どっちもOKな場合（範囲内）かどうか
  const isRangeOK = userMax && userMin && songMax && songMin && recMaxKey === null && recMinKey === null;

  // キー変更処理
  const handleKeyChange = async (newKey: number) => {
    setCurrentKey(newKey);
    setIsSaving(true);
    try {
      await updateSongKey(songId, newKey);
    } catch (e) {
      alert("保存に失敗しました...");
      setCurrentKey(currentKey);
    } finally {
      setIsSaving(false);
    }
  };

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
        
        {/* 最高音が高すぎる場合 (オレンジ系で柔らかく) */}
        {recMaxKey !== null && (
          <div className="flex items-center justify-between text-xs font-bold bg-orange-50 px-3 py-2 rounded-lg border-2 border-orange-200 text-orange-800">
            <span>高音が少しキツいかも？</span>
            <button 
              onClick={() => handleKeyChange(recMaxKey)}
              className="bg-white px-3 py-1 rounded-full shadow-sm text-orange-600 font-bold hover:bg-orange-50 transition border border-orange-200"
            >
              おすすめ: {formatKey(recMaxKey)}
            </button>
          </div>
        )}

        {/* 最低音が低すぎる場合 (インディゴ系で落ち着いた感じに) */}
        {recMinKey !== null && (
          <div className="flex items-center justify-between text-xs font-bold bg-indigo-50 px-3 py-2 rounded-lg border-2 border-indigo-200 text-indigo-800">
            <span>低音が出にくいかも？</span>
            <button 
              onClick={() => handleKeyChange(recMinKey)}
              className="bg-white px-3 py-1 rounded-full shadow-sm text-indigo-600 font-bold hover:bg-indigo-50 transition border border-indigo-200"
            >
              おすすめ: {formatKey(recMinKey)}
            </button>
          </div>
        )}

        {/* 範囲内の場合：メッセージを表示 */}
        {isRangeOK && (
          <div className="text-center py-1">
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              {userMax && songMax ? "今のキーで歌える範囲です！" : "音域データ不足"}
            </span>
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