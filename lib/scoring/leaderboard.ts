import {
  Match,
  MatchResult,
  ScoringRulesConfig,
  Team,
  TieBreakerCriterion,
} from "@/types/database";

export interface LeaderboardRow {
  rank: number;
  previousRank?: number;
  rankDelta?: number; // >0 means moved up, <0 means moved down, 0 means same
  team: Team;
  matchesPlayed: number;
  wins: number; // WWCD / Booyah / 1st place
  placementPoints: number;
  finishPoints: number;
  totalKills: number;
  bonusPoints: number;
  penaltyPoints: number;
  totalPoints: number;
  bestPlacement: number;
  recentPlacements: number[];
}

export interface LeaderboardOptions {
  teams: Team[];
  matches: Match[];
  scoringRules: ScoringRulesConfig;
  groupFilter?: string;
  uptoMatchNumber?: number;
}

/**
 * Compare two teams based on configurable tie-breaker rules
 */
function compareTeams(
  a: LeaderboardRow,
  b: LeaderboardRow,
  priority: TieBreakerCriterion[]
): number {
  for (const criterion of priority) {
    switch (criterion) {
      case "total_points":
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        break;

      case "finish_points":
        if (b.finishPoints !== a.finishPoints) {
          return b.finishPoints - a.finishPoints;
        }
        break;

      case "placement_points":
        if (b.placementPoints !== a.placementPoints) {
          return b.placementPoints - a.placementPoints;
        }
        break;

      case "wins":
        if (b.wins !== a.wins) {
          return b.wins - a.wins;
        }
        break;

      case "total_kills":
        if (b.totalKills !== a.totalKills) {
          return b.totalKills - a.totalKills;
        }
        break;

      case "best_placement":
        // Lower number is better (e.g. 1st is better than 2nd)
        if (a.bestPlacement !== b.bestPlacement) {
          return a.bestPlacement - b.bestPlacement;
        }
        break;

      case "seed":
        if (a.team.seed !== b.team.seed) {
          return a.team.seed - b.team.seed;
        }
        break;
    }
  }

  // Fallback tie-breaker: alphabetical by team name
  return a.team.name.localeCompare(b.team.name);
}

/**
 * Calculates full tournament standings and rankings dynamically.
 */
export function calculateLeaderboard(options: LeaderboardOptions): LeaderboardRow[] {
  const {
    teams,
    matches,
    scoringRules,
    groupFilter,
    uptoMatchNumber,
  } = options;

  // Filter teams by group if specified
  const eligibleTeams = groupFilter && groupFilter !== "All" && groupFilter !== "Overall"
    ? teams.filter((t) => t.group_name === groupFilter)
    : teams;

  // Filter matches: only completed or live matches, and optionally up to a specific match number
  const validMatches = matches
    .filter((m) => m.status === "COMPLETED" || m.status === "LIVE")
    .filter((m) => (uptoMatchNumber ? m.match_number <= uptoMatchNumber : true))
    .sort((a, b) => a.match_number - b.match_number);

  // Map to accumulate stats per team
  const statsMap = new Map<string, LeaderboardRow>();

  for (const team of eligibleTeams) {
    statsMap.set(team.id, {
      rank: 0,
      team,
      matchesPlayed: 0,
      wins: 0,
      placementPoints: 0,
      finishPoints: 0,
      totalKills: 0,
      bonusPoints: 0,
      penaltyPoints: 0,
      totalPoints: 0,
      bestPlacement: 999,
      recentPlacements: [],
    });
  }

  // Process all match results
  for (const match of validMatches) {
    if (!match.match_results) continue;

    for (const result of match.match_results) {
      const row = statsMap.get(result.team_id);
      if (!row) continue;

      if (result.placement > 0 || result.kills > 0 || result.total_points > 0) {
        row.matchesPlayed += 1;
      }

      if (result.wins > 0 || result.placement === 1) {
        row.wins += 1;
      }

      row.placementPoints += Number(result.placement_points) || 0;
      row.finishPoints += Number(result.finish_points) || 0;
      row.totalKills += Number(result.kills) || 0;
      row.bonusPoints += Number(result.bonus_points) || 0;
      row.penaltyPoints += Number(result.penalty_points) || 0;
      row.totalPoints += Number(result.total_points) || 0;

      if (result.placement > 0 && result.placement < row.bestPlacement) {
        row.bestPlacement = result.placement;
      }

      if (result.placement > 0) {
        row.recentPlacements.push(result.placement);
      }
    }
  }

  // Adjust default bestPlacement for teams that haven't played
  for (const row of statsMap.values()) {
    if (row.bestPlacement === 999) {
      row.bestPlacement = 0;
    }
  }

  const defaultPriority: TieBreakerCriterion[] = [
    "total_points",
    "finish_points",
    "placement_points",
    "wins",
    "total_kills",
    "best_placement",
  ];

  const tieBreakers = scoringRules.tie_breaker_priority?.length
    ? scoringRules.tie_breaker_priority
    : defaultPriority;

  // Convert to array and sort
  const sortedRows = Array.from(statsMap.values()).sort((a, b) =>
    compareTeams(a, b, tieBreakers)
  );

  // Assign ranks
  sortedRows.forEach((row, idx) => {
    row.rank = idx + 1;
  });

  // Calculate rank delta relative to previous match if available
  if (validMatches.length > 1 && !uptoMatchNumber) {
    const prevMatchesCount = validMatches.length - 1;
    const prevLeaderboard = calculateLeaderboard({
      teams,
      matches,
      scoringRules,
      groupFilter,
      uptoMatchNumber: validMatches[prevMatchesCount - 1].match_number,
    });

    const prevRankMap = new Map<string, number>();
    prevLeaderboard.forEach((r) => prevRankMap.set(r.team.id, r.rank));

    sortedRows.forEach((row) => {
      const prevRank = prevRankMap.get(row.team.id);
      if (prevRank !== undefined) {
        row.previousRank = prevRank;
        row.rankDelta = prevRank - row.rank; // Positive means climbed up (e.g. rank 5 -> rank 2 => +3)
      }
    });
  }

  return sortedRows;
}
