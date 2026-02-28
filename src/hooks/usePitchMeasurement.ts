import { useState, useRef, useEffect, useCallback } from "react";
import { AMDF } from "pitchfinder";

const getNoteFromPitch = (frequency: number) => {
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  return Math.round(noteNum) + 69;
};

// 音量の足切りライン（0〜100）
const MIN_VOLUME = 20;
// 同じ音を何フレーム連続で出せたら「歌声」とみなすか
const MIN_SUSTAIN_FRAMES = 30;

export function usePitchMeasurement() {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [pitch, setPitch] = useState<number | null>(null);
  const [noteNum, setNoteNum] = useState<number | null>(null);

  const [lowestNote, setLowestNote] = useState<number | null>(null);
  const [highestNote, setHighestNote] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);
  const detectPitchRef = useRef<((float32Array: Float32Array) => number | null) | null>(null);

  const sustainedNoteRef = useRef<number | null>(null);
  const sustainCountRef = useRef<number>(0);

  const updatePitch = useCallback(function loop() {
    if (!analyserRef.current || !detectPitchRef.current) return;

    const float32Array = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(float32Array);

    let sum = 0;
    for (let i = 0; i < float32Array.length; i++) {
      sum += float32Array[i] * float32Array[i];
    }
    const rms = Math.sqrt(sum / float32Array.length);
    const newVolume = Math.min(100, Math.floor(rms * 1000));
    setVolume(newVolume);

    if (newVolume >= MIN_VOLUME) {
      const detectedPitch = detectPitchRef.current(float32Array);
      if (detectedPitch) {
        setPitch(Math.round(detectedPitch));
        const currentNoteNum = getNoteFromPitch(detectedPitch);
        setNoteNum(currentNoteNum);

        if (currentNoteNum >= 36 && currentNoteNum <= 84) {
          if (currentNoteNum === sustainedNoteRef.current) {
            sustainCountRef.current += 1;
            if (sustainCountRef.current >= MIN_SUSTAIN_FRAMES) {
              setLowestNote((prev) => (prev === null || currentNoteNum < prev) ? currentNoteNum : prev);
              setHighestNote((prev) => (prev === null || currentNoteNum > prev) ? currentNoteNum : prev);
            }
          } else {
            sustainedNoteRef.current = currentNoteNum;
            sustainCountRef.current = 1;
          }
        }
      } else {
        setPitch(null);
        setNoteNum(null);
        sustainedNoteRef.current = null;
        sustainCountRef.current = 0;
      }
    } else {
      setPitch(null);
      setNoteNum(null);
      sustainedNoteRef.current = null;
      sustainCountRef.current = 0;
    }

    requestRef.current = requestAnimationFrame(loop);
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      detectPitchRef.current = AMDF({ sampleRate: audioCtx.sampleRate });

      sustainedNoteRef.current = null;
      sustainCountRef.current = 0;

      setIsListening(true);
      
      // requestAnimationFrameを使うため、初回を呼び出す
      requestRef.current = requestAnimationFrame(updatePitch);
    } catch (err: unknown) {
      console.error("マイクへのアクセスに失敗しました:", err);
      alert("マイクの使用を許可してください！");
    }
  };

  const stopListening = useCallback(() => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }

    setIsListening(false);
    setVolume(0);
    setPitch(null);
    setNoteNum(null);
    sustainedNoteRef.current = null;
    sustainCountRef.current = 0;
  }, []);

  const resetRecords = () => {
    setLowestNote(null);
    setHighestNote(null);
    sustainedNoteRef.current = null;
    sustainCountRef.current = 0;
  };

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  // コンポーネント（画面）側に渡すデータと関数をまとめる
  return {
    isListening,
    volume,
    pitch,
    noteNum,
    lowestNote,
    highestNote,
    startListening,
    stopListening,
    resetRecords,
  };
}