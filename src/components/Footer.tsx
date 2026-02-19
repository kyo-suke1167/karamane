"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-card border-t border-border pb-safe transition-colors z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        
        {/* ホーム (持ち歌一覧) */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors
            ${isActive("/") 
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mb-1">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
          <span className="text-[10px] font-bold">ホーム</span>
        </Link>

        {/* セットリスト */}
        <Link
          href="/setlists"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors
            ${isActive("/setlists") 
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mb-1">
            <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
            <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
          </svg>
          <span className="text-[10px] font-bold">セットリスト</span>
        </Link>

      </div>
    </footer>
  );
}