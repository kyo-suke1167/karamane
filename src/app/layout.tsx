import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Karamane - 持ち歌&キー管理アプリ",
  description: "カラオケの持ち歌をキー情報などと共に管理できるアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <Providers>
          <Header />
          <main className="max-w-4xl mx-auto p-4 min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
