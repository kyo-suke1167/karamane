import { Song, Setlist, SetlistEntry, SongStatus } from "@/generated/prisma";

export { SongStatus };
export type { Song, Setlist, SetlistEntry };


// セットリスト詳細用: SetlistEntry に Song が紐づいた型
export type SetlistEntryWithSong = SetlistEntry & { 
  song: Song 
};

// セットリスト詳細用: Setlist に Entry(とSong) が紐づいた型
export type SetlistWithRelations = Setlist & {
  entries: SetlistEntryWithSong[];
};

// セットリスト一覧用: Setlist に曲数カウントがついた型
export type SetlistWithCount = Setlist & {
  _count: { entries: number };
};