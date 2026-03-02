import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KARAMANE",
  description: "持ち歌管理アプリ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  let currentUser = null;
  if (session?.user) {
    currentUser = await prisma.user.findUnique({
      where: { id: (session.user as { id: string }).id },
      select: { name: true, image: true },
    });
  }

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <Providers>
          <Header currentUser={currentUser} />
          <main className="max-w-4xl mx-auto p-4 min-h-[calc(100vh-64px)]">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
