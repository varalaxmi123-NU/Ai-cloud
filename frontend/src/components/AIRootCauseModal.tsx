"use client";

import React, { useState } from "react";
import {
  BrainCircuit,
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Terminal,
  ShieldAlert,
  ArrowRight,
  Layers,
  Cpu
} from "lucide-react";
import { CloudLog, AIRootCauseAnalysis } from "@/types/logAnalyzer";
import { generateAIRootCause } from "@/lib/logGenerator";

interface AIRootCauseModalProps {
  log: CloudLog | null;
  onClose: () => void;
}

export const AIRootCauseModal: React.FC<AIRootCauseModalProps> = ({
  log,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!log) return null;

  const analysis: AIRootCauseAnalysis = generateAIRootCause(log);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(analysis.remediationScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-2xl border border-indigo-500/40 bg-[#070b16] shadow-2xl shadow-indigo-950/60 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#090e1f] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 text-indigo-300 border border-indigo-500/50 shrink-0">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex flex-wrap items-center gap-2">
                <span>AI-Powered Root-Cause Assistant</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/40 font-semibold">
                  {analysis.confidenceScore}% Evidence Match
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Target Error on <b className="text-cyan-300">{log.service}</b> (Trace ID: {log.traceId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Unified Hybrid SRE AI Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-[11px] font-mono text-indigo-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hybrid SRE AI</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Raw Error Banner */}
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 font-mono space-y-1">
            <div className="flex justify-between text-[10px] text-red-400 font-bold uppercase">
              <span>{log.level} INGESTION SIGNATURE</span>
              <span>HTTP {log.statusCode}</span>
            </div>
            <p className="text-sm font-bold text-white break-all">{log.message}</p>
            {log.exceptionType && (
              <span className="text-[11px] text-red-400 block font-mono">{log.exceptionType}</span>
            )}
          </div>

          {/* Root Cause Summary Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-[11px] uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Root Cause Diagnosis (Hybrid LLM Synthesis &amp; Pattern Matching)</span>
            </div>
            <h4 className="text-sm font-bold text-slate-100">{analysis.rootCauseSummary}</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
              {analysis.detailedAnalysis}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className="text-slate-500">Affected Components:</span>
              {analysis.affectedComponents.map((comp, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-semibold"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Troubleshooting Steps */}
          <div className="space-y-2">
            <span className="text-slate-400 text-[11px] font-mono uppercase tracking-wider block font-bold">
              Recommended Troubleshooting &amp; Mitigation Steps
            </span>
            <div className="space-y-2">
              {analysis.recommendedSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Executable Remediation Script */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-mono uppercase tracking-wider block font-bold">
                Automated Runbook Command (One-Click)
              </span>
              <button
                onClick={handleCopyScript}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? "Copied to Clipboard!" : "Copy Command"}</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-[#03060c] border border-slate-800 font-mono text-xs text-cyan-300/90 break-all">
              <span className="text-slate-500 select-none">$ </span>
              <span>{analysis.remediationScript}</span>
            </div>
          </div>

          {/* Stack Trace Collapsible */}
          {log.stackTrace && (
            <div className="space-y-2">
              <span className="text-slate-400 text-[11px] font-mono uppercase tracking-wider block font-bold">
                Captured Exception Stack Trace
              </span>
              <pre className="p-3 rounded-xl bg-[#03060c] border border-slate-800/80 font-mono text-[10px] text-red-300/80 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {log.stackTrace}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#090e1f] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Model: {analysis.engineUsed}
          </span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
