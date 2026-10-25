"use client";

import React from "react";
import {
  Layers,
  GitBranch,
  AlertOctagon,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  ShieldAlert
} from "lucide-react";

interface WelcomeHeaderProps {
  noiseReductionPct?: number;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  noiseReductionPct = 91.2,
}) => {
  return (
    <div className="w-full">
      {/* 4 Crisp, Distinct Executive Metric Cards (Not Merged) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Alert Noise Reduction */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-lg flex items-center justify-between transition-all hover:border-slate-700">
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              Noise Suppression
            </span>
            <span className="text-2xl font-black text-white mt-1 block font-mono">
              {noiseReductionPct}%
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>142 alerts grouped to 3</span>
            </span>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Canary Release Delta */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-lg flex items-center justify-between transition-all hover:border-slate-700">
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              Canary Release
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-amber-300 font-mono">v2.4.2</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                20% Rollout
              </span>
            </div>
            <span className="text-xs text-rose-400 font-semibold mt-1.5 block font-mono">
              +4.8% Regression Surge
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <GitBranch className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Active Incident Priority */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-red-500/40 shadow-lg shadow-red-950/20 flex items-center justify-between transition-all hover:border-red-500/60">
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              Active Incident
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-xs font-black animate-pulse font-mono">
                P1
              </span>
              <span className="text-xl font-bold text-white">Critical Surge</span>
            </div>
            <span className="text-xs text-red-300 font-medium mt-1.5 block">
              DB Connection Saturation
            </span>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Log Throughput */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-lg flex items-center justify-between transition-all hover:border-slate-700">
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              Log Ingestion Rate
            </span>
            <span className="text-2xl font-black text-white mt-1 block font-mono">
              88.6k <span className="text-xs font-normal text-slate-400">req/s</span>
            </span>
            <span className="text-xs text-sky-400 font-semibold mt-1.5 block font-mono">
              p99 Ingestion: 14.2ms
            </span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

      </div>
    </div>
  );
};
