import { Song, Setlist, SetlistEntry, SongStatus } from "@/generated/prisma";

export { SongStatus };
export type { Song, Setlist, SetlistEntry };

// ==========================================
// 1. Prisma拡張型（リレーションを含む型）
// ==========================================

// セットリスト詳細用: SetlistEntry に Song が紐づいた型
export type SetlistEntryWithSong = SetlistEntry & {
  song: Song;
};

// セットリスト詳細用: Setlist に Entry(とSong) が紐づいた型
export type SetlistWithRelations = Setlist & {
  entries: SetlistEntryWithSong[];
};

// セットリスト一覧用: Setlist に曲数カウントがついた型
export type SetlistWithCount = Setlist & {
  _count: { entries: number };
};

// ==========================================
// 2. UI・フロントエンド用コンポーネント型
// ==========================================

// 曲リストの並び替え（ソート）用の型

export type SortField = "createdAt" | "title" | "artist" | "key";
export type SortOrder = "desc" | "asc";

// YouTubeインポート画面用：
// DBに保存される前の「プレビュー状態」の曲データ型

export type PreviewSong = {
  id: string;
  selected: boolean;
  title: string;
  artist: string;
  youtubeUrl: string;
  status: SongStatus;
  key: number;
  memo: string;
  isDuplicate?: boolean;
};
