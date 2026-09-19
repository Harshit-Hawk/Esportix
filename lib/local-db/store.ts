import {
  Game,
  Tournament,
  ScoringRuleRecord,
  Team,
  Player,
  Match,
  MatchResult,
  TournamentAuditLog,
  TournamentUser,
  TournamentAdmin,
} from "@/types/database";
import { DEFAULT_GAMES } from "@/lib/games";
import { SEED_TEAMS, SEED_MAPS } from "@/lib/seed-data";
import { SCORING_PRESETS } from "@/lib/scoring/presets";
import { calculateMatchScore } from "@/lib/scoring/engine";

export interface LocalDatabaseSchema {
  games: Game[];
  tournaments: Tournament[];
  scoring_rules: ScoringRuleRecord[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  match_results: MatchResult[];
  tournament_audit_logs: TournamentAuditLog[];
  tournament_users: TournamentUser[];
  tournament_admins: TournamentAdmin[];
  badges: any[];
}

const STORAGE_KEY = "esportix_local_db_v2";

// Realtime listeners
type RealtimeCallback = (payload: {
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE" | "*";
  new?: any;
  old?: any;
}) => void;

class LocalDatabaseStore {
  private db: LocalDatabaseSchema;
  private channel: BroadcastChannel | null = null;
  private subscribers: Set<RealtimeCallback> = new Set();
  private initialized = false;

  constructor() {
    this.db = this.createEmptyDb();
    if (typeof window !== "undefined") {
      this.initClient();
    } else {
      this.db = this.generateSeedData();
    }
  }

  private createEmptyDb(): LocalDatabaseSchema {
    return {
      games: [],
      tournaments: [],
      scoring_rules: [],
      teams: [],
      players: [],
      matches: [],
      match_results: [],
      tournament_audit_logs: [],
      tournament_users: [],
      tournament_admins: [],
      badges: [],
    };
  }

