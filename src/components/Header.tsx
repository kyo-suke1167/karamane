import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* ロゴエリア */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">🎤</span>
          <span className="font-bold text-xl text-amber-500 tracking-tight">
            Karamane
          </span>
        </Link>

        {/* ナビゲーションエリア */}
        <nav className="flex items-center gap-4">
          <Link 
            href="/songs/create" 
            className="text-sm font-medium bg-amber-500 text-white px-4 py-2 rounded-full hover:bg-amber-600 transition shadow-sm"
          >
            + 持ち歌登録
          </Link>
          
          <Link 
            href="/settings"
            className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition"
          >
            ⚙️
          </Link>
        </nav>
      </div>
    </header>
  );
}