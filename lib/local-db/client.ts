import { localDb, LocalDatabaseSchema } from "./store";

type TableName = keyof LocalDatabaseSchema;

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class LocalQueryBuilder<T = any> implements PromiseLike<{ data: any; error: any }> {
  private tableName: TableName;
  private selectQuery: string = "*";
  private filters: Array<(row: any) => boolean> = [];
  private orderConfig: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private mutationResult: any = null;
  private isMutation = false;
  private mutationError: any = null;

  constructor(tableName: TableName) {
    this.tableName = tableName;
  }

  public select(query: string = "*") {
    this.selectQuery = query;
    return this;
  }

  public eq(column: string, value: any) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  public neq(column: string, value: any) {
    this.filters.push((row) => row[column] !== value);
    return this;
  }

  public in(column: string, values: any[]) {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }

  public order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.orderConfig = { column, ascending };
    return this;
  }

  public limit(count: number) {
    this.limitCount = count;
    return this;
  }

  public insert(records: any | any[]) {
    this.isMutation = true;
    try {
      const table = localDb.getTable(this.tableName) as any[];
      const items = Array.isArray(records) ? records : [records];
      const inserted: any[] = [];

      items.forEach((item) => {
        const newItem = {
          id: item.id || generateUUID(),
          ...item,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        table.push(newItem);
        inserted.push(newItem);
        localDb.notifySubscribers(this.tableName, "INSERT", newItem);
      });

      localDb.save();
      this.mutationResult = Array.isArray(records) ? inserted : inserted[0];
    } catch (err: any) {
      this.mutationError = { message: err?.message || "Insert failed" };
    }
    return this;
  }

  public update(updates: any) {
    this.isMutation = true;
    try {
      const table = localDb.getTable(this.tableName) as any[];
      const updated: any[] = [];

      table.forEach((row, idx) => {
        const matches = this.filters.every((f) => f(row));
        if (matches) {
          const old = { ...row };
          table[idx] = {
            ...row,
            ...updates,
            updated_at: new Date().toISOString(),
          };
          updated.push(table[idx]);
          localDb.notifySubscribers(this.tableName, "UPDATE", table[idx], old);
        }
      });

      localDb.save();
      this.mutationResult = updated;
    } catch (err: any) {
      this.mutationError = { message: err?.message || "Update failed" };
    }
    return this;
  }

  public delete() {
    this.isMutation = true;
    try {
      const table = localDb.getTable(this.tableName) as any[];
      const deleted: any[] = [];
      const remaining: any[] = [];

      table.forEach((row) => {
        const matches = this.filters.every((f) => f(row));
        if (matches) {
          deleted.push(row);
          localDb.notifySubscribers(this.tableName, "DELETE", row);
        } else {
          remaining.push(row);
        }
      });

      // Replace array contents
      table.length = 0;
      remaining.forEach((r) => table.push(r));

      localDb.save();
      this.mutationResult = deleted;
    } catch (err: any) {
      this.mutationError = { message: err?.message || "Delete failed" };
    }
    return this;
  }

  public upsert(records: any | any[], options?: { onConflict?: string }) {
    this.isMutation = true;
    try {
      const table = localDb.getTable(this.tableName) as any[];
      const items = Array.isArray(records) ? records : [records];
      const conflictKeys = options?.onConflict
        ? options.onConflict.split(",").map((k) => k.trim())
        : ["id"];

      const results: any[] = [];

      items.forEach((item) => {
        const existingIdx = table.findIndex((row) => {
          return conflictKeys.every((k) => row[k] === item[k]);
        });

        if (existingIdx >= 0) {
          const old = { ...table[existingIdx] };
          table[existingIdx] = {
            ...table[existingIdx],
            ...item,
            updated_at: new Date().toISOString(),
          };
          results.push(table[existingIdx]);
          localDb.notifySubscribers(this.tableName, "UPDATE", table[existingIdx], old);
        } else {
          const newItem = {
            id: item.id || generateUUID(),
            ...item,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          table.push(newItem);
          results.push(newItem);
          localDb.notifySubscribers(this.tableName, "INSERT", newItem);
        }
      });

      localDb.save();
      this.mutationResult = Array.isArray(records) ? results : results[0];
    } catch (err: any) {
      this.mutationError = { message: err?.message || "Upsert failed" };
    }
    return this;
  }

  private executeQuery(): any {
    if (this.isMutation) {
      return this.mutationResult;
    }

    let rows = [...(localDb.getTable(this.tableName) as any[])];

    // Apply filters
    if (this.filters.length > 0) {
      rows = rows.filter((row) => this.filters.every((f) => f(row)));
    }

    // Apply ordering
    if (this.orderConfig) {
      const { column, ascending } = this.orderConfig;
      rows.sort((a, b) => {
        const valA = a[column];
        const valB = b[column];
        if (valA === valB) return 0;
        if (valA == null) return ascending ? 1 : -1;
        if (valB == null) return ascending ? -1 : 1;
        if (valA < valB) return ascending ? -1 : 1;
        return ascending ? 1 : -1;
      });
    }

    // Apply limit
    if (this.limitCount !== null) {
      rows = rows.slice(0, this.limitCount);
    }

    // Process select query & joins
    return rows.map((row) => this.expandRow(row));
  }

  private expandRow(row: any): any {
    const copy = { ...row };
    const query = this.selectQuery;

    // Join games: game:games(*)
    if (query.includes("game:games(*)") || query.includes("games(*)")) {
      const games = localDb.getTable("games");
      copy.game = games.find((g) => g.id === copy.game_id) || null;
    }

    // Join teams: teams(count) or teams(*)
    if (query.includes("teams(count)")) {
      const teams = localDb.getTable("teams");
      const count = teams.filter((t) => t.tournament_id === copy.id).length;
      copy.teams = [{ count }];
    } else if (query.includes("teams(*)")) {
      const teams = localDb.getTable("teams");
      const players = localDb.getTable("players");
      copy.teams = teams
        .filter((t) => t.tournament_id === copy.id)
        .map((t) => {
          const tCopy = { ...t };
          tCopy.players = players.filter((p) => p.team_id === t.id);
          return tCopy;
        });
    }

    // Join matches: matches(*)
    if (query.includes("matches(*)")) {
      const matches = localDb.getTable("matches");
      const matchResults = localDb.getTable("match_results");
      copy.matches = matches
        .filter((m) => m.tournament_id === copy.id)
        .map((m) => {
          const mCopy = { ...m };
          mCopy.match_results = matchResults.filter((mr) => mr.match_id === m.id);
          return mCopy;
        });
    }

    // Join scoring_rules: scoring_rules(*)
    if (query.includes("scoring_rules(*)")) {
      const sRules = localDb.getTable("scoring_rules");
      copy.scoring_rules = sRules.find((sr) => sr.tournament_id === copy.id) || null;
    }

    // Join players: players(*) (when querying teams)
    if (query.includes("players(*)") && this.tableName === "teams") {
      const players = localDb.getTable("players");
      copy.players = players.filter((p) => p.team_id === copy.id);
    }

    // Join match_results: match_results(*) (when querying matches)
    if (query.includes("match_results(*)") && this.tableName === "matches") {
      const matchResults = localDb.getTable("match_results");
      const teams = localDb.getTable("teams");
      copy.match_results = matchResults
        .filter((mr) => mr.match_id === copy.id)
        .map((mr) => {
          const mrCopy = { ...mr };
          mrCopy.team = teams.find((t) => t.id === mr.team_id) || undefined;
          return mrCopy;
        });
    }

    return copy;
  }

  public async single(): Promise<{ data: any; error: any }> {
    if (this.mutationError) {
      return { data: null, error: this.mutationError };
    }
    const res = this.executeQuery();
    const item = Array.isArray(res) ? res[0] : res;
    if (!item) {
      return { data: null, error: { message: "Row not found", code: "PGRST116" } };
    }
    return { data: item, error: null };
  }

  public async maybeSingle(): Promise<{ data: any; error: any }> {
    if (this.mutationError) {
      return { data: null, error: this.mutationError };
    }
    const res = this.executeQuery();
    const item = Array.isArray(res) ? res[0] : res;
    return { data: item || null, error: null };
  }

  public then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const promise = new Promise<{ data: any; error: any }>((resolve) => {
      if (this.mutationError) {
        resolve({ data: null, error: this.mutationError });
        return;
      }
      const data = this.executeQuery();
      resolve({ data, error: null });
    });

    return promise.then(onfulfilled, onrejected);
  }
}

