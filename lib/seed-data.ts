import { calculateMatchScore } from "./scoring/engine";
import { SCORING_PRESETS } from "./scoring/presets";
import { SupabaseClient } from "@supabase/supabase-js";

export const SEED_TEAMS = [
  {
    name: "GodLike Esports",
    short_name: "GODL",
    seed: 1,
    group_name: "Group A",
    logo_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Jonathan Amaral", player_identifier: "GODLJonathan" },
      { name: "Suraj Majumdar", player_identifier: "GODLNeyoo" },
      { name: "Arjun Mandhata", player_identifier: "GODLShadow" },
      { name: "Kavish Chauhan", player_identifier: "GODLPunkk" },
    ],
  },
  {
    name: "Team Soul",
    short_name: "SOUL",
    seed: 2,
    group_name: "Group A",
    logo_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Manya Sharma", player_identifier: "SOULManya" },
      { name: "Rudra B", player_identifier: "SOULSpower" },
      { name: "Nakul Sharma", player_identifier: "SOULNakul" },
      { name: "Mohammad Rony", player_identifier: "SOULRony" },
    ],
  },
  {
    name: "Team XSpark",
    short_name: "TX",
    seed: 3,
    group_name: "Group B",
    logo_url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Shubham Sahoo", player_identifier: "TXNinjaJOD" },
      { name: "Sarang Deka", player_identifier: "TXSarang" },
      { name: "Tanmay Singh", player_identifier: "TXScout" },
      { name: "Harsh Paudwal", player_identifier: "TXSprayGod" },
    ],
  },
  {
    name: "Blind Esports",
    short_name: "BLND",
    seed: 4,
    group_name: "Group B",
    logo_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Jokerr Gaming", player_identifier: "BLNDJoker" },
      { name: "SkippZz", player_identifier: "BLNDSkipp" },
      { name: "Aladdin OP", player_identifier: "BLNDAladdin" },
      { name: "Darklord", player_identifier: "BLNDDark" },
    ],
  },
  {
    name: "Entity Gaming",
    short_name: "ENT",
    seed: 5,
    group_name: "Group A",
    logo_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Saumraj", player_identifier: "ENTSaumraj" },
      { name: "Gamlaboy", player_identifier: "ENTGamla" },
      { name: "Troghn", player_identifier: "ENTTroghn" },
      { name: "Secret", player_identifier: "ENTSecret" },
    ],
  },
  {
    name: "Orangutan Gaming",
    short_name: "OG",
    seed: 6,
    group_name: "Group B",
    logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "WizzGOD", player_identifier: "OGWizz" },
      { name: "AKop", player_identifier: "OGAKop" },
      { name: "Drigger", player_identifier: "OGDrigger" },
      { name: "Attanki", player_identifier: "OGAttanki" },
    ],
  },
  {
    name: "Revenant Esports",
    short_name: "RNT",
    seed: 7,
    group_name: "Group A",
    logo_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Sensei", player_identifier: "RNTSensei" },
      { name: "MJ", player_identifier: "RNTMJ" },
      { name: "Fierce", player_identifier: "RNTFierce" },
      { name: "Aquanox", player_identifier: "RNTAquanox" },
    ],
  },
  {
    name: "Carnival Gaming",
    short_name: "CG",
    seed: 8,
    group_name: "Group B",
    logo_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Omega", player_identifier: "CGOmega" },
      { name: "Goblin", player_identifier: "CGGoblin" },
      { name: "Akshat", player_identifier: "CGAkshat" },
      { name: "Hector", player_identifier: "CGHector" },
    ],
  },
  {
    name: "Global Esports",
    short_name: "GE",
    seed: 9,
    group_name: "Group A",
    logo_url: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Mavi", player_identifier: "GEMavi" },
      { name: "Beast", player_identifier: "GEBeast" },
      { name: "Ninjaboy", player_identifier: "GENinja" },
      { name: "Slug", player_identifier: "GESlug" },
    ],
  },
  {
    name: "Team 8Bit",
    short_name: "8BIT",
    seed: 10,
    group_name: "Group B",
    logo_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Juicy", player_identifier: "8BITJuicy" },
      { name: "Mighty", player_identifier: "8BITMighty" },
      { name: "Mac", player_identifier: "8BITMac" },
      { name: "Beast", player_identifier: "8BITBeast" },
    ],
  },
  {
    name: "Medal Esports",
    short_name: "MEDL",
    seed: 11,
    group_name: "Group A",
    logo_url: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Paradox", player_identifier: "MEDLParadox" },
      { name: "Kyoya", player_identifier: "MEDLKyoya" },
      { name: "Topdawg", player_identifier: "MEDLTopdawg" },
      { name: "Infinity", player_identifier: "MEDLInfinity" },
    ],
  },
  {
    name: "Gladiators Esports",
    short_name: "GLAD",
    seed: 12,
    group_name: "Group B",
    logo_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Destro", player_identifier: "GLADDestro" },
      { name: "Justin", player_identifier: "GLADJustin" },
      { name: "DeltaPG", player_identifier: "GLADDelta" },
      { name: "Shogun", player_identifier: "GLADShogun" },
    ],
  },
  {
    name: "Hydra Official",
    short_name: "HYD",
    seed: 13,
    group_name: "Group A",
    logo_url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Dynamo", player_identifier: "HYDDynamo" },
      { name: "Starboi", player_identifier: "HYDStarboi" },
      { name: "Sparsha", player_identifier: "HYDSparsha" },
      { name: "Dupe", player_identifier: "HYDDupe" },
    ],
  },
  {
    name: "Reckoning Esports",
    short_name: "RCK",
    seed: 14,
    group_name: "Group B",
    logo_url: "https://images.unsplash.com/photo-1552824722-ddab1374e622?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Viper", player_identifier: "RCKViper" },
      { name: "Aaru", player_identifier: "RCKAaru" },
      { name: "Hunter", player_identifier: "RCKHunter" },
      { name: "Pulse", player_identifier: "RCKPulse" },
    ],
  },
  {
    name: "Gujarat Tigers",
    short_name: "GT",
    seed: 15,
    group_name: "Group A",
    logo_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Shadow", player_identifier: "GTShadow" },
      { name: "ClutchGod", player_identifier: "GTClutchGod" },
      { name: "Goku", player_identifier: "GTGoku" },
      { name: "Prince", player_identifier: "GTPrince" },
    ],
  },
  {
    name: "Big Brother Esports",
    short_name: "BB",
    seed: 16,
    group_name: "Group B",
    logo_url: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=128&auto=format&fit=crop&q=80",
    players: [
      { name: "Uzair", player_identifier: "BBUzair" },
      { name: "Saif", player_identifier: "BBSaif" },
      { name: "NadeGod", player_identifier: "BBNadeGod" },
      { name: "Kash", player_identifier: "BBKash" },
    ],
  },
];

