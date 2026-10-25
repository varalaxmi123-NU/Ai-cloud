"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  ShieldCheck,
  Flame,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  Server,
  Radio,
  LogOut
} from "lucide-react";
import { TopologyResponse } from "@/types/sre";

interface NavbarProps {
  topology: TopologyResponse | null;
  onReset: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  topology,
  onReset,
  audioEnabled,
  onToggleAudio,
  onSignOut,
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur-md px-6 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20 text-white">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-white text-lg tracking-tight">
                CloudLog <span className="text-cyan-400">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide text-cyan-300 bg-cyan-950/90 border border-cyan-700/60 rounded-md">
                SRE OBSERVABILITY v2.4
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-slate-400">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                <span>prod-us-east-cluster</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold">8 Services Online</span>
            </p>
          </div>
        </div>

        {/* Center: System Status Pill */}
        <div className="flex items-center">
          {isCritical ? (
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-950/90 border border-red-500 shadow-lg shadow-red-950/60 animate-pulse">
              <Flame className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold tracking-wide text-red-200">
                CRITICAL CASCADE DETECTED: 87.5% FLEET BLAST RADIUS
              </span>
            </div>
          ) : isWarning ? (
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-950/90 border border-amber-500 shadow-md shadow-amber-950/40">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold tracking-wide text-amber-200">
                ELEVATED RISK: UPSTREAM LATENCY SURGE
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/50 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-emerald-300">
                All 8 Microservices Operational
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                99.4% HEALTH
              </span>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Real-time stats chip */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">THROUGHPUT</span>
              <span className="text-white font-bold">{(topology?.summary?.total_rps || 88650).toLocaleString()} req/s</span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <span className="text-slate-400 text-[10px] block">MTTR (AUTO)</span>
              <span className="text-emerald-400 font-bold">1.2s</span>
            </div>
          </div>

          {/* Clock */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-200 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{timeStr || "12:00:00 UTC"}</span>
          </div>

          {/* Audio Alert Toggle */}
          <button
            onClick={onToggleAudio}
            title={audioEnabled ? "Mute Alert Audio" : "Enable Alert Audio"}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reset Baseline */}
          <button
            onClick={onReset}
            title="Reset All Microservices to Normal Baseline"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Baseline</span>
          </button>

          {/* User & Sign Out */}
          {onSignOut && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="text-[11px] font-mono text-cyan-300 hidden xl:inline">
                company@gmail.com
              </span>
              <button
                onClick={onSignOut}
                title="Sign Out to Welcome Page"
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
