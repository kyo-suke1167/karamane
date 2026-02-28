"use client";

import { useMemo } from "react";
import { getNoteName } from "@/lib/noteUtils";

type Props = {
  songMin: number;
  songMax: number;
  userMin: number | null;
  userMax: number | null;
  currentKey: number; // 現在のキー設定
};

// 表示する範囲
const DISPLAY_MIN = 36; // C2
const DISPLAY_MAX = 84; // C6 (hihiC)
const TOTAL_RANGE = DISPLAY_MAX - DISPLAY_MIN;

export default function VocalRangeBar({ songMin, songMax, userMin, userMax, currentKey }: Props) {
  
  // 位置計算ヘルパー
  const getPosition = (noteId: number) => {
    const pos = ((noteId - DISPLAY_MIN) / TOTAL_RANGE) * 100;
    return Math.max(0, Math.min(100, pos));
  };

  // 曲の音域 (キー変更を適用)
  const currentSongMin = songMin + currentKey;
  const currentSongMax = songMax + currentKey;

  const songLeft = getPosition(currentSongMin);
  const songWidth = getPosition(currentSongMax) - songLeft;

  // ユーザーの音域
  const userLeft = userMin ? getPosition(userMin) : 0;
  const userWidth = userMax && userMin ? getPosition(userMax) - userLeft : 0;

  // 目盛り
  const markers = useMemo(() => {
    const marks = [];
    for (let i = DISPLAY_MIN; i <= DISPLAY_MAX; i++) {
      if (i % 12 === 0) {
        marks.push({ id: i, label: getNoteName(i) });
      }
    }
    return marks;
  }, []);

  const barColor = currentKey === 0 
    ? "bg-amber-400 dark:bg-amber-500"      // ±0: オレンジ
    : currentKey > 0 
      ? "bg-red-400 dark:bg-red-500"     // + : 赤
      : "bg-blue-400 dark:bg-blue-500";    // - : 青

  return (
    <div className="w-full mb-6 select-none">
      <div className="relative h-24 bg-card rounded-xl border border-border overflow-hidden transition-colors">
        
        {/* 1. 背景の目盛り線 */}
        {markers.map((mark) => (
          <div
            key={mark.id}
            className="absolute top-0 bottom-0 border-l border-border-light flex flex-col justify-end pb-1"
            style={{ left: `${getPosition(mark.id)}%` }}
          >
            <span className="text-[10px] text-muted-foreground font-bold ml-1">{mark.label}</span>
          </div>
        ))}

        {/* 2. ユーザーの音域 (グレーの背景バー) */}
        {userMin && userMax ? (
          <div
            className="absolute h-6 top-12 bg-muted rounded-sm flex items-center justify-center border border-border-light transition-colors"
            style={{ left: `${userLeft}%`, width: `${userWidth}%` }}
          >
            <span className="text-[10px] text-muted-foreground font-bold px-1 truncate">あなた</span>
          </div>
        ) : (
          <div className="absolute top-12 w-full text-center text-[10px] text-muted-foreground">
            ※ユーザー音域未設定
          </div>
        )}

        {/* 3. 曲の音域 (カラフルなメインバー) */}
        <div
          className={`absolute h-8 top-3 rounded-md shadow-sm flex items-center justify-between px-2 text-white font-bold text-xs transition-all duration-300 ease-out
            ${barColor} 
          `}
          style={{ left: `${songLeft}%`, width: `${songWidth}%` }}
        >
          {/* 左端の音名 */}
          <span className="drop-shadow-md">{getNoteName(currentSongMin)}</span>
          {/* 右端の音名 */}
          <span className="drop-shadow-md">{getNoteName(currentSongMax)}</span>
        </div>

        {/* 4. 重なり判定のガイド線 */}
        {userMax && (
          <div 
            className="absolute top-0 bottom-0 border-l-2 border-red-300/50 dark:border-red-500/50 border-dashed pointer-events-none"
            style={{ left: `${getPosition(userMax)}%` }}
          />
        )}
        {userMin && (
          <div 
            className="absolute top-0 bottom-0 border-l-2 border-blue-300/50 dark:border-blue-500/50 border-dashed pointer-events-none"
            style={{ left: `${getPosition(userMin)}%` }}
          />
        )}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}