"use client";

import React from "react";
import {
  Sparkles,
  X,
  Flame,
  Zap,
  CheckCircle2,
  Trophy,
  Mic,
  Cpu,
  Layers,
  BrainCircuit,
  DollarSign
} from "lucide-react";

interface PresentationGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationGuide: React.FC<PresentationGuideProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-2xl border border-yellow-500/40 bg-[#070b16] shadow-2xl shadow-yellow-950/40 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-yellow-950/40 via-[#0a0f22] to-cyan-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>ApexSRE — Competition Winning Pitch Deck</span>
                <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-[10px] font-mono border border-yellow-500/40 font-bold">
                  HACKATHON GUIDE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Use this step-by-step 2-minute demo flow on stage to wow judges and win first place.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Pitch Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Section 1: The Hook */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-wider mb-2 font-mono">
              <Mic className="w-4 h-4" />
              <span>1. The Winning Opening Hook (Say this first!)</span>
            </div>
            <p className="italic text-slate-100 font-medium bg-black/40 p-3 rounded-lg border-l-4 border-yellow-400 text-sm">
              &ldquo;Judges, when one microservice crashes at 2 AM, it usually takes down the whole platform before engineers even wake up. Today, modern microservice architectures have dozens of hidden cyclic dependencies. Meet <strong>ApexSRE</strong>: the autonomous microservice chaos & cascade predictor.&rdquo;
            </p>
          </div>

          {/* Section 2: 3-Minute Live Stage Demo Flow */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Layers className="w-4 h-4" />
              <span>2. Killer Feature Demo Walkthrough (Do these 4 clicks)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-bold text-cyan-300 block mb-1">Click 1: Show Baseline Topology</span>
                <p className="text-slate-400">
                  Point at the 8 connected microservices. Show live traffic particle flows and the Scikit-learn anomaly score at 2.4% (Normal).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-red-500/30">
                <span className="font-bold text-red-400 block mb-1">Click 2: Inject Database Chaos</span>
                <p className="text-slate-400">
                  Click <strong>&quot;⚡ INJECT CHAOS / KILL NODE&quot;</strong> on Database. Watch the dependency graph turn glowing crimson and traffic turn to rapid warning lasers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/30">
                <span className="font-bold text-amber-300 block mb-1">Click 3: Show NetworkX Cascade Path</span>
                <p className="text-slate-400">
                  Show the predicted propagation: T+0s (Postgres deadlock) &rarr; T+3s (Payment timeout) &rarr; T+7s (API Gateway 504). Highlight estimated revenue loss ($13,700/min).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/30">
                <span className="font-bold text-emerald-400 block mb-1">Click 4: One-Click Autonomous Self-Healing</span>
                <p className="text-slate-400">
                  Click <strong>&quot;⚡ EXECUTE AUTONOMOUS SELF-HEALING&quot;</strong>. Watch the terminal Kubernetes/Istio failover playbook execute and restore all nodes to green in 1.2s!
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Why This Wins (The Tech Pillars) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/40">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2 font-mono">
              <BrainCircuit className="w-4 h-4" />
              <span>3. Why This Wins Against Other Teams</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-3">
              <div className="bg-black/40 p-2.5 rounded-lg border border-slate-800">
                <b className="text-cyan-300 block mb-0.5">1. Advanced Graph Theory</b>
                <span className="text-slate-400">NetworkX directed DAG traversal for multi-hop failure cascade propagation.</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-lg border border-slate-800">
                <b className="text-indigo-300 block mb-0.5">2. Machine Learning</b>
                <span className="text-slate-400">Scikit-learn IsolationForest anomaly engine analyzing real multi-dimensional telemetry.</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-lg border border-slate-800">
                <b className="text-emerald-300 block mb-0.5">3. Enterprise SRE UI</b>
                <span className="text-slate-400">Next.js + Tailwind + glassmorphism cyber command center ready for production.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#080e1e] flex items-center justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-slate-950 transition-colors shadow-md shadow-yellow-500/20"
          >
            Got It, Let&apos;s Present!
          </button>
        </div>
      </div>
    </div>
  );
};
