"use client";

import { useState, useTransition } from "react";
import { addSingingRecord, deleteSingingRecord } from "@/actions/record";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Record = {
  id: number;
  score: number | null;
  key: number | null;
  memo: string | null;
  createdAt: Date;
};

type Props = {
  songId: number;
  records: Record[];
};

export default function SingingRecordSection({ songId, records = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [score, setScore] = useState<string>("");
  const [key, setKey] = useState<string>("0");
  const [memo, setMemo] = useState<string>("");

  const [placeholder, setPlaceholder] = useState("");
  const placeholders = [
    "例: ラスサビの高音がかすれた…。次は裏声を多めに使ってみる！",
    "例: マイクの距離感と腹式呼吸を意識する！",
    "例: ビブラートの判定が渋かった...",
    "例: 自己ベスト更新！！",
    "例: 友達と大合唱して最高に盛り上がった！🎉",
    "例: 喉の調子が絶好調！この曲は十八番かも！",
    "例: 飲み会終わりの深夜テンションで歌ったら喉が死んだ😇",
    "例: 2番の歌詞が曖昧だったから要復習！",
  ];

  const toggleForm = () => {
    if (!isOpen) {
      const randomText =
        placeholders[Math.floor(Math.random() * placeholders.length)];
      setPlaceholder(randomText);
    }
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await addSingingRecord({
        songId,
        score: score ? parseFloat(score) : null,
        key: key ? parseInt(key, 10) : null,
        memo: memo || null,
      });
      setIsOpen(false);
      setScore("");
      setKey("0");
      setMemo("");
    });
  };

  const handleDelete = (recordId: number) => {
    if (!confirm("この記録を削除しますか？")) return;
    startTransition(async () => {
      await deleteSingingRecord(recordId, songId);
    });
  };

  const isScoreOver100 = score !== "" && parseFloat(score) > 100;

  const chartData = [...records]
    .filter((r) => r.score !== null)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      }),
      score: r.score,
    }));

  return (
    <div className="mt-8 border-t border-border-light pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          カラオケ日記{" "}
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({records.length}件)
          </span>
        </h2>
        <button
          onClick={toggleForm}
          className="text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 active:scale-95"
        >
          {isOpen ? "キャンセル" : "＋ 記録をつける"}
        </button>
      </div>

      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-muted/30 border border-border-light p-5 rounded-xl mb-6 animate-in fade-in slide-in-from-top-2 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                点数 (任意)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="80.0"
                  className={`w-full bg-background border rounded-lg pl-3 pr-8 py-2 text-foreground focus:ring-2 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    isScoreOver100
                      ? "border-red-500 focus:ring-red-500 bg-red-500/5"
                      : "border-border focus:ring-primary"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold pointer-events-none">
                  点
                </span>
              </div>
              {isScoreOver100 && (
                <p className="text-red-500 text-[10px] font-bold mt-1.5 animate-in fade-in slide-in-from-top-1">
                  ※ 点数は100点以下で設定してね！
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                キー (任意)
              </label>
              <div className="relative">
                <select
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-3 pr-8 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">未設定</option>
                  {[...Array(15)].map((_, i) => {
                    const val = 7 - i;
                    const label =
                      val > 0 ? `+${val}` : val === 0 ? "±0" : `${val}`;
                    return (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              振り返りメモ (任意)
            </label>
            <textarea
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none placeholder:text-muted-foreground/70"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || (!score && !key && !memo) || isScoreOver100}
            className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
          >
            {isPending ? "保存中..." : "この記録を保存する"}
          </button>
        </form>
      )}

      {chartData.length >= 1 && (
        <div className="mb-6 bg-card border border-border rounded-xl p-4 shadow-sm animate-in fade-in">
          <h3 className="text-sm font-bold text-muted-foreground mb-4">
            点数の推移
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  domain={["dataMin - 2", 100]}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number | undefined) => [
                    `${value ?? 0} 点`,
                    "スコア",
                  ]}
                  labelStyle={{
                    color: "#6b7280",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#3b82f6",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff" }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {records.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm font-bold bg-muted/20 rounded-xl border border-dashed border-border-light">
            まだ記録がありません。
            <br />
            歌った結果を残して成長を実感しよう！
          </p>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/30 transition-colors group relative overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {new Date(record.createdAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>

                <button
                  onClick={() => handleDelete(record.id)}
                  disabled={isPending}
                  className="text-muted-foreground hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 bg-card rounded-md"
                  title="削除する"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-end gap-4 mb-2">
                {record.score !== null && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground leading-none">
                      {record.score}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">
                      点
                    </span>
                  </div>
                )}
                {record.key !== null && (
                  <div className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-md mb-0.5">
                    キー:{" "}
                    {record.key > 0
                      ? `+${record.key}`
                      : record.key === 0
                        ? "±0"
                        : record.key}
                  </div>
                )}
              </div>

              {record.memo && (
                <p className="text-sm text-foreground mt-3 whitespace-pre-wrap leading-relaxed bg-muted/30 p-3 rounded-lg border border-border-light">
                  {record.memo}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
