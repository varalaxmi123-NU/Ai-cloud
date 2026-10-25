"use client";

import React, { useState } from "react";
import {
  Flame,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle,
  FileCode,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  Terminal
} from "lucide-react";
import { CascadeResult, RemediationPlaybook } from "@/types/sre";

interface ChaosConsoleProps {
  onInjectChaos: (serviceId: string, scenario: string) => void;
  onExecuteHeal: (serviceId: string, actionId: string) => void;
  cascadeResult: CascadeResult | null;
  loading: boolean;
}

const CHAOS_PRESETS = [
  {
    serviceId: "database-service",
    title: "Primary Database Connection Pool Outage",
    desc: "Postgres write-master hits connection pool saturation (200/200). Latency spikes to 3,840ms.",
    scenario: "database_connection_pool_exhaustion",
    severity: "CRITICAL",
    badge: "Killer Demo (Recommended)",
  },
  {
    serviceId: "auth-service",
    title: "Auth JWT Token Validation Eviction",
    desc: "Redis session cache evicts cryptographic tokens. Auth latency spikes 15x; locks user queries.",
    scenario: "jwt_token_cache_eviction",
    severity: "HIGH",
    badge: "Tier-1 Cascade",
  },
  {
    serviceId: "payment-gateway",
    title: "Payment Gateway Third-Party Timeout",
    desc: "Stripe webhook backlog leads to thread starvation and cascading 504 timeouts to API Gateway.",
    scenario: "payment_thread_exhaustion",
    severity: "CRITICAL",
    badge: "Revenue Blocker",
  },
  {
    serviceId: "redis-cache",
    title: "Redis L2 Cache Cache-Stampede",
    desc: "Mass cache invalidation causes thousands of concurrent queries to hammer underlying services.",
    scenario: "cache_stampede",
    severity: "HIGH",
    badge: "Spike Simulation",
  },
];

