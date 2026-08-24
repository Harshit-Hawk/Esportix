import { calculateMatchScore } from "./engine";
import { calculateLeaderboard } from "./leaderboard";
import { SCORING_PRESETS } from "./presets";
import { Team, Match } from "@/types/database";

function runTests() {
  console.log("=== RUNNING ESPORTIX SCORING ENGINE TESTS ===");

  // Test 1: BGMI 10-point rule calculation for 1st place with 8 kills
  const bgmiRules = SCORING_PRESETS.bgmi_official_10pt.rules;
  const score1 = calculateMatchScore({
    placement: 1,
    kills: 8,
    scoringRules: bgmiRules,
  });

  console.log("Test 1: BGMI 1st place with 8 kills ->", score1);
  if (score1.placementPoints !== 10 || score1.finishPoints !== 8 || score1.totalPoints !== 18) {
    throw new Error(`Test 1 Failed: Expected 18 points, got ${score1.totalPoints}`);
  }
  console.log("✓ Test 1 Passed: 10 + 8 = 18 pts");

  // Test 2: BGMI 2nd place with 6 kills
  const score2 = calculateMatchScore({
    placement: 2,
    kills: 6,
    scoringRules: bgmiRules,
  });
  console.log("Test 2: BGMI 2nd place with 6 kills ->", score2);
  if (score2.placementPoints !== 6 || score2.finishPoints !== 6 || score2.totalPoints !== 12) {
    throw new Error(`Test 2 Failed: Expected 12 points, got ${score2.totalPoints}`);
  }
  console.log("✓ Test 2 Passed: 6 + 6 = 12 pts");

  // Test 3: 9th place with 3 kills (0 placement points + 3 kills = 3 total)
  const score3 = calculateMatchScore({
    placement: 9,
    kills: 3,
    scoringRules: bgmiRules,
  });
  if (score3.placementPoints !== 0 || score3.finishPoints !== 3 || score3.totalPoints !== 3) {
    throw new Error(`Test 3 Failed: Expected 3 points, got ${score3.totalPoints}`);
  }
  console.log("✓ Test 3 Passed: 0 + 3 = 3 pts");

  // Test 4: Leaderboard tie-breaking
  const mockTeams: Team[] = [
    { id: "t1", tournament_id: "t", name: "Team Alpha", short_name: "ALP", seed: 1, group_name: "A", logo_url: null, created_at: "", updated_at: "" },
    { id: "t2", tournament_id: "t", name: "Team Bravo", short_name: "BRV", seed: 2, group_name: "A", logo_url: null, created_at: "", updated_at: "" },
  ];

  const mockMatches: Match[] = [
    {
      id: "m1",
      tournament_id: "t",
      match_number: 1,
      name: "Match 1",
      map_name: "Erangel",
      round_name: "Finals",
      status: "COMPLETED",
      is_locked: true,
      scheduled_at: null,
      started_at: null,
      completed_at: null,
      created_at: "",
      updated_at: "",
      match_results: [
        // Team Alpha: 1st place (10 place pts) + 2 kills = 12 pts total (1 win, 2 finish pts)
        { id: "r1", match_id: "m1", team_id: "t1", placement: 1, kills: 2, wins: 1, placement_points: 10, finish_points: 2, bonus_points: 0, penalty_points: 0, total_points: 12, notes: null, created_at: "", updated_at: "" },
        // Team Bravo: 2nd place (6 place pts) + 6 kills = 12 pts total (0 wins, 6 finish pts)
        { id: "r2", match_id: "m1", team_id: "t2", placement: 2, kills: 6, wins: 0, placement_points: 6, finish_points: 6, bonus_points: 0, penalty_points: 0, total_points: 12, notes: null, created_at: "", updated_at: "" },
      ],
    },
  ];

  const leaderboard = calculateLeaderboard({
    teams: mockTeams,
    matches: mockMatches,
    scoringRules: bgmiRules,
  });

  console.log("Leaderboard Tie-Break Result:", leaderboard.map(r => ({ rank: r.rank, team: r.team.name, total: r.totalPoints, finish: r.finishPoints, wins: r.wins })));
  if (leaderboard[0].team.id !== "t2" || leaderboard[1].team.id !== "t1") {
    throw new Error(`Tie-breaker failed: Expected Team Bravo (higher finish points) to rank #1`);
  }
  console.log("✓ Test 4 Passed: Configurable tie-breaking successfully broke tie by finish points!");

  console.log("🎉 ALL SCORING ENGINE TESTS PASSED WITH 100% PRECISION!");
}

runTests();
