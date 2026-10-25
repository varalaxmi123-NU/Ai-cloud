"use client";

import React from "react";
import {
  AlertOctagon,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Users,
  Cpu,
  BarChart2
} from "lucide-react";
import { calculatePriorityScores } from "@/lib/logGenerator";
import { IncidentPriorityScore } from "@/types/logAnalyzer";

export const IncidentPriorityMatrix: React.FC = () => {
  const scores: IncidentPriorityScore[] = calculatePriorityScores();

  return (
    <div className="w-full space-y-4 rounded-2xl border border-slate-800/80 bg-[#070b14]/95 backdrop-blur-xl p-5 shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Incident Impact &amp; Priority Scoring Matrix</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-600/50 text-[10px] font-mono">
                Multi-Factor Algorithmic Scoring
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Dynamically ranks incidents based on error growth rate, service criticality, blast radius, and business impact.
            </p>
          </div>
        </div>

        {/* Scoring Weights Formula Badge */}
        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-[10px] text-slate-400">
          <span className="text-slate-300 font-bold block mb-0.5">PRIORITY SCORING FORMULA:</span>
          <span>(Severity × 35%) + (Tier Criticality × 30%) + (Error Surge × 20%) + (User Volume × 15%)</span>
        </div>
      </div>

      {/* Priority Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scores.map((item) => (
          <div
            key={item.incidentId}
            className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 ${
              item.priority === "P1"
                ? "bg-gradient-to-br from-red-950/40 to-slate-900/90 border-red-500/60 shadow-lg shadow-red-950/40 ring-1 ring-red-500/40"
                : item.priority === "P2"
                ? "bg-slate-900/80 border-amber-500/40 shadow-lg shadow-amber-950/20"
                : "bg-slate-900/60 border-slate-800"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                    item.priority === "P1"
                      ? "bg-red-600 text-white animate-pulse"
                      : item.priority === "P2"
                      ? "bg-amber-600 text-white"
                      : "bg-purple-900 text-purple-200"
                  }`}
                >
                  {item.priority} CRITICALITY
                </span>

                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-500 block">IMPACT SCORE</span>
                  <span
                    className={`text-base font-bold ${
                      item.totalScore > 80 ? "text-red-400" : "text-amber-400"
                    }`}
                  >
                    {item.totalScore}/100
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-100 leading-snug">{item.title}</h4>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                Affected: <b className="text-slate-200">{item.affectedService}</b> ({item.serviceTier})
              </span>

              {/* Factor Contribution Bars */}
              <div className="space-y-1.5 mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Severity Factor</span>
                  <span className="font-bold text-slate-200">{item.factors.severityWeight}/35</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(item.factors.severityWeight / 35) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Service Criticality Factor</span>
                  <span className="font-bold text-slate-200">{item.factors.criticalityWeight}/30</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(item.factors.criticalityWeight / 30) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Error Surge Rate (+{item.growthRatePct}%)</span>
                  <span className="font-bold text-slate-200">{item.factors.growthWeight}/20</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${(item.factors.growthWeight / 20) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Impacted Users ({item.impactedUsersCount.toLocaleString()} req/s)</span>
                  <span className="font-bold text-slate-200">{item.factors.userBlastWeight}/15</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(item.factors.userBlastWeight / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* SLA & Action */}
            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Recommended SLA: <b className="text-indigo-300">{item.recommendedSLA}</b></span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">{item.actionRequired}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
