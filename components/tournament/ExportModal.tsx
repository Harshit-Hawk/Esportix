"use client";

import { useState } from "react";
import { Tournament } from "@/types/database";
import { LeaderboardRow } from "@/lib/scoring/leaderboard";
import {
  X,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Sparkles,
  Share2,
} from "lucide-react";
import html2canvas from "html2canvas";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  standings: LeaderboardRow[];
  completedMatchesCount: number;
  tableElementId?: string;
}

export function ExportModal({
  isOpen,
  onClose,
  tournament,
  standings,
  completedMatchesCount,
  tableElementId = "overall-scorecard-table",
}: ExportModalProps) {
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadCsv = () => {
    try {
      setDownloadingCsv(true);

      const headers = [
        "Rank",
        "Team Name",
        "Tag / IGN UID",
        "Seed",
        "Group",
        "Matches Played",
        "WWCD / Wins",
        "Position Points",
        "Finish Points",
        "Total Kills",
        "Bonus Points",
        "Penalty Points",
        "Total Points",
      ];

      const rows = standings.map((r) => [
        r.rank,
        `"${r.team.name}"`,
        r.team.short_name,
        r.team.seed,
        r.team.group_name || "General",
        r.matchesPlayed,
        r.wins,
        r.placementPoints,
        r.finishPoints,
        r.totalKills,
        r.bonusPoints,
        r.penaltyPoints,
        r.totalPoints,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `${tournament.slug}-standings-match-${completedMatchesCount}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMsg("CSV spreadsheet telemetry downloaded!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("CSV Export error:", err);
      alert("Failed to export CSV");
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handleDownloadPng = async () => {
    try {
      setDownloadingPng(true);
      const element = document.getElementById(tableElementId);
      if (!element) {
        alert("Could not locate the scoreboard table element to capture.");
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: "#0E101B",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${tournament.slug}-cyber-standings-poster.png`;
      link.click();

      setSuccessMsg("Holo-Scorecard Poster downloaded in High Res!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("PNG export error:", err);
      alert("Failed to export PNG image poster");
    } finally {
      setDownloadingPng(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in font-chakra">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-[#00F0FF]/50 bg-[#0E101B] p-6 shadow-[0_0_50px_rgba(0,240,255,0.2)] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242945] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-orbitron text-lg font-black uppercase text-white">
                Export Holo-Scorecard
              </h3>
              <p className="text-xs text-slate-400">
                Download broadcast posters & spreadsheet telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-[#16192B] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-2xl border border-[#00FF66]/40 bg-[#00FF66]/10 p-3 text-xs font-bold text-[#00FF66] shadow-[0_0_10px_rgba(0,255,102,0.2)]">
            <CheckCircle2 className="h-4 w-4 text-[#00FF66]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Export Options */}
        <div className="space-y-3">
          {/* PNG Poster */}
          <button
            onClick={handleDownloadPng}
            disabled={downloadingPng}
            className="flex w-full items-center justify-between rounded-2xl border-2 border-[#00F0FF]/30 bg-[#16192B] p-4 text-left transition-all hover:border-[#00F0FF] hover:shadow-[0_0_15px_rgba(0,240,255,0.25)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00F0FF] to-[#FF2A85] text-slate-950 font-black shadow-sm">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <span className="font-orbitron text-sm font-black uppercase text-white block">
                  Holo-Poster PNG (High-Res)
                </span>
                <span className="text-[11px] text-slate-400">
                  Ready for live streams, Instagram, and Discord overlays
                </span>
              </div>
            </div>

            {downloadingPng ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#00F0FF]" />
            ) : (
              <Download className="h-5 w-5 text-slate-400" />
            )}
          </button>

          {/* CSV Spreadsheet */}
          <button
            onClick={handleDownloadCsv}
            disabled={downloadingCsv}
            className="flex w-full items-center justify-between rounded-2xl border-2 border-[#242945] bg-[#11131F] p-4 text-left transition-all hover:border-[#00FF66] hover:shadow-[0_0_15px_rgba(0,255,102,0.2)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00FF66]/20 border border-[#00FF66] text-[#00FF66]">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <span className="font-orbitron text-sm font-black uppercase text-white block">
                  CSV Telemetry Sheet (.csv)
                </span>
                <span className="text-[11px] text-slate-400">
                  Import into Excel, Google Sheets, or graphics systems
                </span>
              </div>
            </div>

            {downloadingCsv ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#00FF66]" />
            ) : (
              <Download className="h-5 w-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-2xl bg-[#16192B] px-5 py-2 text-xs font-bold uppercase text-slate-300 hover:text-white border border-[#242945]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
