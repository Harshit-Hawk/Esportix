"use client";

import { Gamepad2, Trophy, Crosshair, Flame, Shield, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameLogoProps {
  slug?: string | null;
  name?: string | null;
  logoUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function GameLogo({
  slug,
  name,
  logoUrl,
  className,
  size = "md",
}: GameLogoProps) {
  const normalizedSlug = (slug || "").toLowerCase();
  const normalizedName = (name || "").toLowerCase();

  const sizeClasses = {
    sm: "h-8 w-8 rounded-lg text-xs",
    md: "h-11 w-11 rounded-xl text-sm",
    lg: "h-14 w-14 rounded-xl text-base",
  };

  // If there is a valid custom logoUrl (not generic placeholder) and it's an image, render it
  if (logoUrl && !logoUrl.includes("photo-1542751371")) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border border-slate-200 bg-white flex items-center justify-center shadow-xs",
          sizeClasses[size],
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={name || "Game Logo"}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Authentic game visual badge based on slug/name
  if (normalizedSlug.includes("bgmi") || normalizedName.includes("battlegrounds")) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border border-amber-300 bg-gradient-to-br from-amber-500 to-amber-700 text-white flex flex-col items-center justify-center font-bold tracking-tighter shadow-xs select-none",
          sizeClasses[size],
          className
        )}
        title="Battlegrounds Mobile India"
      >
        <span className="font-extrabold text-[11px] leading-none tracking-tight">BGMI</span>
        <span className="text-[7px] font-semibold text-amber-200 tracking-widest uppercase">INDIA</span>
      </div>
    );
  }

  if (normalizedSlug.includes("free-fire") || normalizedName.includes("free fire")) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border border-orange-300 bg-gradient-to-br from-orange-500 to-red-600 text-white flex flex-col items-center justify-center font-bold shadow-xs select-none",
          sizeClasses[size],
          className
        )}
        title="Free Fire Max"
      >
        <Flame className="h-4 w-4 text-yellow-300 -mb-0.5" />
        <span className="font-black text-[9px] leading-none tracking-tight">FF MAX</span>
      </div>
    );
  }

  if (normalizedSlug.includes("valorant") || normalizedName.includes("valorant")) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border border-rose-300 bg-gradient-to-br from-rose-600 to-slate-900 text-white flex flex-col items-center justify-center font-bold shadow-xs select-none",
          sizeClasses[size],
          className
        )}
        title="Valorant"
      >
        <span className="font-black text-xs leading-none tracking-tight">VAL</span>
        <span className="text-[7px] text-rose-200 font-semibold uppercase">5V5</span>
      </div>
    );
  }

  if (
    normalizedSlug.includes("cod") ||
    normalizedSlug.includes("call-of-duty") ||
    normalizedName.includes("call of duty")
  ) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-950 text-white flex flex-col items-center justify-center font-bold shadow-xs select-none",
          sizeClasses[size],
          className
        )}
        title="Call of Duty Mobile"
      >
        <Crosshair className="h-3.5 w-3.5 text-amber-400 -mb-0.5" />
        <span className="font-bold text-[8px] leading-none tracking-tight text-slate-200">CODM</span>
      </div>
    );
  }

  // Fallback Custom Game Badge
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden border border-slate-200 bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs select-none",
        sizeClasses[size],
        className
      )}
      title={name || "Custom Esports"}
    >
      <Gamepad2 className="h-4 w-4 text-slate-600" />
    </div>
  );
}
