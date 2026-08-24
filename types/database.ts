export type UserRole = "SUPER_ADMIN" | "TOURNAMENT_ADMIN" | "VIEWER";
export type TournamentStatus = "DRAFT" | "UPCOMING" | "LIVE" | "COMPLETED" | "ARCHIVED";
export type TournamentVisibility = "PUBLIC" | "UNLISTED" | "PRIVATE";
export type MatchStatus = "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";

export interface Game {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  default_scoring_rules: ScoringRulesConfig;
  created_at: string;
}

export interface TournamentUser {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface TournamentAdmin {
  id: string;
  tournament_id: string;
  user_id: string;
  role: string;
  created_at: string;
  user?: TournamentUser;
}

export interface PlacementRules {
  [placement: string]: number; // e.g. "1": 10, "2": 6, "3": 5
}

export interface BonusRule {
  name: string;
  points: number;
  condition?: string;
}

export interface PenaltyRule {
  name: string;
  deduction: number;
  condition?: string;
}

export type TieBreakerCriterion =
  | "total_points"
  | "finish_points"
  | "placement_points"
  | "wins"
  | "total_kills"
  | "best_placement"
  | "seed";

export interface ScoringRulesConfig {
  placement_rules: PlacementRules;
  kill_points: number;
  win_bonus: number;
  bonus_rules?: Record<string, number>;
  penalty_rules?: Record<string, number>;
  tie_breaker_priority: TieBreakerCriterion[];
}

export interface ScoringRuleRecord {
  id: string;
  tournament_id: string;
  placement_rules: PlacementRules;
  kill_points: number;
  win_bonus: number;
  bonus_rules: Record<string, number>;
  penalty_rules: Record<string, number>;
  tie_breaker_priority: TieBreakerCriterion[];
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  game_id: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: TournamentStatus;
  visibility: TournamentVisibility;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  custom_colors: {
    primary: string;
    accent: string;
  };
  created_at: string;
  updated_at: string;
  game?: Game;
  scoring_rules?: ScoringRuleRecord;
  teams?: Team[];
  matches?: Match[];
}

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  short_name: string;
  logo_url: string | null;
  seed: number;
  group_name: string;
  created_at: string;
  updated_at: string;
  players?: Player[];
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  player_identifier: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  match_number: number;
  name: string;
  map_name: string | null;
  round_name: string;
  status: MatchStatus;
  is_locked: boolean;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  match_results?: MatchResult[];
}

export interface MatchResult {
  id: string;
  match_id: string;
  team_id: string;
  placement: number;
  kills: number;
  wins: number;
  placement_points: number;
  finish_points: number;
  bonus_points: number;
  penalty_points: number;
  total_points: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  team?: Team;
}

export interface TournamentAuditLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  tournament_id: string;
  match_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  created_at: string;
}
