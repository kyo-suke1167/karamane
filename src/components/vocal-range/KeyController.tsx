"use client";

import { useState, useRef } from "react";
import { updateSongKey } from "@/app/actions";
import VocalRangeBar from "./VocalRangeBar";
import Link from "next/link"; // 🦁 Linkをインポート！

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
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 0. 無理ゲー判定
  const isImpossible = (() => {
    if (!userMax || !userMin || !songMax || !songMin) return false;
    const userRange = userMax - userMin;
    const songRange = songMax - songMin;
    return songRange > userRange;
  })();

  // ヘルパー
  const checkFitAbsolute = (totalShift: number) => {
    if (!userMax || !userMin || !songMax || !songMin) return false;
    const shiftedSongMax = songMax + totalShift; 
    const shiftedSongMin = songMin + totalShift;
    return shiftedSongMax <= userMax && shiftedSongMin >= userMin;
  };

  // 最適なキー調整量を探す
  const findBestKeyAdjustment = (baseOctaveShift: number): number | null => {
    if (checkFitAbsolute(baseOctaveShift + 0)) return 0;
    for (let i = 1; i <= 7; i++) {
      if (checkFitAbsolute(baseOctaveShift + i)) return i; 
      if (checkFitAbsolute(baseOctaveShift - i)) return -i; 
    }
    return null;
  };

  // 各種判定
  const isPerfect = checkFitAbsolute(currentKey);
  const isOriginalKeyPerfect = checkFitAbsolute(0);
  const adjNormal = findBestKeyAdjustment(0);
  const adjDown   = findBestKeyAdjustment(-12);
  const adjUp     = findBestKeyAdjustment(12);

  // デバウンス処理
  const handleKeyChange = (newKey: number) => {
    setCurrentKey(newKey);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        await updateSongKey(songId, newKey);
      } catch (e) {
        console.error(e);
        alert("キーの保存に失敗しました（通信エラー）"); 
      } finally {
        timerRef.current = null;
      }
    }, 1000);
  };

  const formatKey = (k: number) => (k > 0 ? `+${k}` : k === 0 ? "±0" : `${k}`);

  return (
    <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border border-primary/20 dark:border-primary/30 shadow-sm transition-colors">
      
      {songMax && songMin ? (
        <VocalRangeBar 
          songMin={songMin}
          songMax={songMax}
          userMin={userMin}
          userMax={userMax}
          currentKey={currentKey}
        />
      ) : (
        /* 🦁 キョン氏の元のデザインを活かして、控えめなボタンを横に添えたお！ */
        <div className="bg-card/50 h-16 rounded-lg flex items-center justify-center text-muted-foreground text-xs mb-4 border border-border gap-3">
          <span>音域データがありません</span>
          <Link 
            href={`/songs/${songId}/edit`} 
            className="px-2.5 py-1.5 bg-primary/10 text-primary font-bold rounded border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            編集画面へ
          </Link>
        </div>
      )}

      {/* キー操作エリア */}
      <div className="flex items-center justify-between mb-4 px-2">
        {/* マイナスボタン */}
        <button
          onClick={() => handleKeyChange(currentKey - 1)}
          className="w-12 h-12 flex items-center justify-center bg-card border border-border rounded-full text-2xl text-foreground hover:bg-muted active:scale-95 transition shadow-sm"
        >
          －
        </button>

        <div className="text-center min-w-20">
          <div className="text-4xl font-black font-mono tracking-tighter text-foreground">
            {formatKey(currentKey)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-bold">
            キー設定
          </p>
        </div>

        {/* プラスボタン */}
        <button
          onClick={() => handleKeyChange(currentKey + 1)}
          className="w-12 h-12 flex items-center justify-center bg-card border border-border rounded-full text-2xl text-foreground hover:bg-muted active:scale-95 transition shadow-sm"
        >
          ＋
        </button>
      </div>

      {/* アドバイス表示エリア */}
      <div className="space-y-2">
        
        {/* 0. 無理ゲー判定 */}
        {isImpossible && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg border-2 border-red-100 dark:border-red-800/50 text-red-800 dark:text-red-300">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold text-xs">音域が広すぎます...</p>
              <p className="text-[10px] mt-0.5 opacity-80 leading-tight">
                曲の音域幅が広すぎて、歌うのが難しい可能性があります。
              </p>
            </div>
          </div>
        )}

        {/* 1. オク下提案 */}
        {!isImpossible && !isOriginalKeyPerfect && adjDown !== null && (
          <div className="flex items-center justify-between text-xs font-bold bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 animate-in zoom-in">
            <span className="flex items-center gap-1"><span className="text-sm">⬇️</span> オク下で歌うなら</span>
            {adjDown === currentKey ? (
               <span className="bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-200 px-3 rounded-full text-[10px] border border-blue-200 dark:border-blue-700 min-w-27.5 h-8 flex items-center justify-center">今のキーでOK!</span>
            ) : (
              <button 
                onClick={() => handleKeyChange(adjDown)}
                className="bg-card px-3 rounded-full shadow-sm text-blue-600 dark:text-blue-300 font-bold hover:bg-muted transition border border-border min-w-27.5 h-8 flex items-center justify-center"
              >
                キー {formatKey(adjDown)} にする
              </button>
            )}
          </div>
        )}

        {/* 2. オク上提案 */}
        {!isImpossible && !isOriginalKeyPerfect && adjUp !== null && (
          <div className="flex items-center justify-between text-xs font-bold bg-rose-50 dark:bg-rose-900/30 px-3 py-2 rounded-lg border-2 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 animate-in zoom-in">
             <span className="flex items-center gap-1"><span className="text-sm">⬆️</span> オク上で歌うなら</span>
             {adjUp === currentKey ? (
               <span className="bg-rose-100 dark:bg-rose-800/50 text-rose-600 dark:text-rose-200 px-3 rounded-full text-[10px] border border-rose-200 dark:border-rose-700 min-w-27.5 h-8 flex items-center justify-center">今のキーでOK!</span>
            ) : (
              <button 
                onClick={() => handleKeyChange(adjUp)}
                className="bg-card px-3 rounded-full shadow-sm text-rose-600 dark:text-rose-300 font-bold hover:bg-muted transition border border-border min-w-27.5 h-8 flex items-center justify-center"
              >
                キー {formatKey(adjUp)} にする
              </button>
            )}
          </div>
        )}

        {/* 3. 普通に歌う提案 */}
        {!isImpossible && !isOriginalKeyPerfect && adjNormal !== null && adjNormal !== currentKey && (
          <div className="flex items-center justify-between text-xs font-bold bg-orange-50 dark:bg-orange-900/30 px-3 py-2 rounded-lg border-2 border-orange-200 dark:border-orange-800/50 text-orange-800 dark:text-orange-300 animate-in zoom-in">
            <span>{adjNormal < 0 ? "原曲が高いかも..." : "原曲が低いかも..."}</span>
            <button 
              onClick={() => handleKeyChange(adjNormal)}
              className="bg-card px-3 rounded-full shadow-sm text-orange-600 dark:text-orange-300 font-bold hover:bg-muted transition border border-border min-w-27.5 h-8 flex items-center justify-center"
            >
              おすすめ: {formatKey(adjNormal)}
            </button>
          </div>
        )}

        {/* 4. 成功メッセージ */}
        {isPerfect && !isImpossible && (
          <div className="text-center py-1 animate-in zoom-in duration-300">
            <span className="text-xs font-bold text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-4 py-1.5 rounded-full border border-green-200 dark:border-green-800/50 shadow-sm inline-flex items-center gap-1">
              <span className="text-sm">✨</span> 今のキーで歌えるよ！
            </span>
          </div>
        )}
      </div>
      
      {!userMax && !userMin && (
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          プロフィール設定で自分の音域を登録すると、<br/>おすすめキーが表示されます
        </p>
      )}
    </div>
  );
}