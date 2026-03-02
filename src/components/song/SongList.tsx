"use client";

import Link from "next/link";
import { getNoteName, getNoteColor } from "@/lib/noteUtils";
import { getStatusStyle } from "@/lib/statusUtils";
import { HomeFilters } from "./SongFilters";
import { useSongList, type SongWithUser } from "@/hooks/useSongList";

type Props = {
  initialSongs: SongWithUser[];
  userName?: string;
};

export function ClientSongList({ initialSongs, userName }: Props) {
  const {
    filterQuery,
    filterStatuses,
    currentPage,
    setCurrentPage,
    paginatedSongs,
    filteredCount,
    totalPages,
    getPageNumbers,
    handleSearchChange,
    handleStatusChange,
    handleSortChange,
  } = useSongList(initialSongs);

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {userName}さんの持ち歌
            </h2>
            <p className="text-muted-foreground text-sm mt-1 font-bold">
              {filterQuery || filterStatuses.length > 0 ? "検索結果:" : "全"}{" "}
              {filteredCount} 曲
            </p>
          </div>

          <Link
            href="/songs/create"
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-6 py-2 rounded-full shadow-md transition whitespace-nowrap"
          >
            + 曲を追加
          </Link>
        </div>

        <HomeFilters
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onSortChange={handleSortChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCount === 0 ? (
          <div className="col-span-2 text-center py-20 bg-muted rounded-2xl border-2 border-dashed border-border">
            <p className="text-muted-foreground font-bold mb-4">
              {filterQuery || filterStatuses.length > 0
                ? "条件に一致する曲が見つかりません..."
                : "まだ曲が登録されていません..."}
            </p>
            {!filterQuery && filterStatuses.length === 0 && (
              <Link
                href="/songs/create"
                className="text-primary font-bold underline hover:text-primary-hover"
              >
                最初の1曲を登録！
              </Link>
            )}
          </div>
        ) : (
          paginatedSongs.map((song) => {
            const statusStyle = getStatusStyle(song.status);
            return (
              <Link
                key={song.id}
                href={`/songs/${song.id}`}
                className={`block bg-card border border-border border-l-4 rounded-xl shadow-sm hover:shadow-md transition px-4 py-3 ${statusStyle.cardBorder} ${statusStyle.cardBg}`}
              >
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3 border-b border-border-light pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.badgeColor}`}
                    >
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
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getNoteColor(song.minNoteId)}`}
                      >
                        最低音:{getNoteName(song.minNoteId)}
                      </span>
                    )}

                    {song.maxNoteId !== null && song.maxNoteId !== 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getNoteColor(song.maxNoteId)}`}
                      >
                        最高音:{getNoteName(song.maxNoteId)}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight mb-1">
                    {song.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-bold">
                    {song.artist}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* ページネーション・コントローラー (番号式) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 mb-4">
          {/* 前へボタン */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* 番号ボタンたち */}
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-8 text-muted-foreground font-bold"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page as number)}
                className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold transition-all shadow-sm text-sm sm:text-base ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground border-primary scale-110"
                    : "bg-card border-border text-foreground hover:bg-muted hover:border-muted-foreground/30"
                } border`}
              >
                {page}
              </button>
            ),
          )}

          {/* 次へボタン */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
