"use client";

import React from "react";
import {
  Activity,
  Search,
  Layers,
  GitBranch,
  AlertOctagon,
  Cpu,
  BarChart3,
  TrendingDown,
  Clock,
  Sparkles,
  CheckCircle2
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
    <div className="w-full space-y-5">
      {/* 4 Sleek High-Contrast KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Noise Reduction */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase block">
              Noise Reduction
            </span>
            <span className="text-2xl font-black text-white mt-0.5 block">
              {noiseReductionPct}%
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>142 alerts grouped to 3</span>
            </span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Canary Deployment Health */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase block">
              Canary Release
            </span>
            <span className="text-2xl font-black text-amber-300 mt-0.5 block flex items-center gap-2">
              <span>v2.4.2</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                20% Traffic
              </span>
            </span>
            <span className="text-xs text-rose-400 font-medium mt-1 block font-mono">
              +4.8% Regression Spike
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <GitBranch className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Active Incident Priority */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-red-500/30 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase block">
              Active Priority
            </span>
            <span className="text-2xl font-black text-white mt-0.5 block flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-sm font-bold animate-pulse">
                P1
              </span>
              <span>Critical</span>
            </span>
            <span className="text-xs text-red-400 font-medium mt-1 block">
              DB Connection Saturation
            </span>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertOctagon className="w-6 h-6 animate-bounce" />
          </div>
        </div>

        {/* Card 4: Ingested Log Throughput */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase block">
              Stream Ingestion
            </span>
            <span className="text-2xl font-black text-white mt-0.5 block">
              88.6k <span className="text-sm font-normal text-slate-400">events/s</span>
            </span>
            <span className="text-xs text-cyan-400 font-medium mt-1 block font-mono">
              p99 Latency: 14.2ms
            </span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Feature Segmented Tab Navigation Bar */}
      <div className="p-1.5 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => onSelectTab("logs")}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "logs"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Activity className="w-4 h-4 text-cyan-300" />
          <span>Real-Time Logs &amp; Anomaly</span>
        </button>

        <button
          onClick={() => onSelectTab("nlp-search")}
          className={`flex-1 min-w-[190px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "nlp-search"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Search className="w-4 h-4 text-indigo-300" />
          <span>NLP Log Search</span>
        </button>

        <button
          onClick={() => onSelectTab("correlation")}
          className={`flex-1 min-w-[190px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "correlation"
              ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Layers className="w-4 h-4 text-amber-300" />
          <span>Alert Correlation (91%)</span>
        </button>

        <button
          onClick={() => onSelectTab("regression")}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "regression"
              ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <GitBranch className="w-4 h-4 text-rose-300" />
          <span>Deployment Regression</span>
        </button>

        <button
          onClick={() => onSelectTab("priority")}
          className={`flex-1 min-w-[190px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "priority"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-purple-300" />
          <span>Impact Priority Matrix</span>
        </button>

        <button
          onClick={() => onSelectTab("topology")}
          className={`flex-1 min-w-[190px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "topology"
              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Cpu className="w-4 h-4 text-cyan-300" />
          <span>Microservice Mesh &amp; Chaos</span>
        </button>
      </div>
    </div>
  );
};
