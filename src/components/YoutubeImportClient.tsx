"use client";

import { useState, useTransition } from "react";
import { fetchYoutubePlaylist, saveImportedSongs } from "@/app/actions";
import { SongStatus } from "@/generated/prisma";

type PreviewSong = {
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

export function YoutubeImportClient() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [playlistTitle, setPlaylistTitle] = useState("");
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
        const previewData = data.songs.map((s: any, i: number) => ({
          ...s,
          id: `temp-${i}`,
          status: "LEARNED",
        }));
        setSongs(previewData);
        setPlaylistTitle(data.playlistTitle);
        setListName(data.playlistTitle);

        // 重複チェック！登録済みの曲数を数え、1曲以上あればモーダルを出す
        const dupes = previewData.filter((s: any) => s.isDuplicate).length;
        if (dupes > 0) {
          setDuplicateCount(dupes);
          setShowDuplicateModal(true);
        }
        
      } catch (err: any) {
        setError(err.message || "取得に失敗しました。");
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
      }),
    );
  };

  const updateSong = (id: string, field: keyof PreviewSong, value: any) => {
    setSongs(
      songs.map((song) =>
        song.id === id ? { ...song, [field]: value } : song,
      ),
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
        }),
      );

      await saveImportedSongs(
        dataToSave,
        createSetlist ? setlistName : undefined,
      );
    });
  };

  const allSelected = songs.length > 0 && songs.every((s) => s.selected);
  const toggleAll = () => {
    setSongs(songs.map((s) => ({ ...s, selected: !allSelected })));
  };

  // リセット関数
  const resetFetch = () => {
    if (confirm("抽出したデータを破棄して、別のURLを読み込みますか？")) {
      setSongs([]);
      setUrl("");
    }
  };

  return (
    <div className="space-y-6 pb-12 relative">
      
      {/* 重複お知らせモーダル */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-5">
              <div className="bg-amber-500/10 p-4 rounded-full text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-black text-center text-foreground mb-3">登録済みの曲があります！</h3>
            <p className="text-sm text-muted-foreground font-bold text-center mb-6 leading-relaxed">
              プレイリスト内にすでに登録済みの曲が <span className="text-amber-500 text-lg mx-1">{duplicateCount}</span> 曲含まれていました。<br/>
              重複を防ぐため、追加チェックを外しています！
            </p>
            <button 
              onClick={() => setShowDuplicateModal(false)}
              className="w-full bg-foreground text-background hover:bg-muted-foreground font-black py-3.5 rounded-xl shadow-md transition-all text-lg"
            >
              OK！
            </button>
          </div>
        </div>
      )}
      {/* 状態によって画面を「A: 取得前」と「B: 取得後」で切り替える */}
      {songs.length === 0 ? (
        /* ================= A. 取得前の画面 ================= */
        <div className="animate-in fade-in duration-300">
          <h1 className="text-2xl font-black text-foreground mb-4">
            YouTubeから一括インポート
          </h1>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <div>
              <label className="flex flex-col sm:flex-row sm:items-center text-sm font-bold text-muted-foreground mb-2 gap-1 sm:gap-2">
                <span>公開・限定公開の再生リストURL</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/playlist?list=..."
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {error && <p className="text-red-500 font-bold text-sm">{error}</p>}

            <button
              onClick={handleFetch}
              disabled={isPending || !url}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isPending ? "読み込み中..." : "プレイリストを取得する"}
            </button>
          </div>
        </div>
      ) : (
        /* ================= B. 取得後（抽出リスト）の画面 ================= */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* タイトルを状況に合わせて変更 */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 px-1">
            <h1 className="text-2xl font-black text-foreground">
              抽出した曲一覧
            </h1>

            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-muted-foreground">
                {songs.filter((s) => s.selected).length} 曲を選択中
              </span>
              {/* やり直しボタン */}
              <button
                onClick={resetFetch}
                className="text-sm font-bold text-muted-foreground hover:text-foreground underline transition-colors"
              >
                別のURLを読み込む
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-3 px-1">
            <button
              onClick={toggleAll}
              className="text-sm font-bold text-primary underline"
            >
              {allSelected ? "すべて外す" : "すべて選択"}
            </button>
          </div>

          {/* 抽出リスト */}
          <div className="space-y-3">
            {songs.map((song) => (
              <div
                key={song.id}
                className={`p-3 sm:p-4 bg-card rounded-xl border transition-colors ${song.selected ? "border-primary/50 shadow-sm" : "border-border opacity-60"}`}
              >
                {/* スマホ専用：上の段にチェックボックスとステータスをまとめる */}
                <div className="flex justify-between items-center w-full sm:hidden mb-3 pb-2 border-b border-border-light">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={song.selected}
                      onChange={(e) =>
                        updateSong(song.id, "selected", e.target.checked)
                      }
                      className="w-5 h-5 accent-primary shrink-0"
                    />
                    <span className="text-xs font-bold text-foreground">
                      追加する
                    </span>
                  </label>

                  <select
                    value={song.status}
                    onChange={(e) =>
                      updateSong(song.id, "status", e.target.value)
                    }
                    className="w-28 bg-background border border-border rounded-md px-2 py-1 text-xs font-bold text-muted-foreground"
                  >
                    <option value="PRACTICING">練習中</option>
                    <option value="LEARNED">持ち歌</option>
                    <option value="MASTERED">十八番</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* PC専用：左端のチェックボックス */}
                  <div className="hidden sm:block shrink-0">
                    <input
                      type="checkbox"
                      checked={song.selected}
                      onChange={(e) =>
                        updateSong(song.id, "selected", e.target.checked)
                      }
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                  </div>

                  {/* 🎵 曲名・入れ替え・アーティスト */}
                  <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-end w-full relative">
                    <div className="w-full flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-muted-foreground ml-1 mb-1 block">
                        曲名
                        {/* 登録済みの場合はバッジを表示 */}
                        {song.isDuplicate && (
                          <span className="ml-2 bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded text-[9px] font-black">
                            登録済み
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={song.title}
                        onChange={(e) =>
                          updateSong(song.id, "title", e.target.value)
                        }
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-bold"
                        placeholder="曲名"
                      />
                    </div>

                    <div className="flex justify-center w-full sm:w-auto -my-3 sm:my-0 sm:mx-2 sm:pb-0.5 sm:mt-4 z-10">
                      <button
                        onClick={() => swapTitleAndArtist(song.id)}
                        className="p-1.5 sm:p-2 bg-muted hover:bg-border border-4 border-card sm:border-none rounded-full transition-colors text-muted-foreground shadow-sm sm:shadow-none"
                        title="曲名とアーティストを入れ替える"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4 transform rotate-90 sm:rotate-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="w-full flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-muted-foreground ml-1 mb-1 block">
                        アーティスト
                      </label>
                      <input
                        type="text"
                        value={song.artist}
                        onChange={(e) =>
                          updateSong(song.id, "artist", e.target.value)
                        }
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                        placeholder="アーティスト名"
                      />
                    </div>
                  </div>

                  {/* PC専用：右端のステータス */}
                  <div className="hidden sm:block w-32 shrink-0">
                    <label className="text-[10px] font-bold text-muted-foreground ml-1 mb-1 block">
                      ステータス
                    </label>
                    <select
                      value={song.status}
                      onChange={(e) =>
                        updateSong(song.id, "status", e.target.value)
                      }
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-bold"
                    >
                      <option value="PRACTICING">練習中</option>
                      <option value="LEARNED">持ち歌</option>
                      <option value="MASTERED">十八番</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 保存オプション＆ボタン */}
          <div className="mt-8 bg-card border border-border p-5 sm:p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-black text-foreground mb-4 border-b border-border pb-2">
              最終確認
            </h3>

            <label className="flex items-center gap-3 mb-4 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={createSetlist}
                onChange={(e) => setCreateSetlist(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <span className="font-bold text-sm">
                同時にセットリストを作成する
              </span>
            </label>

            {createSetlist && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-muted-foreground ml-1 mb-1 block">
                  セットリスト名
                </label>
                <input
                  type="text"
                  value={setlistName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="セットリストの名前"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-black py-4 rounded-xl shadow-lg transition-all text-lg"
            >
              {isPending
                ? "保存中..."
                : `${songs.filter((s) => s.selected).length} 曲を登録する！`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