export interface RealtimeChannel {
  on: (
    event: "postgres_changes",
    filter: { event: string; schema: string; table: string; filter?: string },
    callback: (payload: any) => void
  ) => RealtimeChannel;
  subscribe: (callback?: (status: string) => void) => RealtimeChannel;
  unsubscribe?: () => void;
}

export class LocalSupabaseClient {
  private channels: Map<string, RealtimeChannel> = new Map();

  public from(tableName: TableName) {
    return new LocalQueryBuilder(tableName);
  }

  public channel(channelName: string): RealtimeChannel {
    const listeners: Array<{
      table: string;
      filter?: string;
      callback: (payload: any) => void;
    }> = [];

    const unsubscribeStore = localDb.subscribe((payload) => {
      listeners.forEach(({ table, filter, callback }) => {
        if (table === "*" || payload.table === table) {
          // Check simple filter if present: e.g. "tournament_id=eq.123"
          if (filter && filter.includes("=")) {
            const [field, valWithOp] = filter.split("=");
            const val = valWithOp.replace("eq.", "");
            const record = payload.new || payload.old;
            if (record && String(record[field]) !== String(val)) {
              return;
            }
          }
          callback({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
            table: payload.table,
          });
        }
      });
    });

    const channelObj: RealtimeChannel = {
      on: (event, filterConfig, callback) => {
        listeners.push({
          table: filterConfig.table,
          filter: filterConfig.filter,
          callback,
        });
        return channelObj;
      },
      subscribe: (statusCallback) => {
        setTimeout(() => {
          statusCallback?.("SUBSCRIBED");
        }, 10);
        return channelObj;
      },
      unsubscribe: () => {
        unsubscribeStore();
      },
    };

    this.channels.set(channelName, channelObj);
    return channelObj;
  }

  public removeChannel(channel: RealtimeChannel) {
    if (channel.unsubscribe) {
      channel.unsubscribe();
    }
  }
}

export const localClient = new LocalSupabaseClient();
