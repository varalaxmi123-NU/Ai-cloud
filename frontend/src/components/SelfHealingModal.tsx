"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Zap,
  Clock,
  DollarSign,
  X,
  Sparkles,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";

interface SelfHealingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  actionId: string;
  terminalLogs: string[];
  executionTimeMs: number;
}

export const SelfHealingModal: React.FC<SelfHealingModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  actionId,
  terminalLogs,
  executionTimeMs,
}) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setVisibleLines(0);
      setIsCompleted(false);
      return;
    }

    // Sequentially reveal terminal logs for simulated execution stream
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleLines(current);
      if (current >= terminalLogs.length) {
        clearInterval(interval);
        setIsCompleted(true);
        // Trigger celebratory confetti burst!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#38bdf8", "#10b981", "#6366f1"],
          });
        } catch {
          // ignore
        }
      }
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen, terminalLogs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-[#070b16] shadow-2xl shadow-cyan-950/60 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080e1e]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Autonomous SRE Self-Healing Engine</span>
                {isCompleted && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40">
                    RESOLVED
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Remediating Target: <b className="text-cyan-300">{serviceId}</b> via {actionId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Terminal Stdout Execution Stream */}
        <div className="p-5 space-y-4">
          <div className="rounded-xl bg-[#03060c] border border-slate-800/90 p-4 font-mono text-xs text-slate-300 min-h-[220px] max-h-[260px] overflow-y-auto space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 pb-2 border-b border-slate-800">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>TERMINAL ORCHESTRATION DISPATCH (KUBERNETES & ISTIO MESH)</span>
            </div>

            {terminalLogs.slice(0, visibleLines).map((log, idx) => {
              const isLast = idx === terminalLogs.length - 1;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${
                    isLast && isCompleted ? "text-emerald-300 font-bold" : "text-slate-300"
                  }`}
                >
                  <span className="text-cyan-500 select-none">&gt;</span>
                  <span className="break-all">{log}</span>
                </div>
              );
            })}

            {!isCompleted && (
              <div className="flex items-center gap-2 text-cyan-400 animate-pulse text-xs">
                <span>_</span>
                <span>Executing automated zero-downtime cluster playbook...</span>
              </div>
            )}
          </div>

          {/* Results Summary Cards */}
          {isCompleted && (
            <div className="grid grid-cols-3 gap-3 font-mono text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-center">
                <span className="text-[10px] text-slate-400 block">TOTAL EXECUTION TIME</span>
                <span className="text-base font-bold text-emerald-400">
                  {executionTimeMs || 1240} ms
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-center">
                <span className="text-[10px] text-slate-400 block">DOWNTIME PREVENTED</span>
                <span className="text-base font-bold text-cyan-300">
                  38.2 mins
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30 text-center">
                <span className="text-[10px] text-slate-400 block">EST. REVENUE SAVED</span>
                <span className="text-base font-bold text-purple-300">
                  $184,200
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#080e1e] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cascade path neutralized. Cluster restored to green baseline.</span>
          </span>

          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
