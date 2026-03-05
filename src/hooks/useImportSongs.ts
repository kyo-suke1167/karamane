// src/hooks/useImportSongs.ts
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { fetchYoutubePlaylist, saveImportedSongs } from "@/actions/youtube";
import { getUserSongsForModal } from "@/actions/song";
import { SongStatus } from "@/generated/prisma";
import type { PreviewSong } from "@/types";

export function useImportSongs() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [songs, setSongs] = useState<PreviewSong[]>([]);

  const [createSetlist, setCreateSetlist] = useState(true);
  const [setlistName, setListName] = useState("");

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);

  const [isPending, startTransition] = useTransition();

  // ==========================================
  // 🎵 YouTubeインポート処理
  // ==========================================
  const handleYoutubeFetch = () => {
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
            }),
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

  // ==========================================
  // 📁 CSVインポート処理
  // ==========================================
  const parseCSVRow = (str: string) => {
    const result = [];
    let inQuote = false;
    let currentVal = '';
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        result.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    result.push(currentVal.trim());
    return result;
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    startTransition(async () => {
      try {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
          setError("ファイルが空です。");
          return;
        }

        let startIndex = 0;
        if (lines[0].includes('曲') || lines[0].includes('タイトル') || lines[0].includes('title')) {
          startIndex = 1;
        }

        const userSongs = await getUserSongsForModal();
        const parsedSongs: PreviewSong[] = [];
        let dupesCount = 0;

        for (let i = startIndex; i < lines.length; i++) {
          const row = parseCSVRow(lines[i]);
          if (row.length >= 2) {
            const title = row[0];
            const artist = row[1];
            const statusText = row[2] || "";
            
            let status: SongStatus = "LEARNED";
            if (statusText.includes("練習") || statusText.toUpperCase().includes("PRACTICING")) status = "PRACTICING";
            if (statusText.includes("十八番") || statusText.toUpperCase().includes("MASTERED")) status = "MASTERED";

            const isDuplicate = userSongs.some((s) => s.title === title && s.artist === artist);
            if (isDuplicate) dupesCount++;

            parsedSongs.push({
              id: `csv-${Date.now()}-${i}`,
              title,
              artist,
              youtubeUrl: null,
              status,
              key: 0,
              memo: null,
              selected: !isDuplicate,
              isDuplicate,
            });
          }
        }

        if (parsedSongs.length === 0) {
          setError("読み込める曲データがありませんでした。形式を確認してください。");
          return;
        }

        setSongs(parsedSongs);
        setListName(file.name.replace(".csv", ""));

        if (dupesCount > 0) {
          setDuplicateCount(dupesCount);
          setShowDuplicateModal(true);
        }
      } catch (err) {
        console.error(err);
        setError("CSVファイルの読み込みに失敗しました。");
      }
    });

    event.target.value = "";
  };

  // ==========================================
  // 共通の編集・保存処理
  // ==========================================
  const swapTitleAndArtist = (id: string) => {
    setSongs(
      songs.map((song) => {
        if (song.id === id) {
          return { ...song, title: song.artist, artist: song.title };
        }
        return song;
      }),
    );
  };

  const updateSong = <K extends keyof PreviewSong>(id: string, field: K, value: PreviewSong[K]) => {
    setSongs(songs.map((song) => (song.id === id ? { ...song, [field]: value } : song)));
  };

  const handleSave = () => {
    const selectedSongs = songs.filter((s) => s.selected);
    if (selectedSongs.length === 0) {
      alert("保存する曲を選択してください！");
      return;
    }

    // セットリストを同時に作る場合のみ、フロントエンドでアラートを出す
    if (createSetlist && selectedSongs.length > 100) {
      alert(
        "セットリストに登録できるのは最大100曲までです！\n\n" +
        "100曲以上をインポートする場合は、下部の「同時にセットリストを作成する」のチェックを外して保存してください"
      );
      return;
    }

    startTransition(async () => {
      try {
        const dataToSave = selectedSongs.map(({ title, artist, youtubeUrl, status, key, memo }) => ({
          title,
          artist,
          youtubeUrl,
          status,
          key,
          memo,
        }));

        const result = await saveImportedSongs(dataToSave, createSetlist ? setlistName : undefined);

        if (result && result.error) {
          alert(result.error);
        } else {
          alert(`${selectedSongs.length} 曲の登録が完了しました！`);
          router.push("/");
        }
      } catch (err: unknown) {
        console.error("保存エラー:", err);
        alert("保存に失敗しました。通信環境を確認して、もう一度お試しください！");
      }
    });
  };

  const allSelected = songs.length > 0 && songs.every((s) => s.selected);
  const toggleAll = () => {
    setSongs(songs.map((s) => ({ ...s, selected: !allSelected })));
  };

  const resetFetch = () => {
    if (confirm("抽出したデータを破棄して、最初からやり直しますか？")) {
      setSongs([]);
      setUrl("");
      setError("");
    }
  };

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
    handleYoutubeFetch,
    handleCsvUpload,
    swapTitleAndArtist,
    updateSong,
    handleSave,
    allSelected,
    toggleAll,
    resetFetch,
  };
}