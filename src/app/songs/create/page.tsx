"use client";

import { createSong } from "@/actions/song";
import { fetchYoutubeVideo } from "@/actions/youtube";
import Link from "next/link";
import { NOTE_OPTIONS } from "@/lib/noteUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { songSchema, type SongSchema } from "@/lib/schema";
import { useState, useTransition } from "react";

export default function CreateSongPage() {
  const [isPending, startTransition] = useTransition();
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SongSchema>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: "",
      artist: "",
      youtubeUrl: "",
      status: "LEARNED",
      minNoteId: null,
      maxNoteId: null,
      memo: "",
    },
  });

  const onSubmit = (data: SongSchema) => {
    startTransition(async () => {
      const result = await createSong(data);
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  const handleAutoFill = async () => {
    const url = getValues("youtubeUrl");
    if (!url) {
      alert("YouTubeのURLを入力してください！");
      return;
    }

    setIsFetchingUrl(true);
    try {
      const data = await fetchYoutubeVideo(url);

      if ("error" in data) {
        alert(data.error);
        return;
      }

      if (data.title) setValue("title", data.title, { shouldValidate: true });
      if (data.artist)
        setValue("artist", data.artist, { shouldValidate: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("予期せぬエラーが発生しました。");
      }
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleSwap = () => {
    const currentTitle = getValues("title");
    const currentArtist = getValues("artist");
    setValue("title", currentArtist, { shouldValidate: true });
    setValue("artist", currentTitle, { shouldValidate: true });
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          新しい持ち歌を登録
        </h1>
        <Link
          href="/songs/import"
          className="bg-primary/10 text-primary hover:bg-primary/20 text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 border border-primary/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          YouTubeから一括追加
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6 transition-colors"
      >
        {/* YouTube URL */}
        <div className="bg-muted/30 p-4 rounded-xl border border-border-light relative">
          <label className="block text-sm font-medium text-foreground mb-1">
            YouTube URL{" "}
            <span className="text-muted-foreground text-xs ml-2 font-normal">
              ※任意
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              {...register("youtubeUrl")}
              type="text"
              placeholder="https://youtu.be/..."
              className={`flex-1 min-w-0 bg-background text-foreground border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-colors placeholder:text-muted-foreground ${
                errors.youtubeUrl
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border focus:ring-ring"
              }`}
            />
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={isFetchingUrl}
              className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap text-sm flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {isFetchingUrl ? (
                "取得中..."
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                  自動入力
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-bold leading-relaxed">
            💡
            URLを入れて自動入力ボタンを押すと、曲名とアーティストが自動で埋まるよ！
            <br />
            さらに、登録後は曲の詳細画面でYouTube動画を直接再生できるようになります🎵
          </p>
          {errors.youtubeUrl && (
            <p className="text-red-500 text-xs mt-1 font-bold">
              {errors.youtubeUrl.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {/* 曲名 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">
              曲名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              type="text"
              placeholder="例: 怪獣の花唄"
              className={`w-full bg-background text-foreground border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-colors placeholder:text-muted-foreground ${
                errors.title
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border focus:ring-ring"
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* 入れ替えボタン */}
          <button
            type="button"
            onClick={handleSwap}
            className="self-center p-2 bg-background border border-border rounded-full text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm hover:shadow-md active:scale-95 transform rotate-90 sm:rotate-0 -mt-5 -mb-11 z-10"
            title="曲名とアーティストを入れ替える"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 sm:rotate-90"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
          </button>

          {/* アーティスト */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">
              アーティスト <span className="text-red-500">*</span>
            </label>
            <input
              {...register("artist")}
              type="text"
              placeholder="例: Vaundy"
              className={`w-full bg-background text-foreground border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-colors placeholder:text-muted-foreground ${
                errors.artist
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border focus:ring-ring"
              }`}
            />
            {errors.artist && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                {errors.artist.message}
              </p>
            )}
          </div>
        </div>

        {/* ステータス選択 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            今のレベル <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-4 text-foreground">
            <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border p-3 rounded-lg hover:bg-muted transition-colors has-checked:bg-blue-50 dark:has-checked:bg-blue-900/20 has-checked:border-blue-300 dark:has-checked:border-blue-700">
              <input
                {...register("status")}
                type="radio"
                value="PRACTICING"
                className="accent-blue-500"
              />
              <span className="font-bold">🔰 練習中</span>
            </label>
            <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border p-3 rounded-lg hover:bg-muted transition-colors has-checked:bg-green-50 dark:has-checked:bg-green-900/20 has-checked:border-green-300 dark:has-checked:border-green-700">
              <input
                {...register("status")}
                type="radio"
                value="LEARNED"
                className="accent-green-500"
              />
              <span className="font-bold">🎤 持ち歌</span>
            </label>
            <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border p-3 rounded-lg hover:bg-muted transition-colors has-checked:bg-primary/10 has-checked:border-primary/50">
              <input
                {...register("status")}
                type="radio"
                value="MASTERED"
                className="accent-primary"
              />
              <span className="font-bold">👑 十八番</span>
            </label>
          </div>
          {errors.status && (
            <p className="text-red-500 text-xs mt-1 font-bold">
              {errors.status.message}
            </p>
          )}
        </div>

        {/* 音域入力 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              最低音
            </label>
            <div className="relative">
              <select
                {...register("minNoteId", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
                className={`w-full border rounded-lg px-4 py-2 appearance-none outline-none cursor-pointer text-foreground transition-colors ${
                  errors.minNoteId
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-border bg-background"
                }`}
              >
                <option value="" className="bg-background text-foreground">
                  未設定
                </option>
                {NOTE_OPTIONS.map((note) => (
                  <option
                    key={note.id}
                    value={note.value}
                    className="bg-background text-foreground"
                  >
                    {note.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">
                ▼
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              最高音
            </label>
            <div className="relative">
              <select
                {...register("maxNoteId", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
                className={`w-full border rounded-lg px-4 py-2 appearance-none outline-none cursor-pointer text-foreground transition-colors ${
                  errors.maxNoteId
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-border bg-background"
                }`}
              >
                <option value="" className="bg-background text-foreground">
                  未設定
                </option>
                {NOTE_OPTIONS.map((note) => (
                  <option
                    key={note.id}
                    value={note.value}
                    className="bg-background text-foreground"
                  >
                    {note.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">
                ▼
              </div>
            </div>
          </div>
        </div>

        {errors.minNoteId && (
          <div className="text-red-500 text-sm font-bold bg-red-50 border border-red-200 p-3 rounded-lg text-center transition-colors">
            ⚠️ {errors.minNoteId.message}
          </div>
        )}

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            メモ
          </label>
          <textarea
            {...register("memo")}
            rows={4}
            placeholder="例: Cメロの息継ぎ注意！ / オク下で歌うとちょうどいい / 〇〇さんの歌い方を参考に練習中、など"
            className="w-full bg-background text-foreground border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring outline-none resize-none transition-colors placeholder:text-muted-foreground"
          />
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
          <Link
            href="/"
            className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors font-bold"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className={`px-6 py-2 rounded-lg font-bold transition-colors shadow-md ${
              isPending
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary-hover"
            }`}
          >
            {isPending ? "登録中..." : "登録"}
          </button>
        </div>
      </form>
    </div>
  );
}
