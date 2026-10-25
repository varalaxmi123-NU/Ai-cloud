"use client";

import React from "react";
import {
  Layers,
  GitBranch,
  AlertOctagon,
  BarChart3,
  CheckCircle2
} from "lucide-react";

interface WelcomeHeaderProps {
  noiseReductionPct?: number;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  noiseReductionPct = 91.2,
}) => {
  return (
    <div className="w-full">
      {/* 4 Sleek High-Contrast KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Noise Reduction */}
        <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase block">
              Alert Noise Filter
            </span>
            <span className="text-2xl font-black text-white mt-0.5 block font-mono">
              {noiseReductionPct}%
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>142 alerts grouped to 3</span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Canary Deployment Health */}
        <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase block">
              Canary Release
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-amber-300 font-mono">v2.4.2</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                20% Rollout
              </span>
            </div>
            <span className="text-xs text-rose-400 font-semibold mt-1 block font-mono">
              +4.8% Regression Surge
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <GitBranch className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Active Incident Priority */}
        <div className="p-4 rounded-xl bg-[#111827] border border-red-500/30 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase block">
              Incident Severity
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-xs font-black animate-pulse font-mono">
                P1
              </span>
              <span className="text-xl font-bold text-white">Critical</span>
            </div>
            <span className="text-xs text-red-400 font-medium mt-1 block">
              DB Connection Saturation
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Ingested Log Throughput */}
        <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase block">
              Ingestion Rate
            </span>
            <span className="text-2xl font-black text-white mt-0.5 block font-mono">
              88.6k <span className="text-xs font-normal text-slate-400">req/s</span>
            </span>
            <span className="text-xs text-cyan-400 font-semibold mt-1 block font-mono">
              p99 Latency: 14.2ms
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
