import { ScoringRulesConfig } from "@/types/database";

export interface CalculateScoreInput {
  placement: number;
  kills: number;
  wins?: number;
  scoringRules: ScoringRulesConfig;
  bonusPoints?: number;
  penaltyPoints?: number;
}

export interface CalculatedScoreOutput {
  placementPoints: number;
  finishPoints: number;
  winBonus: number;
  bonusPoints: number;
  penaltyPoints: number;
  totalPoints: number;
  isWin: boolean;
}

/**
 * Pure scoring calculation engine.
 * Computes Placement Points + Finish/Kill Points + Win Bonus + Custom Bonuses - Custom Penalties.
 */
export function calculateMatchScore(input: CalculateScoreInput): CalculatedScoreOutput {
  const {
    placement = 0,
    kills = 0,
    wins,
    scoringRules,
    bonusPoints = 0,
    penaltyPoints = 0,
  } = input;

  const validPlacement = Math.max(0, Math.floor(Number(placement) || 0));
  const validKills = Math.max(0, Math.floor(Number(kills) || 0));
  const validBonus = Math.max(0, Number(bonusPoints) || 0);
  const validPenalty = Math.max(0, Number(penaltyPoints) || 0);

  // 1. Placement points lookup
  let placementPoints = 0;
  if (validPlacement > 0 && scoringRules.placement_rules) {
    const key = validPlacement.toString();
    if (key in scoringRules.placement_rules) {
      placementPoints = Number(scoringRules.placement_rules[key]) || 0;
    }
  }

  // 2. Finish / Elimination points
  const killMultiplier = Number(scoringRules.kill_points) || 0;
  const finishPoints = validKills * killMultiplier;

  // 3. Win calculation
  const isWin = wins !== undefined ? wins > 0 : validPlacement === 1;
  const winBonus = isWin ? Number(scoringRules.win_bonus) || 0 : 0;

  // 4. Total points
  const totalPoints = placementPoints + finishPoints + winBonus + validBonus - validPenalty;

  return {
    placementPoints,
    finishPoints,
    winBonus,
    bonusPoints: validBonus,
    penaltyPoints: validPenalty,
    totalPoints: Math.max(0, totalPoints), // Ensure no negative total
    isWin,
  };
}

/**
 * Validate match results for a set of teams in a single match.
 * Ensures no duplicate 1st/2nd placements (unless tie allowed), valid ranges, etc.
 */
export function validateMatchResults(
  results: Array<{ team_id: string; placement: number; kills: number }>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const placementMap = new Map<number, string[]>();

  for (const res of results) {
    if (res.placement < 1) {
      errors.push(`Placement must be at least 1.`);
    }
    if (res.kills < 0) {
      errors.push(`Kills cannot be negative.`);
    }
    if (res.placement > 0) {
      const existing = placementMap.get(res.placement) || [];
      existing.push(res.team_id);
      placementMap.set(res.placement, existing);
    }
  }

  // Check for duplicate placements
  for (const [place, teamIds] of placementMap.entries()) {
    if (teamIds.length > 1) {
      errors.push(`Duplicate placement #${place} assigned to ${teamIds.length} teams.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
