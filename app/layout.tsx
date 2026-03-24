import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iRacing Leaderboard",
  description: "Track iRacing driver stats, ratings, and leaderboards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100 font-[family-name:var(--font-inter)]">
        <div className="bg-amber-600/90 text-amber-50 text-center text-sm py-1.5 px-4 font-medium">
          Demo Mode -- Using sample data
        </div>
        <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors duration-150"
            >
              <span className="text-lg font-bold tracking-tight">
                iRacing Leaderboard
              </span>
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
          iRacing Leaderboard -- Not affiliated with iRacing.com
        </footer>
      </body>
    </html>
  );
}
