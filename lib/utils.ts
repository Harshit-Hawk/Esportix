import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "0";
  return num.toString();
}

export function getOrdinalSuffix(i: number): string {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
}

export function getRankBadgeClass(rank: number): {
  bg: string;
  text: string;
  border: string;
  glow?: string;
  label: string;
} {
  switch (rank) {
    case 1:
      return {
        bg: "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600",
        text: "text-zinc-950 font-black",
        border: "border-yellow-300",
        glow: "shadow-[0_0_15px_rgba(255,183,3,0.6)]",
        label: "👑 CHAMPION",
      };
    case 2:
      return {
        bg: "bg-gradient-to-r from-slate-300 via-gray-200 to-slate-400",
        text: "text-zinc-950 font-black",
        border: "border-slate-300",
        glow: "shadow-[0_0_10px_rgba(203,213,225,0.4)]",
        label: "2ND PLACE",
      };
    case 3:
      return {
        bg: "bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800",
        text: "text-white font-black",
        border: "border-amber-600",
        glow: "shadow-[0_0_10px_rgba(180,83,9,0.4)]",
        label: "3RD PLACE",
      };
    default:
      return {
        bg: "bg-esports-navy-light/60",
        text: "text-esports-cream font-bold",
        border: "border-esports-navy-border",
        label: `#${rank}`,
      };
  }
}
