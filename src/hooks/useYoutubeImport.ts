import { useState, useTransition } from "react";
import { fetchYoutubePlaylist, saveImportedSongs } from "@/actions/youtube";
import { SongStatus } from "@/generated/prisma";
import type { PreviewSong } from "@/types";

export function useYoutubeImport() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [songs, setSongs] = useState<PreviewSong[]>([]);

  const [createSetlist, setCreateSetlist] = useState(true);
  const [setlistName, setListName] = useState("");

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);

  const [isPending, startTransition] = useTransition();

  const handleFetch = () => {
    if (!url) return;
    setError("");
    startTransition(async () => {
      try {
        const data = await fetchYoutubePlaylist(url);

        if (data.error) {
          setError(data.error);
          return;
        }

        if (data.songs) {
          const previewData = data.songs.map(
            (s: Omit<PreviewSong, "id" | "status">, i: number) => ({
              ...s,
              id: `temp-${i}`,
              status: "LEARNED" as SongStatus,
            })
          ) as PreviewSong[];

          setSongs(previewData);
          setListName(data.playlistTitle || "");

          const dupes = previewData.filter((s: PreviewSong) => s.isDuplicate).length;
          if (dupes > 0) {
            setDuplicateCount(dupes);
            setShowDuplicateModal(true);
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("予期せぬエラーが発生しました。");
        }
      }
    });
  };

  const swapTitleAndArtist = (id: string) => {
    setSongs(
      songs.map((song) => {
        if (song.id === id) {
          return { ...song, title: song.artist, artist: song.title };
        }
        return song;
      })
    );
  };

  const updateSong = <K extends keyof PreviewSong>(
    id: string,
    field: K,
    value: PreviewSong[K]
  ) => {
    setSongs(
      songs.map((song) =>
        song.id === id ? { ...song, [field]: value } : song
      )
    );
  };

  const handleSave = () => {
    const selectedSongs = songs.filter((s) => s.selected);
    if (selectedSongs.length === 0) {
      alert("保存する曲を選択してください！");
      return;
    }

    startTransition(async () => {
      const dataToSave = selectedSongs.map(
        ({ title, artist, youtubeUrl, status, key, memo }) => ({
          title,
          artist,
          youtubeUrl,
          status,
          key,
          memo,
        })
      );

      await saveImportedSongs(
        dataToSave,
        createSetlist ? setlistName : undefined
      );
    });
  };

  const allSelected = songs.length > 0 && songs.every((s) => s.selected);
  const toggleAll = () => {
    setSongs(songs.map((s) => ({ ...s, selected: !allSelected })));
  };

  const resetFetch = () => {
    if (confirm("抽出したデータを破棄して、別のURLを読み込みますか？")) {
      setSongs([]);
      setUrl("");
    }
  };

  // 画面（コンポーネント）側で必要な変数と関数を全部まとめて返す
  return {
    url,
    setUrl,
    error,
    songs,
    createSetlist,
    setCreateSetlist,
    setlistName,
    setListName,
    showDuplicateModal,
    setShowDuplicateModal,
    duplicateCount,
    isPending,
    handleFetch,
    swapTitleAndArtist,
    updateSong,
    handleSave,
    allSelected,
    toggleAll,
    resetFetch,
  };
}