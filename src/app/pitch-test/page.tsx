"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { AMDF } from "pitchfinder";
import { getNoteName as getKaraokeNoteName } from "@/lib/noteUtils";
import { saveVocalRange } from "@/app/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

const getNoteFromPitch = (frequency: number) => {
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  return Math.round(noteNum) + 69; 
};

// 音量の足切りライン（0〜100）
const MIN_VOLUME = 20;
// 同じ音を何フレーム連続で出せたら「歌声」とみなすか
const MIN_SUSTAIN_FRAMES = 30;

export default function PitchTestPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [pitch, setPitch] = useState<number | null>(null);
  const [noteNum, setNoteNum] = useState<number | null>(null);
  
  const [lowestNote, setLowestNote] = useState<number | null>(null);
  const [highestNote, setHighestNote] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);
  const detectPitchRef = useRef<any>(null);

  const sustainedNoteRef = useRef<number | null>(null);
  const sustainCountRef = useRef<number>(0);

  const startListening = async () => {
    try {
      setSaveMessage(""); 
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048; 
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      detectPitchRef.current = AMDF({ sampleRate: audioCtx.sampleRate });

      // リセット
      sustainedNoteRef.current = null;
      sustainCountRef.current = 0;

      setIsListening(true);
      updatePitch();
    } catch (err) {
      console.error("マイクへのアクセスに失敗しました:", err);
      alert("マイクの使用を許可してください！");
    }
  };

  const stopListening = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    
    setIsListening(false);
    setVolume(0);
    setPitch(null);
    setNoteNum(null);
    sustainedNoteRef.current = null;
    sustainCountRef.current = 0;
  };

  const updatePitch = () => {
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
          // 一瞬の裏返り対策、同じ音をキープしているかチェック
          if (currentNoteNum === sustainedNoteRef.current) {
            sustainCountRef.current += 1;
            
            // 規定の回数（MIN_SUSTAIN_FRAMES）キープできたら初めて記録する！
            if (sustainCountRef.current >= MIN_SUSTAIN_FRAMES) {
              setLowestNote(prev => (prev === null || currentNoteNum < prev) ? currentNoteNum : prev);
              setHighestNote(prev => (prev === null || currentNoteNum > prev) ? currentNoteNum : prev);
            }
          } else {
            // 違う音にブレたらカウントをリセット
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
      // 無音になったらキープ回数もリセット
      sustainedNoteRef.current = null;
      sustainCountRef.current = 0;
    }

    requestRef.current = requestAnimationFrame(updatePitch);
  };

  useEffect(() => {
    return () => stopListening();
  }, []);

  const resetRecords = () => {
    setLowestNote(null);
    setHighestNote(null);
    setSaveMessage("");
    sustainedNoteRef.current = null;
    sustainCountRef.current = 0;
  };

  const handleSaveToProfile = () => {
    if (lowestNote === null || highestNote === null) return;
    
    startTransition(async () => {
      try {
        await saveVocalRange(lowestNote, highestNote);
        setSaveMessage("プロフィールに音域を保存しました！");
        router.refresh();
      } catch (error) {
        setSaveMessage("保存に失敗しました...");
      }
    });
  };

  const getDisplayNote = (num: number | null) => {
    if (num === null) return "-";
    return getKaraokeNoteName(num);
  };

  const getPraiseMessage = () => {
    if (lowestNote === null || highestNote === null) return null;
    const range = highestNote - lowestNote;
    if (range >= 36) return "3オクターブ幅！？もはや人間やめてる！";
    if (range >= 30) return "2.5オクターブ幅！バケモノ級の音域！！";
    if (range >= 24) return "2オクターブ超え！プロ顔負けの広さ！！";
    if (range >= 18) return "平均以上の広い音域！色んな曲が歌えそう！";
    return null;
  };

  const praiseMessage = getPraiseMessage();

  return (
    <div className="max-w-md mx-auto py-10 px-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          🎙️ 音域測定
        </h1>
        
        <Link 
          href="/settings/profile" 
          className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors bg-muted hover:bg-border px-3 py-1.5 rounded-lg flex items-center gap-1"
        >
          <span>ユーザー設定に移動</span> 
        </Link>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 shadow-sm">
        <p className="text-sm font-bold text-foreground mb-1 flex items-center gap-1">
          💡 測定のコツ
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          無理な声出しは禁物！あなたが<strong className="text-primary">「楽に出せる声の範囲」</strong>を測定してみてね。
          雑音や一瞬の裏返りを拾わないよう、<strong className="text-red-400">赤い線</strong>を超える声量で「アー」と少しキープして歌ってね！
        </p>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6 transition-colors">
        
        <div className="flex justify-between items-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-colors border
            ${isListening ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"}`}
          >
            <div className={`w-2 h-2 rounded-full ${isListening ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
            {isListening ? "測定中..." : "待機中"}
          </div>
        </div>

        <div className="text-center py-6 bg-background rounded-xl border border-border relative overflow-hidden">
          <p className="text-sm font-bold text-muted-foreground mb-1 relative z-10">現在の音</p>
          <div className={`text-6xl font-black tracking-tighter mb-1 relative z-10 min-h-18 transition-colors ${volume >= MIN_VOLUME ? 'text-primary' : 'text-muted-foreground/30'}`}>
            {getDisplayNote(noteNum)}
          </div>
          <p className="text-xs text-muted-foreground font-mono relative z-10">
            {pitch && volume >= MIN_VOLUME ? `${pitch} Hz` : "--- Hz"}
          </p>
          
          <div className="absolute bottom-0 left-0 w-full h-2 bg-muted">
            <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${MIN_VOLUME}%` }} />
            <div 
              className={`h-full transition-all duration-75 ease-out ${volume >= MIN_VOLUME ? 'bg-primary' : 'bg-primary/30'}`}
              style={{ width: `${volume}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background p-4 rounded-xl text-center border border-border flex flex-col justify-center">
            <p className="text-xs font-bold text-muted-foreground mb-1">最低音 (Low)</p>
            <div className="text-3xl font-black text-blue-500 min-h-9">
              {getDisplayNote(lowestNote)}
            </div>
          </div>
          <div className="bg-background p-4 rounded-xl text-center border border-border flex flex-col justify-center">
            <p className="text-xs font-bold text-muted-foreground mb-1">最高音 (High)</p>
            <div className="text-3xl font-black text-red-400 min-h-9">
              {getDisplayNote(highestNote)}
            </div>
          </div>
        </div>

        <div className="min-h-10 flex items-center justify-center">
          {praiseMessage && (
            <div className="text-sm font-bold text-amber-500 dark:text-amber-400 animate-bounce text-center px-2">
              {praiseMessage}
            </div>
          )}
        </div>

        {/* ボタンエリア */}
        <div className="flex flex-col gap-3 pt-2">
          {isListening ? (
            <button onClick={stopListening} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 font-bold py-3 rounded-xl transition-colors w-full">
              測定をストップ
            </button>
          ) : (
            <div className="flex gap-2 w-full">
              <button onClick={resetRecords} className="bg-muted hover:bg-border text-foreground font-bold py-3 px-4 rounded-xl transition-colors shrink-0">
                リセット
              </button>
              
              <button 
                onClick={startListening} 
                className={`flex-1 font-bold py-3 rounded-xl shadow-md transition-colors ${
                  (lowestNote !== null || highestNote !== null)
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30" // 🦁 記録あり：ストップと同じ赤色！
                    : "bg-primary text-primary-foreground hover:bg-primary-hover" // 🦁 記録なし：最初のプライマリー色！
                }`}
              >
                {(lowestNote !== null || highestNote !== null) ? "測定を再開" : "測定をはじめる"}
              </button>
            </div>
          )}

          {/* 保存ボタン */}
          {lowestNote !== null && highestNote !== null && !isListening && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button 
                onClick={handleSaveToProfile}
                disabled={isPending}
                className={`w-full font-bold py-3 rounded-xl transition-colors shadow-sm
                  ${isPending 
                    ? "bg-muted text-muted-foreground cursor-not-allowed" 
                    : "bg-primary text-primary-foreground hover:bg-primary-hover"}`}
              >
                {isPending ? "保存中..." : "この音域をプロフィールに保存"}
              </button>
              {saveMessage && (
                <p className="text-center text-sm font-bold mt-2 text-green-600 dark:text-green-400 animate-pulse">
                  {saveMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}