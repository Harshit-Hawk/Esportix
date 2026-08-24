"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, TournamentAuditLog } from "@/types/database";
import {
  ShieldCheck,
  ArrowLeft,
  Search,
  Clock,
  User,
  History,
  RefreshCw,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TournamentAuditLogsPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [logs, setLogs] = useState<TournamentAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: tourney } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();
      setTournament(tourney);

      const { data: auditData } = await supabase
        .from("tournament_audit_logs")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("created_at", { ascending: false });

      setLogs(auditData || []);
    } catch (err) {
      console.error("Error loading audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLogs = logs.filter((l) =>
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.user_name && l.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    l.entity_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1 text-xs font-bold uppercase text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Control Room</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-900 uppercase">{tournament?.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="font-display text-2xl font-black uppercase text-slate-900">
              Immutable Score Audit Trail
            </h1>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-700">
              {logs.length} Records
            </span>
          </div>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold uppercase text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, user, or entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600">
                <th className="py-3 pl-5 pr-2">Timestamp</th>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 pl-3 pr-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No audit records match your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 pl-5 pr-2 font-mono text-slate-500 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                        <User className="h-3.5 w-3.5 text-blue-600" />
                        <span>{log.user_name || "Admin"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-block rounded-md bg-yellow-400 px-2.5 py-0.5 font-mono text-[10px] font-black text-slate-950 border border-yellow-500 shadow-sm">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-700">
                      {log.entity_type}
                    </td>

                    <td className="py-3.5 pl-3 pr-5 text-right font-mono text-[11px] text-slate-500">
                      {log.new_value ? (
                        <span className="truncate max-w-xs inline-block text-slate-700">
                          {JSON.stringify(log.new_value).slice(0, 50)}...
                        </span>
                      ) : (
                        "-"
                      )}
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
