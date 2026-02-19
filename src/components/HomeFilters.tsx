"use client";

import { STATUS_CONFIG } from "@/lib/statusUtils";
import { useState, useEffect, useRef } from "react";

type Props = {
  onSearchChange: (query: string) => void;
  onStatusChange: (statuses: string[]) => void;
};

export function HomeFilters({ onSearchChange, onStatusChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearchChange]);

  const toggleStatus = (statusKey: string) => {
    const newStatuses = selectedStatuses.includes(statusKey)
      ? selectedStatuses.filter((s) => s !== statusKey)
      : [...selectedStatuses, statusKey];
    
    setSelectedStatuses(newStatuses);
    onStatusChange(newStatuses);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative mb-6 flex gap-2" ref={menuRef}>
      {/* 検索窓 */}
      <div className="relative flex-1">
        <div className="absolute left-3 bottom-3 text-muted-foreground pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="曲名・歌手名で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-base sm:text-sm text-foreground placeholder-muted-foreground shadow-sm focus:ring-2 focus:ring-ring outline-none transition-all"
        />
      </div>

      {/* ハンバーガーメニュー */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-sm transition-all border ${
          isOpen || selectedStatuses.length > 0 
            ? "border-primary text-primary bg-primary/10" 
            : "bg-card border-border text-muted-foreground hover:bg-muted"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        
        {selectedStatuses.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full border border-card">
            {selectedStatuses.length}
          </span>
        )}
      </button>

      {/* ドロップダウン */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border-light rounded-xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-xs font-bold text-muted-foreground mb-2 px-1">ステータスで絞り込み</div>
          <div className="space-y-1">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const isChecked = selectedStatuses.includes(key);
              return (
                <label
                  key={key}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleStatus(key);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isChecked ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    isChecked ? "bg-primary border-primary" : "bg-card border-border"
                  }`}>
                    {isChecked && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-primary-foreground">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground flex-1">
                    {config.icon} {config.label}
                  </span>
                </label>
              );
            })}
          </div>
          
          {selectedStatuses.length > 0 && (
            <button
              onClick={() => {
                setSelectedStatuses([]);
                onStatusChange([]);
              }}
              className="w-full mt-3 text-xs text-center text-muted-foreground hover:text-foreground underline py-1 transition-colors"
            >
              選択を解除
            </button>
          )}
        </div>
      )}
    </div>
  );
}