"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Flame,
  RotateCcw,
  BookOpen,
  Volume2,
  VolumeX,
  Server,
  Sparkles,
  Zap
} from "lucide-react";
import { TopologyResponse } from "@/types/sre";

interface NavbarProps {
  topology: TopologyResponse | null;
  onReset: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  topology,
  onReset,
  audioEnabled,
  onToggleAudio,
}) => {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour12: false }) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const systemStatus = topology?.system_status || "HEALTHY";
  const isCritical = systemStatus === "CRITICAL_CASCADE_RISK";
  const isWarning = systemStatus === "ELEVATED_CASCADE_WARNING";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080d1a]/90 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Concept */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isCritical ? "bg-red-400" : isWarning ? "bg-amber-400" : "bg-emerald-400"
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
              }`} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 text-lg">
                ApexSRE
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-300 bg-cyan-950/80 border border-cyan-700/50 rounded">
                AUTONOMOUS CASCADE PREDICTOR
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <Server className="w-3 h-3 text-slate-400" />
              <span>CLUSTER: prod-us-east-mesh</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400">8 MICROSERVICES</span>
            </p>
          </div>
        </div>

        {/* Center: Real-Time Cluster Health Indicator */}
        <div className="flex items-center">
          {isCritical ? (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-red-950/70 border border-red-500/60 shadow-lg shadow-red-900/40 animate-pulse">
              <Flame className="w-4 h-4 text-red-400 animate-bounce" />
              <span className="text-xs font-bold tracking-wider text-red-200">
                CRITICAL CASCADE RISK IN PROGRESS
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 font-mono font-semibold">
                BLAST RADIUS {topology?.active_chaos?.cascade_result?.blast_radius_pct || 75}%
              </span>
            </div>
          ) : isWarning ? (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/50 shadow-lg shadow-amber-950/30">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold tracking-wider text-amber-200">
                ELEVATED CASCADE RISK • LATENCY DEGRADATION
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/40 shadow-sm shadow-emerald-950/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-wider text-emerald-300">
                ALL 8 SERVICES NOMINAL • ZERO CASCADES DETECTED
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                HEALTH: {topology?.summary.overall_health_score ?? 99.4}%
              </span>
            </div>
          )}
        </div>

        {/* Right: Telemetry Stats & Actions */}
        <div className="flex items-center gap-3">
          {/* MTTR / MTTD indicators */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">PREDICT MTTD</span>
              <span className="text-cyan-400 font-bold">1.4s</span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <span className="text-slate-400 text-[10px] block">AUTO MTTR</span>
              <span className="text-emerald-400 font-bold">4.2s</span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <span className="text-slate-400 text-[10px] block">THROUGHPUT</span>
              <span className="text-slate-200 font-semibold">
                {(topology?.summary.total_rps || 98000).toLocaleString()} req/s
              </span>
            </div>
          </div>

          {/* Clock */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{timeStr || "12:00:00 UTC"}</span>
          </div>

          {/* Audio Alert Toggle */}
          <button
            onClick={onToggleAudio}
            title={audioEnabled ? "Mute Alert Audio" : "Enable Alert Audio"}
            className="p-2 rounded-lg bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-700/50 transition-colors"
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reset Cluster Button */}
          <button
            onClick={onReset}
            title="Reset All Microservices to Normal Baseline"
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Baseline</span>
          </button>
        </div>
      </div>
    </header>
  );
};
