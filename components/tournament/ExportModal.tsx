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
        "Tag",
        "Seed",
        "Group",
        "Matches Played",
        "WWCD / Wins",
        "Placement Points",
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

      setSuccessMsg("CSV spreadsheet downloaded!");
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
        backgroundColor: "#FFFFFF",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${tournament.slug}-standings-poster.png`;
      link.click();

      setSuccessMsg("PNG Scorecard Poster downloaded in High Res!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("PNG export error:", err);
      alert("Failed to export PNG image poster");
    } finally {
      setDownloadingPng(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-black uppercase text-slate-900">
                Export & Share Scorecard
              </h3>
              <p className="text-xs text-slate-500">
                Download standings for broadcast, social media, or sheets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Export Options */}
        <div className="space-y-3">
          {/* PNG Poster */}
          <button
            onClick={handleDownloadPng}
            disabled={downloadingPng}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:border-blue-400 hover:bg-blue-50/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <span className="font-display text-sm font-black uppercase text-slate-900 block">
                  PNG Social Poster (High-Res)
                </span>
                <span className="text-[11px] text-slate-500">
                  Ready for Instagram, Discord, and Live Stream overlays
                </span>
              </div>
            </div>

            {downloadingPng ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            ) : (
              <Download className="h-5 w-5 text-slate-400" />
            )}
          </button>

          {/* CSV Spreadsheet */}
          <button
            onClick={handleDownloadCsv}
            disabled={downloadingCsv}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:border-emerald-400 hover:bg-emerald-50/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <span className="font-display text-sm font-black uppercase text-slate-900 block">
                  CSV Spreadsheet (.csv)
                </span>
                <span className="text-[11px] text-slate-500">
                  Import into Excel, Google Sheets, or custom graphics systems
                </span>
              </div>
            </div>

            {downloadingCsv ? (
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            ) : (
              <Download className="h-5 w-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold uppercase text-slate-600 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
