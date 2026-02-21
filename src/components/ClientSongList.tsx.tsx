"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getNoteName, getNoteColor } from "@/lib/noteUtils";
import { getStatusStyle } from "@/lib/statusUtils";
import { HomeFilters } from "./HomeFilters";
import { SongStatus } from "@/generated/prisma";

// 曲データの型定義
type SongWithUser = {
  id: number;
  title: string;
  artist: string;
  status: SongStatus;
  key: number;
  maxNoteId: number | null;
  minNoteId: number | null;
  createdAt: Date;
  userId: string;
};

type Props = {
  initialSongs: SongWithUser[];
  userName?: string;
};

export function ClientSongList({ initialSongs, userName }: Props) {
  // 検索条件の状態
  const [filterQuery, setFilterQuery] = useState("");
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);

  // フィルタリング & 固定ソート (曲名順)
  const filteredSongs = useMemo(() => {
    let result = [...initialSongs];

    // 1. 文字検索
    if (filterQuery) {
      const lowerQ = filterQuery.toLowerCase();
      result = result.filter(
        (song) =>
          song.title.toLowerCase().includes(lowerQ) ||
          song.artist.toLowerCase().includes(lowerQ)
      );
    }

    // 2. ステータス絞り込み
    if (filterStatuses.length > 0) {
      result = result.filter((song) => filterStatuses.includes(song.status));
    }

    // 3. ソート (常に曲名順)
    result.sort((a, b) => {
      // 日本語のあいうえお順に対応して比較
      return a.title.localeCompare(b.title, "ja");
    });

    return result;
  }, [initialSongs, filterQuery, filterStatuses]);

  return (
    <div>
      {/* ヘッダーエリア */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {userName}さんの持ち歌
            </h2>
            <p className="text-muted-foreground text-sm mt-1 font-bold">
              {filterQuery || filterStatuses.length > 0 ? "検索結果:" : "全"} {filteredSongs.length} 曲
            </p>
          </div>
          
          <Link
            href="/songs/create"
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-6 py-2 rounded-full shadow-md transition whitespace-nowrap"
          >
            + 曲を追加
          </Link>
        </div>

        {/* 検索フィルター */}
        <HomeFilters 
          onSearchChange={setFilterQuery}
          onStatusChange={setFilterStatuses}
        />
        
      </div>

      {/* 持ち歌リスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSongs.length === 0 ? (
          <div className="col-span-2 text-center py-20 bg-muted rounded-2xl border-2 border-dashed border-border">
            <p className="text-muted-foreground font-bold mb-4">
              {(filterQuery || filterStatuses.length > 0)
                ? "条件に一致する曲が見つかりません..." 
                : "まだ曲が登録されていません..."}
            </p>
            {!filterQuery && filterStatuses.length === 0 && (
              <Link href="/songs/create" className="text-primary font-bold underline hover:text-primary-hover">
                最初の1曲を登録！
              </Link>
            )}
          </div>
        ) : (
          filteredSongs.map((song) => {
            const statusStyle = getStatusStyle(song.status);
            return (
              <Link
                key={song.id}
                href={`/songs/${song.id}`}
                className={`block bg-card border border-border border-l-4 rounded-xl shadow-sm hover:shadow-md transition px-4 py-3 ${statusStyle.cardBorder} ${statusStyle.cardBg}`}
              >
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3 border-b border-border-light pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.badgeColor}`}>
                      {statusStyle.icon} {statusStyle.label}
                    </span>
                    {song.key !== 0 && (
                      <span className="text-[11px] font-mono font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">
                        key:{song.key > 0 ? `+${song.key}` : song.key}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {song.minNoteId !== null && song.minNoteId !== 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getNoteColor(song.minNoteId)}`}>
                        最低音:{getNoteName(song.minNoteId)}
                      </span>
                    )}
                    
                    {song.maxNoteId !== null && song.maxNoteId !== 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getNoteColor(song.maxNoteId)}`}>
                        最高音:{getNoteName(song.maxNoteId)}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight mb-1">{song.title}</h3>
                  <p className="text-xs text-muted-foreground font-bold">{song.artist}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}