export const SEED_MAPS = [
  "Erangel",
  "Miramar",
  "Sanhok",
  "Vikendi",
  "Erangel",
  "Miramar",
  "Erangel",
  "Sanhok",
  "Miramar",
  "Vikendi",
  "Erangel",
  "Miramar",
  "Erangel",
  "Sanhok",
  "Miramar",
  "Vikendi",
  "Erangel",
  "Erangel",
];

export async function seedDatabase(supabase: SupabaseClient) {
  // 1. Seed Games
  const gamesList = [
    {
      name: "Battlegrounds Mobile India (BGMI)",
      slug: "bgmi",
      logo_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=256&auto=format&fit=crop&q=80",
      description: "Tactical Battle Royale mobile esports with placement & finish points.",
      default_scoring_rules: SCORING_PRESETS.bgmi_official_10pt.rules,
    },
    {
      name: "Free Fire Max",
      slug: "free-fire",
      logo_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=256&auto=format&fit=crop&q=80",
      description: "Fast-paced Battle Royale featuring Booyah bonuses and elimination multipliers.",
      default_scoring_rules: SCORING_PRESETS.free_fire_official.rules,
    },
    {
      name: "Valorant",
      slug: "valorant",
      logo_url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=256&auto=format&fit=crop&q=80",
      description: "5v5 Character-based tactical FPS shooter with round differential scoring.",
      default_scoring_rules: SCORING_PRESETS.valorant_tourney.rules,
    },
    {
      name: "Call of Duty: Mobile",
      slug: "cod-mobile",
      logo_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=256&auto=format&fit=crop&q=80",
      description: "Competitive Battle Royale and Multiplayer warfare.",
      default_scoring_rules: SCORING_PRESETS.cod_mobile_br.rules,
    },
    {
      name: "Custom Esports Title",
      slug: "custom",
      logo_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=256&auto=format&fit=crop&q=80",
      description: "Configure your own game rules, point systems, and tie-breakers.",
      default_scoring_rules: SCORING_PRESETS.custom_customizable.rules,
    },
  ];

  for (const game of gamesList) {
    await supabase.from("games").upsert(game, { onConflict: "slug" });
  }

  const { data: bgmiGame } = await supabase.from("games").select("id").eq("slug", "bgmi").single();
  if (!bgmiGame) throw new Error("Failed to retrieve BGMI game record");

  // 2. Seed Demo Admin Users
  const adminUser = {
    name: "Tournament Administrator",
    email: "admin@esportix.gg",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80",
    role: "SUPER_ADMIN",
  };
  const { data: createdUser } = await supabase
    .from("tournament_users")
    .upsert(adminUser, { onConflict: "email" })
    .select()
    .single();

  // 3. Seed Main Tournament: BGMI Campus Showdown 2026
  const tournamentData = {
    name: "BGMI Campus Showdown 2026",
    slug: "bgmi-campus-showdown-2026",
    game_id: bgmiGame.id,
    description: "The premier national collegiate esports championship featuring 16 top collegiate teams battling across 18 intense matches for the grand trophy.",
    logo_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=256&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
    status: "LIVE",
    visibility: "PUBLIC",
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: createdUser?.id,
    custom_colors: {
      primary: "#101C34",
      accent: "#E96D2F",
    },
  };

  const { data: tournament, error: tErr } = await supabase
    .from("tournaments")
    .upsert(tournamentData, { onConflict: "slug" })
    .select()
    .single();

  if (tErr || !tournament) throw new Error(`Tournament upsert failed: ${tErr?.message}`);

  // 4. Seed Scoring Rules for this tournament
  const scoringRuleData = {
    tournament_id: tournament.id,
    placement_rules: SCORING_PRESETS.bgmi_official_10pt.rules.placement_rules,
    kill_points: 1,
    win_bonus: 0,
    bonus_rules: {},
    penalty_rules: {},
    tie_breaker_priority: [
      "total_points",
      "finish_points",
      "placement_points",
      "wins",
      "total_kills",
      "best_placement",
    ],
  };

  await supabase.from("scoring_rules").upsert(scoringRuleData, { onConflict: "tournament_id" });

  // 5. Seed Teams & Players
  const teamIdMap: Record<string, string> = {};

  for (const teamItem of SEED_TEAMS) {
    const { data: teamRec, error: tmErr } = await supabase
      .from("teams")
      .upsert(
        {
          tournament_id: tournament.id,
          name: teamItem.name,
          short_name: teamItem.short_name,
          logo_url: teamItem.logo_url,
          seed: teamItem.seed,
          group_name: teamItem.group_name,
        },
        { onConflict: "tournament_id, name" }
      )
      .select()
      .single();

    if (tmErr) {
      // Fallback query if conflict format differs
      const { data: existingTeam } = await supabase
        .from("teams")
        .select("id")
        .eq("tournament_id", tournament.id)
        .eq("name", teamItem.name)
        .single();
      if (existingTeam) {
        teamIdMap[teamItem.short_name] = existingTeam.id;
      }
    } else if (teamRec) {
      teamIdMap[teamItem.short_name] = teamRec.id;

      // Seed players
      for (const p of teamItem.players) {
        await supabase.from("players").insert({
          team_id: teamRec.id,
          name: p.name,
          player_identifier: p.player_identifier,
        });
      }
    }
  }

  // 6. Seed 18 Matches & Realistic Results
  const teamShortNames = Object.keys(teamIdMap);
  const scoringRulesConfig = SCORING_PRESETS.bgmi_official_10pt.rules;

  // Preset placements & kill weights for realistic competitive variance
  const teamSkillWeights: Record<string, number> = {
    GODL: 1.45,
    SOUL: 1.40,
    TX: 1.35,
    BLND: 1.25,
    ENT: 1.20,
    OG: 1.15,
    RNT: 1.10,
    CG: 1.05,
    GE: 1.00,
    "8BIT": 0.95,
    MEDL: 0.90,
    GLAD: 0.85,
    HYD: 0.80,
    RCK: 0.75,
    GT: 0.70,
    BB: 0.65,
  };

  // Seed 18 matches
  for (let mNum = 1; mNum <= 18; mNum++) {
    const isCompleted = mNum <= 17;
    const isLive = mNum === 18;
    const status = isCompleted ? "COMPLETED" : isLive ? "LIVE" : "SCHEDULED";
    const mapName = SEED_MAPS[mNum - 1] || "Erangel";

    const { data: matchRec, error: mErr } = await supabase
      .from("matches")
      .upsert(
        {
          tournament_id: tournament.id,
          match_number: mNum,
          name: `Match ${mNum}`,
          map_name: mapName,
          round_name: mNum <= 6 ? "Grand Finals - Day 1" : mNum <= 12 ? "Grand Finals - Day 2" : "Grand Finals - Day 3",
          status,
          is_locked: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        },
        { onConflict: "tournament_id, match_number" }
      )
      .select()
      .single();

    if (!matchRec) continue;

    // Generate deterministic yet authentic placements for completed/live matches
    if (status === "COMPLETED" || status === "LIVE") {
      // Score calculation per team
      const scoredTeams = teamShortNames.map((tag) => {
        const weight = teamSkillWeights[tag] || 1.0;
        // Deterministic pseudo-random seed per match + team
        const pseudoRand = Math.sin(mNum * 1337 + tag.charCodeAt(0) * 42) * 10000;
        const roll = (pseudoRand - Math.floor(pseudoRand)) * weight;
        return { tag, roll };
      });

      // Sort by roll descending to assign 1st place to 16th place
      scoredTeams.sort((a, b) => b.roll - a.roll);

      for (let pIdx = 0; pIdx < scoredTeams.length; pIdx++) {
        const placement = pIdx + 1;
        const tag = scoredTeams[pIdx].tag;
        const teamId = teamIdMap[tag];
        if (!teamId) continue;

        // Realistic kills: 1st place gets 6-14 kills, bottom placements get 0-3 kills
        let kills = 0;
        if (placement === 1) kills = 6 + (mNum % 7);
        else if (placement <= 4) kills = 4 + ((mNum + placement) % 5);
        else if (placement <= 8) kills = 2 + ((mNum + placement) % 4);
        else kills = (mNum + placement) % 3;

        const scoreCalc = calculateMatchScore({
          placement,
          kills,
          wins: placement === 1 ? 1 : 0,
          scoringRules: scoringRulesConfig,
        });

        await supabase.from("match_results").upsert(
          {
            match_id: matchRec.id,
            team_id: teamId,
            placement,
            kills,
            wins: scoreCalc.isWin ? 1 : 0,
            placement_points: scoreCalc.placementPoints,
            finish_points: scoreCalc.finishPoints,
            bonus_points: 0,
            penalty_points: 0,
            total_points: scoreCalc.totalPoints,
          },
          { onConflict: "match_id, team_id" }
        );
      }
    }
  }

  // 7. Seed Initial Audit Log
  await supabase.from("tournament_audit_logs").insert({
    user_name: "Tournament Admin",
    tournament_id: tournament.id,
    action: "SEED_TOURNAMENT",
    entity_type: "TOURNAMENT",
    entity_id: tournament.id,
    new_value: {
      name: tournament.name,
      teams_count: 16,
      matches_count: 18,
      status: "LIVE",
    },
  });

  return {
    success: true,
    tournamentSlug: tournament.slug,
  };
}