export const ChaosConsole: React.FC<ChaosConsoleProps> = ({
  onInjectChaos,
  onExecuteHeal,
  cascadeResult,
  loading,
}) => {
  const [selectedScenario, setSelectedScenario] = useState(CHAOS_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<"chaos" | "cascade" | "playbooks">("chaos");

  const hasIncident = !!cascadeResult;

  return (
    <div className="w-full rounded-2xl border border-slate-800/80 bg-[#070b14]/95 backdrop-blur-xl p-5 shadow-2xl">
      {/* Top Console Navigation & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-red-500/40">
            <Flame className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide text-slate-100 flex items-center gap-2">
              <span>Chaos Engineering & AI Cascade Engine</span>
              {hasIncident && (
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-950 border border-red-600/60 text-red-300 font-mono animate-pulse">
                  ACTIVE CASCADE IN PROGRESS
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Simulate microservice outages, predict graph-based downstream failure chains, and trigger self-healing.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("chaos")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "chaos"
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Chaos Injection Studio</span>
          </button>

          <button
            onClick={() => setActiveTab("cascade")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "cascade"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Cascade Path Visualizer</span>
            {hasIncident && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("playbooks")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "playbooks"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Playbooks</span>
            {hasIncident && (
              <span className="px-1.5 py-0.2 rounded bg-cyan-900 text-cyan-200 text-[10px]">
                {cascadeResult?.playbooks?.length || 2}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Chaos Injection Studio */}
      {activeTab === "chaos" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Preset Selector List */}
          <div className="md:col-span-2 space-y-2.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              SELECT PRESET CHAOS SCENARIO
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CHAOS_PRESETS.map((preset) => {
                const isSelected = selectedScenario.serviceId === preset.serviceId;
                return (
                  <div
                    key={preset.serviceId}
                    onClick={() => setSelectedScenario(preset)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all text-left ${
                      isSelected
                        ? "bg-slate-900/90 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-semibold">
                        {preset.badge}
                      </span>
                      <span className="text-[10px] font-mono text-red-400 font-bold">
                        {preset.severity}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 leading-snug">{preset.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {preset.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Trigger Box */}
          <div className="bg-gradient-to-br from-slate-900/90 to-[#120a10] p-4 rounded-xl border border-red-500/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block mb-1">
                TARGET SERVICE EXECUTION
              </span>
              <h4 className="text-sm font-bold text-white">{selectedScenario.title}</h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-mono">
                Target Node: <b className="text-cyan-400">{selectedScenario.serviceId}</b>
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-black/40 border border-slate-800 text-[11px] text-slate-400 font-mono">
                <span>Predicted Impact: Latency x200, downstream cascading timeouts, $13,700/min business loss.</span>
              </div>
            </div>

            <button
              onClick={() => {
                onInjectChaos(selectedScenario.serviceId, selectedScenario.scenario);
                setActiveTab("cascade");
              }}
              disabled={loading}
              className="mt-4 w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-900/50 hover:shadow-red-700/60 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-white animate-bounce" />
              <span>{loading ? "INJECTING CHAOS..." : "⚡ INJECT CHAOS / KILL NODE"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Cascade Path Visualizer */}
      {activeTab === "cascade" && (
        <div className="mt-4">
          {hasIncident && cascadeResult ? (
            <div className="space-y-4">
              {/* Top Blast Radius Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-red-500/30">
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" />
                    <span>FLEET BLAST RADIUS</span>
                  </span>
                  <span className="text-xl font-bold text-red-400 font-mono">
                    {cascadeResult.blast_radius_pct}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {cascadeResult.impacted_services.length} of 8 Services Impacted
                  </span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-500/30">
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-amber-400" />
                    <span>EST. REVENUE LOSS</span>
                  </span>
                  <span className="text-xl font-bold text-amber-300 font-mono">
                    ${cascadeResult.estimated_loss_per_min_usd.toLocaleString()}/min
                  </span>
                  <span className="text-[10px] text-slate-500 block">Transaction drop rate</span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" />
                    <span>IMPACTED USERS</span>
                  </span>
                  <span className="text-xl font-bold text-cyan-300 font-mono">
                    {cascadeResult.impacted_users_rps.toLocaleString()} req/s
                  </span>
                  <span className="text-[10px] text-slate-500 block">Active sessions affected</span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>TIME TO FLEET CRASH</span>
                  </span>
                  <span className="text-xl font-bold text-indigo-300 font-mono">
                    14 SECONDS
                  </span>
                  <span className="text-[10px] text-slate-500 block">Without auto-remediation</span>
                </div>
              </div>

              {/* Step-by-Step Cascade Timeline */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-200 tracking-wider font-mono uppercase block mb-3">
                  NETWORKX RISK PROPAGATION PATHWAYS (CALCULATED IN 0.12s)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {cascadeResult.cascade_chain_ordered.map((svc, idx) => (
                    <div
                      key={svc.service_id}
                      className={`p-3 rounded-xl border text-xs font-mono ${
                        idx === 0
                          ? "bg-red-950/60 border-red-500 shadow-md shadow-red-950/50"
                          : svc.cascade_probability > 75
                          ? "bg-amber-950/40 border-amber-500/60"
                          : "bg-slate-900/80 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-black/50 text-slate-200 font-bold">
                          {svc.stage.split(" ")[0]}
                        </span>
                        <span
                          className={`font-bold ${
                            svc.cascade_probability > 80 ? "text-red-400" : "text-amber-300"
                          }`}
                        >
                          {svc.cascade_probability}% RISK
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-100 text-xs truncate">{svc.name}</h5>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{svc.failure_mode}</p>
                      <div className="mt-2 text-[10px] text-slate-300 flex justify-between border-t border-slate-800/80 pt-1">
                        <span>Latency: {svc.projected_latency_ms}ms</span>
                        <span>Error: {svc.projected_error_rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-500">
              <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs">No active chaos injected yet. Go to Chaos Studio and click "Simulate Failure".</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Autonomous Playbooks */}
      {activeTab === "playbooks" && (
        <div className="mt-4">
          {hasIncident && cascadeResult?.playbooks?.length ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  AI-SYNTHESIZED RECOVERY RUNBOOKS (RANKED BY MTTR REDUCTION)
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Confidence Score: {cascadeResult.playbooks[0].confidence_score}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {cascadeResult.playbooks.map((pb) => (
                  <div
                    key={pb.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      pb.recommended
                        ? "bg-gradient-to-br from-cyan-950/40 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/40"
                        : "bg-slate-900/60 border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {pb.recommended ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>RECOMMENDED ACTION</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">ALTERNATIVE</span>
                        )}
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          Est. MTTR: {pb.estimated_recovery_time_sec}s
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-100">{pb.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{pb.summary}</p>

                      {/* Script Preview Box */}
                      <div className="mt-3 p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[10px] font-mono text-cyan-300/90 space-y-1">
                        {pb.actions.slice(0, 2).map((act, i) => (
                          <div key={i} className="truncate">
                            <span className="text-slate-500">$ </span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onExecuteHeal(cascadeResult.target_service_id, pb.id)}
                      className={`mt-4 w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
                        pb.recommended
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/30 hover:scale-[1.01]"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{pb.recommended ? "⚡ EXECUTE AUTONOMOUS SELF-HEALING" : "Execute Alternative"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-500">
              <Zap className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs">No active failures detected. All services operating with zero remediation required.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
