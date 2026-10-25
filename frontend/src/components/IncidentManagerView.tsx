"use client";

import React, { useState } from "react";
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ShieldAlert,
  ArrowRight,
  Layers,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Activity
} from "lucide-react";

export interface IncidentRecord {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  priority: "P1" | "P2" | "P3" | "P4";
  affectedServices: string[];
  firstOccurrence: string;
  latestOccurrence: string;
  probableCause: string;
  recommendedSolution: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED";
  impactedUsersCount: number;
}

const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    id: "INC-9481",
    title: "Database Connection Pool Saturation & Egress Timeouts",
    severity: "CRITICAL",
    priority: "P1",
    affectedServices: ["database-service", "payment-gateway", "api-gateway"],
    firstOccurrence: "10:00:15 UTC",
    latestOccurrence: "10:02:45 UTC",
    probableCause: "HikariCP pool reached 200/200 connection slots due to unindexed slow query lock contention, causing downstream 504 timeouts.",
    recommendedSolution: "Deploy PgBouncer transaction pooling mode, increase max_connections to 500, and terminate idle-in-transaction connections.",
    status: "OPEN",
    impactedUsersCount: 4200,
  },
  {
    id: "INC-9482",
    title: "Payment Gateway Stripe Webhook Deadline Breach",
    severity: "HIGH",
    priority: "P2",
    affectedServices: ["payment-gateway", "notification-service"],
    firstOccurrence: "10:14:20 UTC",
    latestOccurrence: "10:15:30 UTC",
    probableCause: "Socket read timeout to Stripe API exceeded 5000ms threshold, tripping circuit breaker to half-open.",
    recommendedSolution: "Enable asynchronous Kafka webhook buffer and trip egress routing to backup Adyen provider.",
    status: "INVESTIGATING",
    impactedUsersCount: 1850,
  },
  {
    id: "INC-9483",
    title: "Canary Release v2.4.2 JWT Signature Mismatch",
    severity: "HIGH",
    priority: "P2",
    affectedServices: ["auth-service", "api-gateway"],
    firstOccurrence: "10:30:35 UTC",
    latestOccurrence: "10:31:20 UTC",
    probableCause: "Canary pods deployed with updated JWT public key that does not recognize tokens signed by baseline issuer.",
    recommendedSolution: "Execute 1-click canary rollback to v2.4.1 and synchronize shared cluster secrets in HashiCorp Vault.",
    status: "OPEN",
    impactedUsersCount: 3100,
  },
  {
    id: "INC-9484",
    title: "Redis Cache Memory Eviction Spike",
    severity: "MEDIUM",
    priority: "P3",
    affectedServices: ["redis-cache", "user-service"],
    firstOccurrence: "09:42:10 UTC",
    latestOccurrence: "09:48:00 UTC",
    probableCause: "Session TTL missing on mobile push tokens, causing volatile memory allocation to exceed maxmemory quota.",
    recommendedSolution: "Apply default 24-hour TTL policy on session keys and switch eviction policy to allkeys-lru.",
    status: "RESOLVED",
    impactedUsersCount: 620,
  },
];

interface IncidentManagerViewProps {
  onInvestigateIncident?: (incidentId: string) => void;
  onReplayIncident?: (incidentId: string) => void;
}

