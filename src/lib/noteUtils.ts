const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function getNoteName(noteId: number | null): string {
  if (noteId === null || noteId === undefined || noteId === 0) {
    return "未設定";
  }

  const noteIndex = noteId % 12;
  const note = NOTE_NAMES[noteIndex];

  const karaokeOctave = Math.floor((noteId - 9) / 12);

  let prefix = "";

  if (karaokeOctave <= 2) prefix = "low";       // ~ G#2
  else if (karaokeOctave === 3) prefix = "mid1"; // A2 ~ G#3
  else if (karaokeOctave === 4) prefix = "mid2"; // A3 ~ G#4
  else if (karaokeOctave === 5) prefix = "hi";   // A4 ~ G#5 (サビ高音)
  else if (karaokeOctave >= 6) prefix = "hihi";  // A5 ~     (超高音)

  return `${prefix}${note}`;
}

export function getNoteColor(noteId: number | null): string {
  if (noteId === null || noteId === undefined || noteId === 0) {
    return "bg-muted text-muted-foreground border-border";
  }

  if (noteId >= 81) return "bg-pink-100 text-pink-800 border-pink-200";
  if (noteId >= 69) return "bg-orange-100 text-orange-800 border-orange-200";
  if (noteId >= 57) return "bg-green-100 text-green-800 border-green-200";
  if (noteId >= 45) return "bg-blue-100 text-blue-800 border-blue-200";
  
  return "bg-purple-100 text-purple-800 border-purple-200";
}

export const NOTE_OPTIONS = Array.from({ length: 60 }, (_, i) => {
  const id = i + 33; // 33(lowA) スタート
  return {
    id: id,
    label: `${getNoteName(id)} (${id})`,
    value: id,
  };
});