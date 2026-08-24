export const GAME_MAPS: Record<string, string[]> = {
  bgmi: [
    "Erangel",
    "Miramar",
    "Sanhok",
    "Vikendi",
    "Livik",
    "Nusa",
    "Karakin",
  ],
  "free-fire": [
    "Bermuda",
    "Purgatory",
    "Kalahari",
    "Alpine",
    "NeXTerra",
    "Bermuda Remastered",
  ],
  valorant: [
    "Ascent",
    "Bind",
    "Haven",
    "Split",
    "Lotus",
    "Sunset",
    "Abyss",
    "Icebox",
    "Breeze",
    "Pearl",
    "Fracture",
  ],
  "cod-mobile": [
    "Isolated",
    "Blackout",
    "Alcatraz",
    "Crash",
    "Firing Range",
    "Standoff",
    "Raid",
  ],
  custom: [
    "Arena 1",
    "Arena 2",
    "Custom Map",
  ],
};

export function getMapsForGame(gameSlug?: string | null): string[] {
  if (!gameSlug) return GAME_MAPS.bgmi;
  const normalized = gameSlug.toLowerCase().trim();
  if (normalized.includes("bgmi") || normalized.includes("pubg")) return GAME_MAPS.bgmi;
  if (normalized.includes("free-fire") || normalized.includes("freefire")) return GAME_MAPS["free-fire"];
  if (normalized.includes("valorant")) return GAME_MAPS.valorant;
  if (normalized.includes("cod") || normalized.includes("call-of-duty")) return GAME_MAPS["cod-mobile"];
  return GAME_MAPS.custom;
}
