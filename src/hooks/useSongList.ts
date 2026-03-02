import { useState, useMemo, useEffect, useCallback } from "react";
import { SongStatus } from "@/generated/prisma";

export type SongWithUser = {
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

const ITEMS_PER_PAGE = 20;

export function useSongList(initialSongs: SongWithUser[]) {
  const [filterQuery, setFilterQuery] = useState("");
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("title-asc");
  const [currentPage, setCurrentPage] = useState(1);

  // ページが変わった瞬間に、画面の一番上に戻す
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const filteredSongs = useMemo(() => {
    let result = [...initialSongs];

    if (filterQuery) {
      const lowerQ = filterQuery.toLowerCase();
      result = result.filter(
        (song) =>
          song.title.toLowerCase().includes(lowerQ) ||
          song.artist.toLowerCase().includes(lowerQ),
      );
    }

    if (filterStatuses.length > 0) {
      result = result.filter((song) => filterStatuses.includes(song.status));
    }

    result.sort((a, b) => {
      switch (sortKey) {
        case "title-asc":
          return a.title.localeCompare(b.title, "ja");
        case "artist-asc":
          return a.artist.localeCompare(b.artist, "ja");
        case "createdAt-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "createdAt-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return result;
  }, [initialSongs, filterQuery, filterStatuses, sortKey]);

  // 検索やソートを変更した瞬間に、1ページ目に戻す関数
  const handleSearchChange = useCallback((query: string) => {
    setFilterQuery(query);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((statuses: string[]) => {
    setFilterStatuses(statuses);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((key: string) => {
    setSortKey(key);
    setCurrentPage(1);
  }, []);

  const totalPages = Math.ceil(filteredSongs.length / ITEMS_PER_PAGE);
  const paginatedSongs = filteredSongs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ページ番号を生成するロジック
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  return {
    filterQuery,
    filterStatuses,
    currentPage,
    setCurrentPage,
    paginatedSongs,
    filteredCount: filteredSongs.length,
    totalPages,
    getPageNumbers,
    handleSearchChange,
    handleStatusChange,
    handleSortChange,
  };
}
