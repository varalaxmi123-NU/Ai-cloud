"use client";

import React, { useState } from "react";
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Clock,
  Filter,
  CheckCircle2,
  Cpu,
  Sparkles
} from "lucide-react";
import { CorrelatedIncident } from "@/types/logAnalyzer";
import { getCorrelatedIncidents } from "@/lib/logGenerator";

interface AlertCorrelationViewProps {
  onInvestigateIncident?: (incident: CorrelatedIncident) => void;
}

export const AlertCorrelationView: React.FC<AlertCorrelationViewProps> = ({
  onInvestigateIncident,
}) => {
  const incidents = getCorrelatedIncidents();
  const [selectedIncident, setSelectedIncident] = useState<CorrelatedIncident>(incidents[0]);

  const totalRaw = incidents.reduce((acc, i) => acc + i.rawAlertsCount, 0);
  const totalSuppressed = incidents.reduce((acc, i) => acc + i.duplicateAlertsSuppressed, 0);
  const avgNoiseReduction = Math.round((totalSuppressed / totalRaw) * 100);

  return (
    <div className="w-full space-y-4 rounded-2xl border border-slate-800/80 bg-[#070b14]/95 backdrop-blur-xl p-5 shadow-2xl">
      {/* Top Banner: Deduplication & Noise Reduction Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Intelligent Alert Correlation Engine</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/50 text-[10px] font-mono">
                {avgNoiseReduction}% Noise Reduction Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Aggregating and deduplicating raw server error spikes across timestamps, error types, and service dependencies.
            </p>
          </div>
        </div>

        {/* Global Reduction KPI Chips */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">RAW ALERTS</span>
            <span className="font-bold text-red-400">{totalRaw}</span>
          </div>

          <div className="text-slate-600">&rarr;</div>

          <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">SUPPRESSED</span>
            <span className="font-bold text-emerald-400">{totalSuppressed}</span>
          </div>

          <div className="text-slate-600">&rarr;</div>

          <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-cyan-500/30 text-center">
            <span className="text-[10px] text-slate-500 block">CORRELATED</span>
            <span className="font-bold text-cyan-300">{incidents.length} Actionable</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Incident List) + Right (Incident Deep Dive) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Correlated Incident Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
            Correlated Incidents ({incidents.length})
          </span>

          {incidents.map((inc) => {
            const isSelected = selectedIncident.id === inc.id;
            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 rounded-xl border cursor-pointer transition-all text-xs font-mono space-y-2.5 ${
                  isSelected
                    ? "bg-slate-900/90 border-cyan-500/70 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        inc.priority === "P1"
                          ? "bg-red-600 text-white animate-pulse"
                          : inc.priority === "P2"
                          ? "bg-amber-600 text-white"
                          : "bg-purple-900 text-purple-200"
                      }`}
                    >
                      {inc.priority}
                    </span>
                    <span className="text-slate-400 text-[11px] font-bold">{inc.id}</span>
                  </div>

                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 text-[10px]">
                    {inc.noiseReductionPct}% noise filtered
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-100 font-sans leading-snug">
                  {inc.title}
                </h4>

                <p className="text-[11px] text-slate-400 font-sans line-clamp-2 leading-relaxed">
                  {inc.summary}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                  <span>Root: <b className="text-slate-300">{inc.rootService}</b></span>
                  <span>{inc.rawAlertsCount} alerts grouped</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Correlated Incident Deep Dive (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-700/60">
                  {selectedIncident.priority} • {selectedIncident.severity}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedIncident.id} • First seen {selectedIncident.firstSeenAt}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 font-sans">
                {selectedIncident.title}
              </h3>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-500 block">ERROR SURGE</span>
              <span className="text-sm font-bold text-red-400">
                {selectedIncident.errorRateSpike}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
            {selectedIncident.summary}
          </div>

          {/* Correlation Mechanism Visual Breakdown */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Correlated Multi-Service Dependency Chain
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {selectedIncident.affectedServices.map((svc, idx) => (
                <React.Fragment key={svc}>
                  <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                    svc === selectedIncident.rootService
                      ? "bg-red-950/60 border-red-500/60 text-red-300 font-bold"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}>
                    {svc === selectedIncident.rootService && (
                      <Flame className="w-3 h-3 text-red-400" />
                    )}
                    <span>{svc}</span>
                  </div>
                  {idx < selectedIncident.affectedServices.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Deduplication Statistics Box */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 to-cyan-950/20 border border-emerald-500/30 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Alert Fatigue Suppression Ratio</span>
              </span>
              <span className="font-bold text-emerald-300">{selectedIncident.noiseReductionPct}%</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Instead of spamming on-call SREs with {selectedIncident.rawAlertsCount} individual PagerDuty pings,
              ApexSRE collapsed them into a single coherent incident envelope, saving an estimated 24 engineer minutes.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-slate-800">
            <span className="text-slate-500">Correlation Algorithm: Graph-Adjacent Temporal Clustering</span>
            <button
              onClick={() => onInvestigateIncident && onInvestigateIncident(selectedIncident)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
            >
              Investigate Incident &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
