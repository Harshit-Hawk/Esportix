import { Game } from "@/types/database";
import { SCORING_PRESETS } from "@/lib/scoring/presets";

export const DEFAULT_GAMES: Game[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Battlegrounds Mobile India (BGMI)",
    slug: "bgmi",
    logo_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=256&auto=format&fit=crop&q=80",
    description: "Tactical Battle Royale mobile esports with placement & finish points.",
    default_scoring_rules: SCORING_PRESETS.bgmi_official_10pt.rules,
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Free Fire Max",
    slug: "free-fire",
    logo_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=256&auto=format&fit=crop&q=80",
    description: "Fast-paced Battle Royale featuring Booyah bonuses and elimination multipliers.",
    default_scoring_rules: SCORING_PRESETS.free_fire_official.rules,
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Valorant",
    slug: "valorant",
    logo_url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=256&auto=format&fit=crop&q=80",
    description: "5v5 Character-based tactical FPS shooter with round differential scoring.",
    default_scoring_rules: SCORING_PRESETS.valorant_tourney.rules,
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Call of Duty: Mobile",
    slug: "cod-mobile",
    logo_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=256&auto=format&fit=crop&q=80",
    description: "Competitive Battle Royale and Multiplayer warfare.",
    default_scoring_rules: SCORING_PRESETS.cod_mobile_br.rules,
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Custom Esports Title",
    slug: "custom",
    logo_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=256&auto=format&fit=crop&q=80",
    description: "Configure your own game rules, point systems, and tie-breakers.",
    default_scoring_rules: SCORING_PRESETS.custom_customizable.rules,
    created_at: new Date().toISOString(),
  },
];
