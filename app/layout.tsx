import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Esportix — Esports Tournament Scoring & Live Leaderboard Platform",
  description: "Next-generation multi-game esports scoring engine and broadcast-grade live leaderboard platform for BGMI, Free Fire, Valorant, COD, and collegiate tournaments.",
  openGraph: {
    title: "Esportix — Esports Tournament Scoring & Leaderboard",
    description: "Broadcast-quality live scores, points engine, and real-time standings.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <div className="relative flex min-h-screen flex-col bg-grid-pattern">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