  private initClient() {
    if (this.initialized) return;
    this.initialized = true;

    // Load from localStorage or seed
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.tournaments) && parsed.tournaments.length > 0) {
          this.db = parsed;
          // Ensure default games are present
          if (!this.db.games || this.db.games.length === 0) {
            this.db.games = DEFAULT_GAMES;
            this.save();
          }
        } else {
          this.db = this.generateSeedData();
          this.save();
        }
      } catch {
        this.db = this.generateSeedData();
        this.save();
      }
    } else {
      this.db = this.generateSeedData();
      this.save();
    }

    // Set up BroadcastChannel for cross-tab realtime sync
    if (typeof BroadcastChannel !== "undefined") {
      this.channel = new BroadcastChannel("esportix-realtime");
      this.channel.onmessage = (event) => {
        if (event.data?.type === "DB_CHANGE") {
          // Reload from storage
          const updatedRaw = localStorage.getItem(STORAGE_KEY);
          if (updatedRaw) {
            try {
              this.db = JSON.parse(updatedRaw);
            } catch {}
          }
          // Notify local subscribers
          this.notifySubscribers(
            event.data.table,
            event.data.eventType,
            event.data.record,
            event.data.oldRecord
          );
        }
      };
    }

    // Listen for storage events (safari / older browsers cross-tab fallback)
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          this.db = JSON.parse(e.newValue);
          this.notifySubscribers("*", "*", null, null);
        } catch {}
      }
    });
  }

  public generateSeedData(): LocalDatabaseSchema {
    const games = [...DEFAULT_GAMES];
    const bgmiGame = games.find((g) => g.slug === "bgmi") || games[0];

    const adminUser: TournamentUser = {
      id: "u-admin-01",
      auth_user_id: "auth-admin-01",
      name: "Tournament Administrator",
      email: "admin@esportix.gg",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80",
      role: "SUPER_ADMIN",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const tourneyId = "t-bgmi-campus-2026";
    const tournament: Tournament = {
      id: tourneyId,
      name: "BGMI Campus Showdown 2026",
      slug: "bgmi-campus-showdown-2026",
      game_id: bgmiGame.id,
      description:
        "The premier national collegiate esports championship featuring 16 top collegiate teams battling across 18 intense matches for the grand trophy.",
      logo_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=256&auto=format&fit=crop&q=80",
      banner_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
      status: "LIVE",
      visibility: "PUBLIC",
      format: "SQUAD",
      team_size: 4,
      start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: adminUser.id,
      custom_colors: {
        primary: "#101C34",
        accent: "#E96D2F",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const scoringRule: ScoringRuleRecord = {
      id: "sr-" + tourneyId,
      tournament_id: tourneyId,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const teams: Team[] = [];
    const players: Player[] = [];
    const teamIdMap: Record<string, string> = {};

    SEED_TEAMS.forEach((t, idx) => {
      const teamId = `tm-${idx + 1}`;
      teamIdMap[t.short_name] = teamId;

      teams.push({
        id: teamId,
        tournament_id: tourneyId,
        name: t.name,
        short_name: t.short_name,
        logo_url: t.logo_url,
        seed: t.seed,
        group_name: t.group_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      t.players.forEach((p, pIdx) => {
        players.push({
          id: `pl-${idx + 1}-${pIdx + 1}`,
          team_id: teamId,
          name: p.name,
          player_identifier: p.player_identifier,
          avatar_url: null,
          created_at: new Date().toISOString(),
        });
      });
    });

    const matches: Match[] = [];
    const match_results: MatchResult[] = [];

    const teamSkillWeights: Record<string, number> = {
      GODL: 1.45,
      SOUL: 1.4,
      TX: 1.35,
      BLND: 1.25,
      ENT: 1.2,
      OG: 1.15,
      RNT: 1.1,
      CG: 1.05,
      GE: 1.0,
      "8BIT": 0.95,
      MEDL: 0.9,
      GLAD: 0.85,
      HYD: 0.8,
      RCK: 0.75,
      GT: 0.7,
      BB: 0.65,
    };

    for (let mNum = 1; mNum <= 18; mNum++) {
      const matchId = `match-${mNum}`;
      const isCompleted = mNum <= 17;
      const isLive = mNum === 18;
      const status = isCompleted ? "COMPLETED" : isLive ? "LIVE" : "SCHEDULED";
      const mapName = SEED_MAPS[mNum - 1] || "Erangel";

      matches.push({
        id: matchId,
        tournament_id: tourneyId,
        match_number: mNum,
        name: `Match ${mNum}`,
        map_name: mapName,
        round_name:
          mNum <= 6 ? "Grand Finals - Day 1" : mNum <= 12 ? "Grand Finals - Day 2" : "Grand Finals - Day 3",
        status,
        is_locked: isCompleted,
        scheduled_at: new Date().toISOString(),
        started_at: isCompleted || isLive ? new Date().toISOString() : null,
        completed_at: isCompleted ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (isCompleted || isLive) {
        const teamTags = Object.keys(teamIdMap);
        const scoredTeams = teamTags.map((tag) => {
          const weight = teamSkillWeights[tag] || 1.0;
          const pseudoRand = Math.sin(mNum * 1337 + tag.charCodeAt(0) * 42) * 10000;
          const roll = (pseudoRand - Math.floor(pseudoRand)) * weight;
          return { tag, roll };
        });

        scoredTeams.sort((a, b) => b.roll - a.roll);

        for (let pIdx = 0; pIdx < scoredTeams.length; pIdx++) {
          const placement = pIdx + 1;
          const tag = scoredTeams[pIdx].tag;
          const teamId = teamIdMap[tag];
          if (!teamId) continue;

          let kills = 0;
          if (placement === 1) kills = 6 + (mNum % 7);
          else if (placement <= 4) kills = 4 + ((mNum + placement) % 5);
          else if (placement <= 8) kills = 2 + ((mNum + placement) % 4);
          else kills = (mNum + placement) % 3;

          const scoreCalc = calculateMatchScore({
            placement,
            kills,
            wins: placement === 1 ? 1 : 0,
            scoringRules: SCORING_PRESETS.bgmi_official_10pt.rules,
          });

          match_results.push({
            id: `mr-${mNum}-${pIdx + 1}`,
            match_id: matchId,
            team_id: teamId,
            placement,
            kills,
            wins: scoreCalc.isWin ? 1 : 0,
            placement_points: scoreCalc.placementPoints,
            finish_points: scoreCalc.finishPoints,
            bonus_points: 0,
            penalty_points: 0,
            total_points: scoreCalc.totalPoints,
            notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    }

    const auditLogs: TournamentAuditLog[] = [
      {
        id: "log-01",
        tournament_id: tourneyId,
        match_id: null,
        user_id: adminUser.id,
        user_name: "Super Admin",
        action: "CREATE_TOURNAMENT",
        entity_type: "TOURNAMENT",
        entity_id: tourneyId,
        old_value: null,
        new_value: { name: tournament.name, slug: tournament.slug },
        created_at: new Date().toISOString(),
      },
    ];

    return {
      games,
      tournaments: [tournament],
      scoring_rules: [scoringRule],
      teams,
      players,
      matches,
      match_results,
      tournament_audit_logs: auditLogs,
      tournament_users: [adminUser],
      tournament_admins: [
        {
          id: "ta-01",
          tournament_id: tourneyId,
          user_id: adminUser.id,
          role: "ADMIN",
          created_at: new Date().toISOString(),
        },
      ],
      badges: [],
    };
  }

  public getTable<K extends keyof LocalDatabaseSchema>(table: K): LocalDatabaseSchema[K] {
    if (typeof window !== "undefined" && !this.initialized) {
      this.initClient();
    }
    return (this.db[table] || []) as LocalDatabaseSchema[K];
  }

  public save() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
      } catch (err) {
        console.error("LocalDatabaseStore save error:", err);
      }
    }
  }

  public notifySubscribers(table: string, eventType: "INSERT" | "UPDATE" | "DELETE" | "*", record?: any, oldRecord?: any) {
    this.subscribers.forEach((cb) => {
      try {
        cb({ table, eventType, new: record, old: oldRecord });
      } catch (err) {
        console.error("Subscriber callback error:", err);
      }
    });

    if (this.channel) {
      try {
        this.channel.postMessage({
          type: "DB_CHANGE",
          table,
          eventType,
          record,
          oldRecord,
        });
      } catch {}
    }
  }

  public subscribe(cb: RealtimeCallback): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  public resetToDefaultSeed() {
    this.db = this.generateSeedData();
    this.save();
    this.notifySubscribers("*", "*", null, null);
  }
}

export const localDb = new LocalDatabaseStore();
