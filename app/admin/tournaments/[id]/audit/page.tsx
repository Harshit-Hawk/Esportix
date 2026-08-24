"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, TournamentAuditLog } from "@/types/database";
import {
  History,
  ArrowLeft,
  Shield,
  Clock,
  Search,
  Filter,
  RefreshCw,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TournamentAuditAdminPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [logs, setLogs] = useState<TournamentAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(async () => {
    try {
      const { data: tourney } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();
      setTournament(tourney);

      const { data: logsData } = await supabase
        .from("tournament_audit_logs")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("created_at", { ascending: false });

      setLogs(logsData || []);
    } catch (err) {
      console.error("Audit logs load error:", err);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLogs = logs.filter((l) => {
    const term = searchTerm.toLowerCase();
    const actionMatch = l.action.toLowerCase().includes(term);
    const userMatch = l.user_name?.toLowerCase().includes(term);
    const entityMatch = l.entity_type.toLowerCase().includes(term);
    return actionMatch || userMatch || entityMatch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-esports-navy-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1 text-xs font-bold uppercase text-esports-silver hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Control Room</span>
            </Link>
            <span className="text-esports-navy-border">/</span>
            <span className="text-xs font-bold text-white uppercase">{tournament?.name}</span>
          </div>
          <h1 className="font-display text-2xl font-black uppercase text-white mt-1">
            Tournament Score Audit Trail
          </h1>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 rounded-lg border border-esports-navy-border bg-esports-navy-light px-3 py-1.5 text-xs font-bold uppercase text-esports-silver hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-esports-silver" />
          <input
            type="text"
            placeholder="Search action or admin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-esports-navy-border bg-esports-navy-card py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none"
          />
        </div>
        <span className="text-xs text-esports-silver font-semibold">
          {filteredLogs.length} audit entries
        </span>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-xl border border-esports-navy-border bg-esports-navy-card shadow-2xl">
        <div className="border-b border-esports-navy-border bg-gradient-to-r from-esports-navy to-esports-navy-light px-5 py-3.5 flex items-center gap-2">
          <Shield className="h-4 w-4 text-esports-gold" />
          <span className="font-display text-xs font-black uppercase text-white">
            Immutable Activity Log
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-esports-navy-border bg-esports-navy-dark text-[11px] font-black uppercase tracking-wider text-esports-silver">
                <th className="py-3 pl-4 pr-2">Timestamp</th>
                <th className="py-3 px-3">Admin</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-3">Previous Value</th>
                <th className="py-3 pl-3 pr-5">New Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-esports-navy-border/40 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-esports-silver">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-esports-navy-light/40 transition-colors">
                    <td className="py-3 pl-4 pr-2 font-mono text-[11px] text-esports-silver whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {log.user_name || "Admin"}
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-esports-navy-dark px-2 py-0.5 font-mono text-[10px] font-bold text-esports-orange border border-esports-navy-border">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-esports-cream text-[11px]">
                      {log.entity_type}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-500 text-[11px] max-w-xs truncate">
                      {log.old_value ? JSON.stringify(log.old_value) : "-"}
                    </td>
                    <td className="py-3 pl-3 pr-5 font-mono text-emerald-400 text-[11px] max-w-xs truncate font-semibold">
                      {log.new_value ? JSON.stringify(log.new_value) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
