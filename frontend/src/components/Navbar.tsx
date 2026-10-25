"use client";

import React, { useState, useEffect } from "react";
import {
  EnterpriseLogo
} from "@/components/EnterpriseLogo";
import {
  Activity,
  Layers,
  GitBranch,
  AlertOctagon,
  Cpu,
  RotateCcw,
  Volume2,
  VolumeX,
  LogOut,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Menu,
  X,
  BrainCircuit,
  History
} from "lucide-react";
import { TopologyResponse } from "@/types/sre";

interface NavbarProps {
  topology: TopologyResponse | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onReset: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  topology,
  activeTab,
  onSelectTab,
  onReset,
  audioEnabled,
  onToggleAudio,
  onSignOut,
}) => {
  const [timeStr, setTimeStr] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const systemStatus = topology?.system_status || "HEALTHY";
  const isCritical = systemStatus === "CRITICAL_CASCADE_RISK";
  const isWarning = systemStatus === "ELEVATED_CASCADE_WARNING";

  const NAV_ITEMS = [
    { id: "logs", label: "Logs & Analyzer", icon: <Activity className="w-4 h-4" /> },
    { id: "investigator", label: "AI Investigator", icon: <BrainCircuit className="w-4 h-4" /> },
    { id: "replay", label: "Failure Replay", icon: <History className="w-4 h-4" /> },
    { id: "incidents", label: "Incidents", icon: <AlertOctagon className="w-4 h-4" /> },
    { id: "regression", label: "Deployments", icon: <GitBranch className="w-4 h-4" /> },
    { id: "topology", label: "Topology", icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#0c121e]/95 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Brand Logo */}
        <div
          className="shrink-0 cursor-pointer"
          onClick={() => {
            onSelectTab("logs");
            setMobileMenuOpen(false);
          }}
        >
          <EnterpriseLogo size={32} />
        </div>

        {/* Center: Desktop Segmented Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#141d2e] p-1 rounded-xl border border-slate-800 shadow-inner">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Status Badge, Controls, Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Cluster Health Pill (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center">
            {isCritical ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500 text-red-200 text-xs font-bold animate-pulse">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span>Outage</span>
              </div>
            ) : isWarning ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500 text-amber-200 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Degraded</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141d2e] border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
                <span className="hidden lg:inline">Cluster Healthy</span>
                <span className="text-[10px] text-slate-400 font-mono hidden xl:inline">• 8 Pods</span>
              </div>
            )}
          </div>

          {/* UTC Clock (Desktop only) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-[#141d2e] px-2.5 py-1 rounded-lg border border-slate-800">
            <Radio className="w-3 h-3 text-sky-400" />
            <span>{timeStr}</span>
          </div>

          {/* Audio Alert Toggle */}
          <button
            onClick={onToggleAudio}
            title={audioEnabled ? "Mute Alert Audio" : "Enable Alert Audio"}
            className="p-1.5 sm:p-2 rounded-lg bg-[#141d2e] border border-slate-800 text-slate-400 hover:text-sky-300 hover:border-slate-700 transition-colors cursor-pointer"
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reset Baseline */}
          <button
            onClick={onReset}
            title="Reset All Microservices to Normal Baseline"
            className="p-1.5 sm:p-2 rounded-lg bg-[#141d2e] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle (< 768px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#141d2e] border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Quick-Tab Strip (< 768px, single tap navigation) */}
      <div className="md:hidden w-full overflow-x-auto no-scrollbar flex items-center gap-1 px-4 py-2 bg-[#0a0f1d] border-t border-slate-800/80">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30"
                  : "text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Dropdown Drawer (when hamburger clicked) */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 bg-[#0c1220] border-t border-slate-800 space-y-2 animate-fadeIn">
          <div className="pb-2 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Cluster Status: <b className="text-emerald-400">Healthy (8 Pods)</b></span>
            <span>UTC: {timeStr}</span>
          </div>

          <div className="space-y-1 pt-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    isActive
                      ? "bg-sky-500 text-slate-950 font-bold"
                      : "text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
