"use client";

import React from "react";
import {
  Activity,
  ShieldCheck,
  Zap,
  Search,
  GitBranch,
  Layers,
  AlertOctagon,
  Sparkles,
  TrendingDown,
  Clock,
  CheckCircle2,
  Cpu,
  BarChart3
} from "lucide-react";

interface WelcomeHeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  rawAlertsCount?: number;
  noiseReductionPct?: number;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  activeTab,
  onSelectTab,
  rawAlertsCount = 142,
  noiseReductionPct = 91.2,
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Executive Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#091224] via-[#0b162c] to-[#070b14] p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-950 text-cyan-300 border border-cyan-700/60 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Next-Gen Observability Suite</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-700/40">
                PROD CLUSTER v2.4
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              AI-Powered Cloud Log Analyzer{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">
                & Alert System
              </span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Autonomous real-time log ingestion, statistical anomaly detection, AI-assisted root-cause diagnosis,
              intelligent alert correlation, and deployment regression prevention across distributed microservices.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
            <div className="flex-1 sm:flex-initial p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[110px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">NOISE REDUCTION</span>
              <span className="text-lg font-mono font-black text-cyan-300">
                {noiseReductionPct}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">Deduplicated</span>
            </div>

            <div className="flex-1 sm:flex-initial p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[110px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">CANARY STATUS</span>
              <span className="text-lg font-mono font-black text-amber-400 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>v2.4.2</span>
              </span>
              <span className="text-[10px] text-red-400 font-mono block">+4.8% Err Delta</span>
            </div>

            <div className="flex-1 sm:flex-initial p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[110px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">ACTIVE INCIDENTS</span>
              <span className="text-lg font-mono font-black text-red-400">
                1 Critical
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">P1 Escalation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
        <button
          onClick={() => onSelectTab("logs")}
          className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "logs"
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-lg shadow-cyan-950/40"
              : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-Time Logs & Anomaly Detection</span>
        </button>

        <button
          onClick={() => onSelectTab("nlp-search")}
          className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "nlp-search"
              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/60 shadow-lg shadow-indigo-950/40"
              : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Search className="w-3.5 h-3.5 text-indigo-400" />
          <span>Natural-Language Log Search</span>
        </button>

        <button
          onClick={() => onSelectTab("correlation")}
          className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "correlation"
              ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-950/40"
              : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Alert Correlation (Noise Reduction)</span>
        </button>

        <button
          onClick={() => onSelectTab("regression")}
          className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "regression"
              ? "bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-lg shadow-rose-950/40"
              : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-rose-400" />
          <span>Deployment Regression Detection</span>
        </button>

        <button
          onClick={() => onSelectTab("priority")}
          className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "priority"
              ? "bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-lg shadow-purple-950/40"
              : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-purple-400" />
          <span>Incident Impact & Priority Scoring</span>
        </button>

        <button
          onClick={() => onSelectTab("topology")}
          className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "topology"
              ? "bg-blue-500/20 text-blue-300 border-blue-500/60 shadow-lg shadow-blue-950/40"
              : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>Microservice Topology & Chaos Predictor</span>
        </button>
      </div>
    </div>
  );
};
