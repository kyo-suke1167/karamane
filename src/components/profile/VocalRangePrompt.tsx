"use client";

import { useState } from "react";
import Link from "next/link";

export default function VocalRangePrompt({
  isMissing,
}: {
  isMissing: boolean;
}) {
  const [show, setShow] = useState(isMissing);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border p-6 rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95 duration-300 relative">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3 animate-bounce">🎙️</div>
          <h2 className="text-xl font-black text-foreground mb-2">
            音域を設定しよう！
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            自分の音域を設定すると、曲の高さが合っているか
            <strong className="text-primary">自動でキー提案</strong>
            をしてくれるようになるよ！
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/pitch-test"
            className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
          >
            マイクでサクッと自動測定
          </Link>

          <Link
            href="/settings/profile"
            className="flex items-center justify-center gap-2 w-full bg-muted text-foreground font-bold py-3 rounded-xl hover:bg-border transition-colors"
          >
            手動で設定する
          </Link>

          <button
            onClick={() => setShow(false)}
            className="w-full text-sm font-bold text-muted-foreground hover:text-foreground py-2 mt-2 transition-colors"
          >
            あとで設定する
          </button>
        </div>
      </div>
    </div>
  );
}
