import { ScoringRulesConfig } from "@/types/database";

export const SCORING_PRESETS: Record<string, { name: string; description: string; rules: ScoringRulesConfig }> = {
  bgmi_official_10pt: {
    name: "BGMI Official (10-Point System)",
    description: "Official Krafton / BGIS 10-Point Scoring System (1st: 10pts, 2nd: 6pts, 3rd: 5pts, 1 pt/kill)",
    rules: {
      placement_rules: {
        "1": 10,
        "2": 6,
        "3": 5,
        "4": 4,
        "5": 3,
        "6": 2,
        "7": 1,
        "8": 1,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 0,
        "13": 0,
        "14": 0,
        "15": 0,
        "16": 0,
      },
      kill_points: 1,
      win_bonus: 0,
      tie_breaker_priority: ["total_points", "finish_points", "placement_points", "wins", "total_kills", "best_placement"],
    },
  },
  bgmi_classic_15pt: {
    name: "BGMI Classic (15-Point System)",
    description: "Classic PMCO 15-Point Scoring System (1st: 15pts, 2nd: 12pts, 3rd: 10pts... 1 pt/kill)",
    rules: {
      placement_rules: {
        "1": 15,
        "2": 12,
        "3": 10,
        "4": 8,
        "5": 6,
        "6": 4,
        "7": 2,
        "8": 1,
        "9": 1,
        "10": 1,
        "11": 1,
        "12": 1,
        "13": 0,
        "14": 0,
        "15": 0,
        "16": 0,
      },
      kill_points: 1,
      win_bonus: 0,
      tie_breaker_priority: ["total_points", "finish_points", "placement_points", "wins", "total_kills"],
    },
  },
  free_fire_official: {
    name: "Free Fire (FFWS Official)",
    description: "Official Free Fire World Series Scoring (1st: 12pts, 2nd: 9pts, 3rd: 8pts... 1 pt/elim)",
    rules: {
      placement_rules: {
        "1": 12,
        "2": 9,
        "3": 8,
        "4": 7,
        "5": 6,
        "6": 5,
        "7": 4,
        "8": 3,
        "9": 2,
        "10": 1,
        "11": 0,
        "12": 0,
      },
      kill_points: 1,
      win_bonus: 0,
      tie_breaker_priority: ["total_points", "wins", "finish_points", "placement_points"],
    },
  },
  valorant_tourney: {
    name: "Valorant Match & Round Points",
    description: "Points per map win, round differential, and match victory bonus",
    rules: {
      placement_rules: {
        "1": 3, // Match Win: 3 pts
        "2": 0, // Match Loss: 0 pts
      },
      kill_points: 0,
      win_bonus: 2, // Bonus for 2-0 sweep
      tie_breaker_priority: ["total_points", "wins", "finish_points"],
    },
  },
  cod_mobile_br: {
    name: "Call of Duty: Mobile Battle Royale",
    description: "CODM BR Tournament System (1st: 15pts, 2nd: 10pts, 3rd: 7pts, 1 pt/kill)",
    rules: {
      placement_rules: {
        "1": 15,
        "2": 10,
        "3": 7,
        "4": 5,
        "5": 4,
        "6": 3,
        "7": 2,
        "8": 1,
      },
      kill_points: 1,
      win_bonus: 0,
      tie_breaker_priority: ["total_points", "finish_points", "placement_points", "wins"],
    },
  },
  custom_customizable: {
    name: "Custom Game System",
    description: "Fully customizable placement points and kill multiplier",
    rules: {
      placement_rules: {
        "1": 10,
        "2": 6,
        "3": 4,
        "4": 2,
        "5": 1,
      },
      kill_points: 1,
      win_bonus: 0,
      tie_breaker_priority: ["total_points", "finish_points", "placement_points", "wins", "total_kills"],
    },
  },
};
