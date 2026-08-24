"use client";

import { useState } from "react";
import { X, Download, FileSpreadsheet, Image as ImageIcon, Check, Loader2 } from "lucide-react";
import { LeaderboardRow } from "@/lib/scoring/leaderboard";
import { Tournament } from "@/types/database";
import html2canvas from "html2canvas";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  standings: LeaderboardRow[];
  scorecardElementId: string;
}

export function ExportModal({
  isOpen,
  onClose,
  tournament,
  standings,
  scorecardElementId,
}: ExportModalProps) {
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // 1. Export as CSV
  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "Team Name",
      "Tag",
      "Matches Played",
      "Wins (WWCD)",
      "Placement Points",
      "Finish/Kill Points",
      "Total Kills",
      "Bonus Points",
      "Penalty Points",
      "Total Points",
    ];

    const rows = standings.map((row) => [
      row.rank,
      `"${row.team.name}"`,
      `"${row.team.short_name}"`,
      row.matchesPlayed,
      row.wins,
      row.placementPoints,
      row.finishPoints,
      row.totalKills,
      row.bonusPoints,
      row.penaltyPoints,
      row.totalPoints,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${tournament.slug}-standings.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Export as PNG Image
  const handleExportPNG = async () => {
    try {
      setIsExportingImage(true);
      const element = document.getElementById(scorecardElementId);
      if (!element) {
        alert("Scorecard element not found");
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: "#0B132B",
        scale: 2, // High resolution for stream & retina displays
        useCORS: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${tournament.slug}-overall-standings.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      console.error("Export image error:", err);
      alert("Failed to generate image: " + err.message);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-esports-navy-border bg-esports-navy-card p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-esports-silver hover:bg-esports-navy-light hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5">
          <h3 className="font-display text-xl font-black uppercase tracking-wider text-white">
            Export & Share Standings
          </h3>
          <p className="text-xs text-esports-silver mt-1">
            Download high-resolution broadcast graphics or spreadsheets of {tournament.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* PNG Export Button */}
          <button
            onClick={handleExportPNG}
            disabled={isExportingImage}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-esports-orange/40 bg-gradient-to-b from-esports-orange/20 to-transparent p-5 text-center transition-all hover:border-esports-orange hover:bg-esports-orange/30 disabled:opacity-50"
          >
            {isExportingImage ? (
              <Loader2 className="h-8 w-8 text-esports-orange animate-spin" />
            ) : (
              <ImageIcon className="h-8 w-8 text-esports-orange" />
            )}
            <span className="font-display text-sm font-black uppercase text-white">
              {isExportingImage ? "Rendering PNG..." : "Export Poster (PNG)"}
            </span>
            <span className="text-[11px] text-esports-silver">
              Broadcast-ready high resolution screenshot for Discord / Instagram
            </span>
          </button>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent p-5 text-center transition-all hover:border-emerald-500 hover:bg-emerald-500/20"
          >
            <FileSpreadsheet className="h-8 w-8 text-emerald-400" />
            <span className="font-display text-sm font-black uppercase text-white">
              Export Data (CSV)
            </span>
            <span className="text-[11px] text-esports-silver">
              Raw points, kills, placements and tie-breaker data in Excel format
            </span>
          </button>
        </div>

        {/* Share Link Row */}
        <div className="mt-5 rounded-lg border border-esports-navy-border bg-esports-navy-dark p-3.5 flex items-center justify-between gap-3">
          <div className="truncate text-xs font-mono text-esports-silver">
            {typeof window !== "undefined" ? window.location.href : ""}
          </div>
          <button
            onClick={handleCopyShareLink}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-esports-navy-light px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-esports-orange transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <span>Copy Link</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
