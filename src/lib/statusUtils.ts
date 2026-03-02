import { SongStatus } from "@/types";

export const STATUS_CONFIG = {
  [SongStatus.PRACTICING]: {
    label: "練習中",
    icon: "🔰",
    // バッジ用
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    // カード全体用 (左線の色 + ほんのり背景色)
    cardBorder: "border-l-blue-500",
    cardBg: "bg-blue-50/30 dark:bg-transparent",
  },
  [SongStatus.LEARNED]: {
    label: "持ち歌",
    icon: "🎤",
    badgeColor: "bg-green-100 text-green-700 border-green-200",
    cardBorder: "border-l-green-500",
    cardBg: "bg-white-50/30 dark:bg-transparent",
  },
  [SongStatus.MASTERED]: {
    label: "十八番",
    icon: "👑",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    cardBorder: "border-l-amber-500",
    cardBg: "bg-amber-50/30 dark:bg-transparent",
  },
};

export function getStatusStyle(status: SongStatus) {
  return STATUS_CONFIG[status] || STATUS_CONFIG[SongStatus.LEARNED];
}
