/**
 * YouTubeのプレイリストURLからプレイリストIDを抽出する関数
 * @param url - YouTubeのプレイリストURL
 * @returns プレイリストID（見つからない場合はnull）
 */
export function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * YouTubeの動画URLから11桁の動画ID（Video ID）を抽出する関数
 * @param url - YouTubeの動画URL（null許容）
 * @returns 動画ID（見つからない場合はnull）
 */
export function extractVideoId(url: string | null): string | null {
  if (!url) return null;

  // 短縮URLやパラメータ付きなど、あらゆるパターンのURLに対応する強力な正規表現
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  // YouTubeの動画IDは必ず11桁なので、それもチェック！
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * YouTubeの動画タイトルを解析し、不要な文字列を除去して
 * 「曲名」と「アーティスト名」に分離する関数
 */
// Youtubeタイトル解析関数
export function parseYouTubeTitle(rawTitle: string, channelTitle: string): { title: string; artist: string } {
  let title = rawTitle;
  let artist = "";

  if (rawTitle.includes(" / ")) {
    const parts = rawTitle.split(" / ");
    title = parts[0].trim();
    artist = parts[1].trim();
  } else if (rawTitle.includes(" - ")) {
    const parts = rawTitle.split(" - ");
    artist = parts[0].trim();
    title = parts[1].trim();
  } else if (rawTitle.includes("「") && rawTitle.includes("」")) {
    const match = rawTitle.match(/^(.*?)「(.*?)」/);
    if (match) {
      artist = match[1].trim();
      title = match[2].trim();
    }
  }

  title = title
    .replace(/Official|Music Video|MV|Lyric Video|Audio/gi, "")
    .replace(/【.*?】/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/[()（）]/g, "")
    .trim();

  artist = artist.replace(/Official|Channel/gi, "").trim();
  const cleanChannelName = channelTitle.replace(/ - Topic|Official|Channel|公式/gi, "").trim();
  const finalArtist = artist || cleanChannelName;
  let finalTitle = title;

  if (finalArtist && finalTitle.includes(finalArtist) && finalTitle !== finalArtist) {
    finalTitle = finalTitle.replace(finalArtist, "").trim();
    finalTitle = finalTitle.replace(/^[-\s/・〜]+|[-\s/・〜]+$/g, "").trim();
  }

  return {
    title: finalTitle || rawTitle,
    artist: finalArtist || "不明なアーティスト",
  };
}