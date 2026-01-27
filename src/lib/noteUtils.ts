const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function getNoteName(noteId: number | null): string {
  if (noteId === null || noteId === undefined) {
    return "?";
  }

  // MIDIノート番号からオクターブと音階を計算
  const octave = Math.floor(noteId / 12) - 1;
  const noteIndex = noteId % 12;
  const note = NOTE_NAMES[noteIndex];

  let prefix = "";

  if (octave <= 2) prefix = "low";       // 36~47: lowC ~ lowB (バリサク・チェロ域)
  else if (octave === 3) prefix = "mid1"; // 48~59: mid1C ~ mid1B (男性平均)
  else if (octave === 4) prefix = "mid2"; // 60~71: mid2C ~ mid2B (女性平均・男性高音)
  else if (octave === 5) prefix = "hi";   // 72~83: hiC ~ hiB (サビの高音)
  else if (octave >= 6) prefix = "hihi";  // 84~  : hihiC ~ (超高音・ホイッスル)

  return `${prefix}${note}`;
}

export function getNoteColor(noteId: number | null): string {
  if (noteId === null || noteId === undefined) {
    return "bg-gray-100 text-gray-500";
  }

  if (noteId >= 84) return "bg-pink-100 text-pink-800 border-pink-200";     // hihi (超高音)
  if (noteId >= 72) return "bg-orange-100 text-orange-800 border-orange-200"; // hi (高音)
  if (noteId >= 60) return "bg-green-100 text-green-800 border-green-200";   // mid2 (中高音)
  if (noteId >= 48) return "bg-blue-100 text-blue-800 border-blue-200";     // mid1 (中低音)
  return "bg-purple-100 text-purple-800 border-purple-200";                 // low (低音)
}

// NOTE_OPTIONS 生成ロジック
// Start: 36 (lowC / C2)
// End:   87 (hihiD# / D#6)
// Count: 60個分
export const NOTE_OPTIONS = Array.from({ length: 52 }, (_, i) => {
  const id = i + 36; // 36スタート (lowC)
  return {
    id: id,
    label: `${getNoteName(id)} (${id})`,
    value: id,
  };
});