export const IncidentManagerView: React.FC<IncidentManagerViewProps> = ({
  onInvestigateIncident,
  onReplayIncident,
}) => {
  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENTS);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleToggleStatus = (id: string, currentStatus: "OPEN" | "INVESTIGATING" | "RESOLVED") => {
    const nextStatus = currentStatus === "RESOLVED" ? "OPEN" : currentStatus === "OPEN" ? "INVESTIGATING" : "RESOLVED";
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: nextStatus } : inc))
    );
  };

  const handleMarkResolved = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: "RESOLVED" } : inc))
    );
  };

  const handleReopen = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: "OPEN" } : inc))
    );
  };

  // Filter incidents
  const filtered = incidents.filter((inc) => {
    if (statusFilter !== "ALL" && inc.status !== statusFilter) return false;
    if (severityFilter !== "ALL" && inc.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.probableCause.toLowerCase().includes(q) ||
        inc.affectedServices.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const openCount = incidents.filter((i) => i.status === "OPEN").length;
  const investigatingCount = incidents.filter((i) => i.status === "INVESTIGATING").length;
  const resolvedCount = incidents.filter((i) => i.status === "RESOLVED").length;

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Summary Cards */}
      <section className="rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Incident Management &amp; Tracking System
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  SRE Operations
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Triage, investigate, and mark production incident tickets as resolved with complete causal tracking.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#141d2e] border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Incidents
            </span>
            <span className="text-2xl font-black text-white mt-1 block font-mono">
              {incidents.length}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#141d2e] border border-red-500/40">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
              Open Incidents (P1)
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-red-400 font-mono">{openCount}</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141d2e] border border-amber-500/40">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Investigating
            </span>
            <span className="text-2xl font-black text-amber-300 mt-1 block font-mono">
              {investigatingCount}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#141d2e] border border-emerald-500/40">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              Resolved
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">
              {resolvedCount}
            </span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="rounded-2xl bg-[#0f172a] border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents by ID, service, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#162035] border border-slate-700/80 focus:border-sky-400 text-sm text-white placeholder-slate-400 outline-none"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#141d2e] p-1 rounded-xl border border-slate-800 text-xs">
            {["ALL", "OPEN", "INVESTIGATING", "RESOLVED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-sky-500 text-slate-950 font-black shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold uppercase">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#162035] border border-slate-700 text-white font-medium text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical (P1)</option>
              <option value="HIGH">High (P2)</option>
              <option value="MEDIUM">Medium (P3)</option>
              <option value="LOW">Low (P4)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Incidents List Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-16 rounded-2xl bg-[#0f172a] border border-slate-800 text-center text-slate-400">
            No incident tickets match the selected filters.
          </div>
        ) : (
          filtered.map((inc) => {
            const isResolved = inc.status === "RESOLVED";
            const isInvestigating = inc.status === "INVESTIGATING";

            return (
              <div
                key={inc.id}
                className={`rounded-2xl border p-6 transition-all ${
                  isResolved
                    ? "bg-[#0c1220]/70 border-slate-800/80 opacity-75"
                    : inc.severity === "CRITICAL"
                    ? "bg-[#0f172a] border-red-500/40 shadow-xl shadow-red-950/20"
                    : "bg-[#0f172a] border-slate-800 shadow-xl"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-slate-800 text-white border border-slate-700">
                        {inc.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          inc.severity === "CRITICAL"
                            ? "bg-red-600 text-white"
                            : inc.severity === "HIGH"
                            ? "bg-rose-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {inc.priority} • {inc.severity}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isResolved
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/50"
                            : isInvestigating
                            ? "bg-amber-950 text-amber-300 border border-amber-500/50 animate-pulse"
                            : "bg-red-950 text-red-300 border border-red-500/50 animate-pulse"
                        }`}
                      >
                        Status: {inc.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight">
                      {inc.title}
                    </h3>
                  </div>

                  {/* Status Toggle & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isResolved ? (
                      <button
                        onClick={() => handleReopen(inc.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reopen Incident</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkResolved(inc.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/30 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Resolved</span>
                      </button>
                    )}

                    {onInvestigateIncident && (
                      <button
                        onClick={() => onInvestigateIncident(inc.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#162035] hover:bg-slate-800 border border-slate-700 text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Investigate</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onReplayIncident && (
                      <button
                        onClick={() => onReplayIncident(inc.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Replay</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Affected Services
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {inc.affectedServices.map((srv, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[#162035] text-sky-300 border border-slate-700 font-mono text-[11px]"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Occurrence Window
                    </span>
                    <span className="font-mono text-slate-300 block">
                      {inc.firstOccurrence} &rarr; {inc.latestOccurrence}
                    </span>
                    <span className="text-slate-400 block mt-0.5">
                      Impacted Users: <b className="text-white font-mono">{inc.impactedUsersCount.toLocaleString()}</b>
                    </span>
                  </div>

                  <div className="md:col-span-2 lg:col-span-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Recommended Solution
                    </span>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      {inc.recommendedSolution}
                    </p>
                  </div>
                </div>

                {/* Probable Cause Box */}
                <div className="mt-4 p-3.5 rounded-xl bg-[#141d2e] border border-slate-800 text-xs space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Probable Root Cause
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {inc.probableCause}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
