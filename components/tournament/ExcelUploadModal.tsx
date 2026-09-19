"use client";

import { useState, useRef, DragEvent } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase/client";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  User,
  Shield,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ParsedPlayer {
  name: string;
  player_identifier: string;
}

interface ParsedTeam {
  name: string;
  short_name: string;
  group_name: string;
  seed: number;
  players: ParsedPlayer[];
}

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  currentTeamCount: number;
  onImportSuccess: () => void;
  isSolo?: boolean;
}

export function ExcelUploadModal({
  isOpen,
  onClose,
  tournamentId,
  currentTeamCount,
  onImportSuccess,
  isSolo = false,
}: ExcelUploadModalProps) {
  const [activeFormat, setActiveFormat] = useState<"SQUAD" | "SOLO">(isSolo ? "SOLO" : "SQUAD");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedTeams, setParsedTeams] = useState<ParsedTeam[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    try {
      if (activeFormat === "SOLO") {
        // Solo Player Template
        const templateData = [
          [
            "Player Real Name",
            "In-Game Name (IGN)",
            "Character ID / In-Game ID",
            "Group",
            "Seed",
          ],
          ["Jonathan Amaral", "GODLJonathan", "512345678", "Group A", 1],
          ["Manya Sharma", "SOULManya", "587654321", "Group A", 2],
          ["Tanmay Singh", "TXScout", "598765432", "Group B", 3],
          ["Shubham Sahoo", "TXNinjaJOD", "511223344", "Group B", 4],
          ["Jokerr Gaming", "BLNDJoker", "544332211", "Group B", 5],
          ["Saumraj", "ENTSaumraj", "577889900", "Group A", 6],
          ["WizzGOD", "OGWizz", "599887766", "Group B", 7],
          ["Sensei", "RNTSensei", "533445566", "Group A", 8],
        ];

        const ws = XLSX.utils.aoa_to_sheet(templateData);
        ws["!cols"] = [
          { wch: 22 }, // Player Real Name
          { wch: 20 }, // In-Game Name (IGN)
          { wch: 26 }, // Character ID
          { wch: 12 }, // Group
          { wch: 8 },  // Seed
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Solo Combatants");
        XLSX.writeFile(wb, "esportix_solo_players_template.xlsx");
      } else {
        // Squad / Team Template
        const templateData = [
          [
            "Team Name",
            "Tag",
            "Group",
            "Seed",
            "Player 1 Name",
            "Player 1 IGN / ID",
            "Player 2 Name",
            "Player 2 IGN / ID",
            "Player 3 Name",
            "Player 3 IGN / ID",
            "Player 4 Name",
            "Player 4 IGN / ID",
            "Player 5 Name (Sub)",
            "Player 5 IGN / ID",
          ],
          [
            "GodLike Esports",
            "GODL",
            "Group A",
            1,
            "Jonathan Amaral",
            "GODLJonathan",
            "Suraj Majumdar",
            "GODLNeyoo",
            "Arjun Mandhata",
            "GODLShadow",
            "Kavish Chauhan",
            "GODLPunkk",
            "Zgod",
            "GODLZgod",
          ],
          [
            "Team Soul",
            "SOUL",
            "Group A",
            2,
            "Manya Sharma",
            "SOULManya",
            "Rudra B",
            "SOULSpower",
            "Nakul Sharma",
            "SOULNakul",
            "Mohammad Rony",
            "SOULRony",
            "",
            "",
          ],
          [
            "Team XSpark",
            "TX",
            "Group B",
            3,
            "Shubham Sahoo",
            "TXNinjaJOD",
            "Sarang Deka",
            "TXSarang",
            "Tanmay Singh",
            "TXScout",
            "Harsh Paudwal",
            "TXSprayGod",
            "",
            "",
          ],
        ];

        const ws = XLSX.utils.aoa_to_sheet(templateData);
        ws["!cols"] = [
          { wch: 22 }, // Team Name
          { wch: 8 },  // Tag
          { wch: 10 }, // Group
          { wch: 6 },  // Seed
          { wch: 18 }, // P1 Name
          { wch: 18 }, // P1 IGN
          { wch: 18 }, // P2 Name
          { wch: 18 }, // P2 IGN
          { wch: 18 }, // P3 Name
          { wch: 18 }, // P3 IGN
          { wch: 18 }, // P4 Name
          { wch: 18 }, // P4 IGN
          { wch: 20 }, // P5 Name
          { wch: 18 }, // P5 IGN
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Teams & Players");
        XLSX.writeFile(wb, "esportix_squad_roster_template.xlsx");
      }
    } catch (err) {
      console.error("Template download error:", err);
      alert("Failed to generate Excel template.");
    }
  };

  const processWorkbook = (file: File) => {
    setErrorMsg(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const wb = XLSX.read(buffer, { type: "array" });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        if (!rawRows || rawRows.length < 2) {
          setErrorMsg("The uploaded file appears to be empty or missing data rows.");
          setParsedTeams([]);
          return;
        }

        // Detect header row
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
          const rowStr = rawRows[i].map((c) => String(c).toLowerCase()).join(" ");
          if (rowStr.includes("team") || rowStr.includes("player") || rowStr.includes("name") || rowStr.includes("ign")) {
            headerRowIndex = i;
            break;
          }
        }

        const headers = rawRows[headerRowIndex].map((h) =>
          String(h).toLowerCase().trim().replace(/[^a-z0-9]/g, "")
        );

        const parsed: ParsedTeam[] = [];

        // Check if format is Solo Combatant (no team column, or activeFormat === "SOLO")
        const teamNameIdx = headers.findIndex((h) =>
          ["teamname", "team", "squad", "organization", "org"].includes(h)
        );
        const playerRealNameIdx = headers.findIndex((h) =>
          ["playerrealname", "realname", "fullname", "playername", "player", "name"].includes(h)
        );
        const ignIdx = headers.findIndex((h) =>
          ["ingamenameign", "ingamename", "ign", "characteridingameid", "characterid", "ingameid", "playeridentifier", "id"].includes(h)
        );
        const groupIdx = headers.findIndex((h) =>
          ["group", "groupname", "pool", "bracket"].includes(h)
        );
        const seedIdx = headers.findIndex((h) =>
          ["seed", "slot", "rank", "ranking"].includes(h)
        );
        const tagIdx = headers.findIndex((h) =>
          ["tag", "shortname", "short", "clantag", "prefix"].includes(h)
        );

        if (activeFormat === "SOLO" || (teamNameIdx < 0 && (playerRealNameIdx >= 0 || ignIdx >= 0))) {
          // SOLO PARTICIPANTS FORMAT
          for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
            const row = rawRows[i];
            const pRealName = playerRealNameIdx >= 0 ? String(row[playerRealNameIdx] || "").trim() : "";
            const pIgn = ignIdx >= 0 ? String(row[ignIdx] || "").trim() : pRealName;

            if (!pRealName && !pIgn) continue;

            const displayName = pRealName || pIgn;
            const identifier = pIgn || pRealName;
            const tTag = identifier.slice(0, 8).toUpperCase();
            const tGroup = groupIdx >= 0 && row[groupIdx] ? String(row[groupIdx]).trim() : "Group A";
            const tSeed = seedIdx >= 0 && row[seedIdx] ? Number(row[seedIdx]) || 1 : currentTeamCount + parsed.length + 1;

            parsed.push({
              name: displayName,
              short_name: tTag,
              group_name: tGroup,
              seed: tSeed,
              players: [
                {
                  name: displayName,
                  player_identifier: identifier,
                },
              ],
            });
          }
        } else {
          // SQUAD / TEAM FORMAT
          const hasIndividualPlayerCol = headers.some((h) =>
            ["player", "playername", "ign", "ingameid", "characterid"].includes(h)
          );

          if (hasIndividualPlayerCol && teamNameIdx >= 0 && !headers.some((h) => h.includes("player1") || h.includes("player2"))) {
            // Tall format: each row is one player
            const teamMap = new Map<string, ParsedTeam>();

            for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
              const row = rawRows[i];
              const tName = String(row[teamNameIdx] || "").trim();
              if (!tName) continue;

              const tTag = tagIdx >= 0 && row[tagIdx]
                ? String(row[tagIdx]).trim().toUpperCase()
                : tName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
              const tGroup = groupIdx >= 0 && row[groupIdx] ? String(row[groupIdx]).trim() : "Group A";
              const tSeed = seedIdx >= 0 && row[seedIdx] ? Number(row[seedIdx]) || 1 : currentTeamCount + teamMap.size + 1;

              if (!teamMap.has(tName)) {
                teamMap.set(tName, {
                  name: tName,
                  short_name: tTag,
                  group_name: tGroup,
                  seed: tSeed,
                  players: [],
                });
              }

              const pName = playerRealNameIdx >= 0 ? String(row[playerRealNameIdx] || "").trim() : "";
              const pIgn = ignIdx >= 0 ? String(row[ignIdx] || "").trim() : pName;

              if (pName || pIgn) {
                teamMap.get(tName)!.players.push({
                  name: pName || pIgn,
                  player_identifier: pIgn || pName,
                });
              }
            }
            parsed.push(...Array.from(teamMap.values()));
          } else {
            // Wide format: each row is one team with Player 1, Player 2 columns
            for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
              const row = rawRows[i];
              const tName = teamNameIdx >= 0 ? String(row[teamNameIdx] || "").trim() : String(row[0] || "").trim();
              if (!tName) continue;

              const tTag = tagIdx >= 0 && row[tagIdx]
                ? String(row[tagIdx]).trim().toUpperCase()
                : tName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
              const tGroup = groupIdx >= 0 && row[groupIdx] ? String(row[groupIdx]).trim() : "Group A";
              const tSeed = seedIdx >= 0 && row[seedIdx] ? Number(row[seedIdx]) || 1 : currentTeamCount + parsed.length + 1;

              const teamPlayers: ParsedPlayer[] = [];

              for (let pNum = 1; pNum <= 8; pNum++) {
                const pNameHeaders = [`player${pNum}name`, `player${pNum}`, `p${pNum}name`, `p${pNum}`];
                const pIgnHeaders = [`player${pNum}ign`, `player${pNum}id`, `p${pNum}ign`, `p${pNum}id`, `player${pNum}ignid`];

                const pNameCol = headers.findIndex((h) => pNameHeaders.includes(h));
                const pIgnCol = headers.findIndex((h) => pIgnHeaders.includes(h));

                let pName = pNameCol >= 0 ? String(row[pNameCol] || "").trim() : "";
                let pIgn = pIgnCol >= 0 ? String(row[pIgnCol] || "").trim() : "";

                if (pName || pIgn) {
                  teamPlayers.push({
                    name: pName || pIgn,
                    player_identifier: pIgn || pName,
                  });
                }
              }

              parsed.push({
                name: tName,
                short_name: tTag,
                group_name: tGroup,
                seed: tSeed,
                players: teamPlayers,
              });
            }
          }
        }

        if (parsed.length === 0) {
          setErrorMsg("Could not find valid team or player rows in this file. Please check column headers.");
          setParsedTeams([]);
        } else {
          setParsedTeams(parsed);
        }
      } catch (err: any) {
        console.error("Excel parse error:", err);
        setErrorMsg("Failed to read Excel file: " + (err.message || "Invalid file format"));
        setParsedTeams([]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processWorkbook(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processWorkbook(e.target.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (parsedTeams.length === 0) return;

    try {
      setIsImporting(true);

      for (const teamItem of parsedTeams) {
        const { data: createdTeam, error: tmErr } = await supabase
          .from("teams")
          .insert({
            tournament_id: tournamentId,
            name: teamItem.name,
            short_name: teamItem.short_name,
            seed: teamItem.seed,
            group_name: teamItem.group_name,
            logo_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=128&auto=format&fit=crop&q=80",
          })
          .select()
          .single();

        if (tmErr) {
          console.error("Error inserting team:", teamItem.name, tmErr);
          continue;
        }

        if (createdTeam && teamItem.players.length > 0) {
          for (const p of teamItem.players) {
            await supabase.from("players").insert({
              team_id: createdTeam.id,
              name: p.name,
              player_identifier: p.player_identifier,
            });
          }
        }
      }

      setImportSuccess(true);
      setTimeout(() => {
        onImportSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Import error:", err);
      alert("Error importing teams: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const totalPlayersDetected = parsedTeams.reduce((sum, t) => sum + t.players.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-black uppercase text-slate-900 tracking-tight">
                Import {activeFormat === "SOLO" ? "Solo Players" : "Teams & Players"} from Excel / CSV
              </h3>
              <p className="text-xs text-slate-500">
                Bulk upload {activeFormat === "SOLO" ? "solo combatants, IGNs, groups, and seeds" : "squads, tags, groups, seeds, and rosters"}.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Format Mode Selector Tabs */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveFormat("SQUAD");
                setParsedTeams([]);
                setFileName(null);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-black uppercase transition-all",
                activeFormat === "SQUAD"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Users className="h-4 w-4" />
              <span>Squad / Team Format</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFormat("SOLO");
                setParsedTeams([]);
                setFileName(null);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-black uppercase transition-all",
                activeFormat === "SOLO"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <User className="h-4 w-4" />
              <span>Solo Players Format</span>
            </button>
          </div>

          {/* Action Bar: Download Sample Template */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3.5">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {activeFormat === "SOLO"
                    ? "Download Solo Players Excel Template"
                    : "Download Squad Roster Excel Template"}
                </span>
                <span className="text-[11px] text-slate-500">
                  {activeFormat === "SOLO"
                    ? "Columns: Player Real Name, IGN, In-Game ID, Group, Seed."
                    : "Columns: Team Name, Tag, Group, Seed, Player 1-5."}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-all shrink-0"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>Download {activeFormat === "SOLO" ? "Solo" : "Squad"} Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {parsedTeams.length === 0 ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3",
                dragActive
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
                <UploadCloud className="h-6 w-6" />
              </div>

              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  Click to choose file or drag and drop here
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Supports .XLSX, .XLS, and .CSV spreadsheets ({activeFormat === "SOLO" ? "Solo Players" : "Squad Rosters"})
                </span>
              </div>
            </div>
          ) : (
            /* Parsed Preview Section */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>
                      {parsedTeams.length} {activeFormat === "SOLO" ? "Solo Players" : "Teams"} Detected
                    </span>
                  </span>
                  {activeFormat !== "SOLO" && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-bold text-blue-700">
                      <Users className="h-3.5 w-3.5" />
                      <span>{totalPlayersDetected} Players Detected</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setParsedTeams([]);
                    setFileName(null);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Choose Another File</span>
                </button>
              </div>

              {/* Preview Table */}
              <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-2.5 pl-3">#</th>
                      <th className="p-2.5">
                        {activeFormat === "SOLO" ? "Player Name" : "Team Name"}
                      </th>
                      <th className="p-2.5">
                        {activeFormat === "SOLO" ? "IGN / ID" : "Tag"}
                      </th>
                      <th className="p-2.5">Group</th>
                      <th className="p-2.5">Seed</th>
                      {activeFormat !== "SOLO" && <th className="p-2.5 pr-3">Roster Players</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedTeams.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-2.5 pl-3 text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {t.name}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-blue-600">
                          {activeFormat === "SOLO"
                            ? t.players[0]?.player_identifier || t.short_name
                            : t.short_name}
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {t.group_name}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">
                          {t.seed}
                        </td>
                        {activeFormat !== "SOLO" && (
                          <td className="p-2.5 pr-3">
                            {t.players.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {t.players.map((p, pIdx) => (
                                  <span
                                    key={pIdx}
                                    className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700"
                                    title={`IGN: ${p.player_identifier}`}
                                  >
                                    {p.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                No players specified
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {importSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                {activeFormat === "SOLO" ? "Solo combatants" : "Teams and players"} successfully imported!
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 p-6 pt-4 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedTeams.length === 0 || isImporting || importSuccess}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase text-white shadow-xs transition-all",
              parsedTeams.length > 0 && !isImporting && !importSuccess
                ? "bg-blue-600 hover:bg-blue-700 active:scale-98"
                : "bg-slate-300 cursor-not-allowed opacity-70"
            )}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Importing...</span>
              </>
            ) : importSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Imported!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4" />
                <span>
                  Confirm & Import{" "}
                  {parsedTeams.length > 0
                    ? `(${parsedTeams.length} ${activeFormat === "SOLO" ? "Players" : "Teams"})`
                    : ""}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
