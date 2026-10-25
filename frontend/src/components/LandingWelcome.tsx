"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  GitBranch,
  Terminal,
  Search,
  AlertOctagon,
  Cpu,
  CheckCircle2,
  Database,
  Server,
  KeyRound,
  ExternalLink,
  Zap,
  SlidersHorizontal,
  Clock,
  Upload,
  History,
  BrainCircuit
} from "lucide-react";
import { EnterpriseLogo } from "@/components/EnterpriseLogo";

interface LandingWelcomeProps {
  onGetStarted: (initialTab?: string) => void;
}

export const LandingWelcome: React.FC<LandingWelcomeProps> = ({ onGetStarted }) => {

  return (
    <div className="relative min-h-screen w-full bg-[#070b14] text-white flex flex-col justify-between overflow-x-hidden selection:bg-sky-500/30">
      {/* Ambient Lighting & High-Tech Grid */}
      <div className="absolute inset-0 bg-ambient-mesh pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] rounded-full bg-gradient-to-b from-sky-500/10 via-indigo-500/5 to-transparent blur-[160px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <EnterpriseLogo size={36} />

          <div className="flex items-center gap-3">
            {/* Direct Sign In CTA */}
            <button
              onClick={() => onGetStarted("dashboard")}
              className="text-xs font-bold px-4 py-2 rounded-xl text-white bg-sky-600 hover:bg-sky-500 transition-all cursor-pointer shadow-md shadow-sky-600/30"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
        
        {/* Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0f172a] border border-slate-700/80 text-slate-200 text-xs font-semibold mb-6 shadow-xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="text-slate-400 font-normal">CloudLog Platform v2.4</span>
          <span className="text-slate-600">•</span>
          <span className="text-sky-300">Log File Analysis &amp; SRE Incident Investigator</span>
        </div>

        {/* Hero Headline */}
        <div className="text-center max-w-4xl space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Next-Generation{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400">
              Cloud Log Intelligence
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Upload log files (.log, .txt, .json, .csv) to detect critical errors, investigate cascading failure chains, and deduce evidence-backed root causes with precision.
          </p>
        </div>

        {/* Call to Action Button Row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => onGetStarted("logs")}
            className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-base tracking-wide shadow-2xl shadow-sky-500/30 transition-all hover:scale-[1.03] cursor-pointer flex items-center gap-3"
          >
            <Upload className="w-5 h-5 text-white" />
            <span>Upload Logs &amp; Analyze</span>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onGetStarted("logs")}
            className="px-6 py-4 rounded-2xl bg-[#0f172a] hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-sky-400" />
            <span>Try Scenario A (Postgres Outage)</span>
          </button>
        </div>

        {/* 5-Step Guided Process Workflow Banner */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono text-slate-400">
          <span className="px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-800 text-sky-300 font-bold">
            1. Upload Logs
          </span>
          <span>&rarr;</span>
          <span className="px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-800 text-amber-300 font-bold">
            2. Analyze Errors
          </span>
          <span>&rarr;</span>
          <span className="px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-800 text-purple-300 font-bold">
            3. Investigate Cause
          </span>
          <span>&rarr;</span>
          <span className="px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-800 text-rose-300 font-bold">
            4. Replay Failure
          </span>
          <span>&rarr;</span>
          <span className="px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-800 text-emerald-300 font-bold">
            5. Track Incident
          </span>
        </div>

        {/* Enterprise Architecture & Core Capabilities Showcase (Graph-Free Welcome Showcase) */}
        <div className="mt-12 w-full max-w-5xl rounded-3xl border border-slate-800 bg-[#0c1220]/90 shadow-2xl shadow-black/80 p-6 md:p-8 backdrop-blur-xl">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-mono font-bold uppercase tracking-wider">
              3-Pillar SRE Architecture
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              From Raw Logs to Autonomous Incident Resolution
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Upload log files, discover causal error progressions, and replay failures before production outages impact users.
            </p>
          </div>

          {/* 3 Core Architecture Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pillar 1: Ingestion & Parser */}
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Log Analyzer Engine</h3>
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold">
                    Pillar 01
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Drag and drop <b className="text-slate-200">.log, .txt, .json, .csv</b> files or paste raw text. Instantly parses log lines and extracts:
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>Critical error detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Warning threshold alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>Root cause deduction &amp; fixes</span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Multi-format</span>
                <span className="text-sky-400 font-bold">Client-Side Parser</span>
              </div>
            </div>

            {/* Pillar 2: AI Incident Investigator */}
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">AI Incident Investigator</h3>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                    Pillar 02
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Synthesizes disconnected error logs into a single causal timeline:
                </p>
                <div className="mt-3 p-2.5 rounded-xl bg-[#0a0e1a] border border-slate-800 text-[11px] font-mono space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-purple-400 font-bold">10:00</span>
                    <span>DB response latency up</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-purple-400 font-bold">10:01</span>
                    <span>Connection pool exhausted</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-rose-400 font-bold">10:02</span>
                    <span>504 API requests failing</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Confidence Gauge</span>
                <span className="text-purple-400 font-bold">Evidence-Corroborated</span>
              </div>
            </div>

            {/* Pillar 3: Failure Replay & Prevention Engine */}
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <History className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Failure Replay Engine</h3>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                    Pillar 03
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Reconstructs the failure timeline with an interactive scrubber and dynamic cascade mesh:
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Scrubber: 1x, 2x, 5x speed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>4-node cascade blast radius</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Architectural prevention guides</span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Prevention SRE</span>
                <span className="text-emerald-400 font-bold">Zero Reoccurrence</span>
              </div>
            </div>
          </div>

          {/* Bottom Call to Action Bar */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-[#0f172a] to-indigo-950/40 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-slate-200 font-medium">
                Ready to analyze logs or investigate an outage?
              </span>
            </div>
            <button
              onClick={() => onGetStarted("dashboard")}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-sky-600/30 flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Observability Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Enterprise Bento Grid: Core Capabilities */}
        <div className="mt-20 w-full">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Enterprise Observability Built for SRE Resilience
            </h2>
            <p className="text-sm text-slate-400">
              Six synchronized operational layers designed to eliminate outage downtime before users notice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Real-Time Log Ingestion &amp; Outliers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Buffer distributed logs with sub-millisecond overhead. Automatically detects statistical error rate anomalies with configurable Z-score thresholds.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Threshold: 3.5% Surge</span>
                <span className="text-sky-400 font-semibold">Active Engine</span>
              </div>
            </div>

            {/* Feature 2: AI Incident Investigator */}
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">AI Incident Investigator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects related cascading errors into a chronological evidence timeline. Identifies true root causes with confidence scoring and supporting log proof.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Evidence Reasoning</span>
                <span className="text-purple-400 font-semibold">Calculated Score</span>
              </div>
            </div>

            {/* Feature 3: Deployment Regression Detection */}
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Deployment Regression Detection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compares error velocity before and after release deployment. Detects canary regressions and outputs safe, verified rollback commands (e.g. kubectl rollout undo) for engineering review.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>v2.4.1 vs v2.4.2</span>
                <span className="text-amber-400 font-semibold">Safe Rollback Runbook</span>
              </div>
            </div>

            {/* Feature 4: Natural Language Log Search */}
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Natural-Language Log Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ask questions in plain English (&quot;What caused the most failures?&quot;). Provides semantic answers and filtered diagnostic event sets.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Semantic Synthesis</span>
                <span className="text-sky-400 font-semibold">Direct Answers</span>
              </div>
            </div>

            {/* Feature 5: Failure Replay & Prevention Engine */}
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Failure Replay &amp; Prevention Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive step-by-step player reconstructing outage progression. Delivers architectural prevention playbooks (circuit breaking, pooling, rate limits).
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Step-by-Step Replay</span>
                <span className="text-rose-400 font-semibold">Prevention Engine</span>
              </div>
            </div>

            {/* Feature 6: Incident Management & Tracking */}
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Incident Management &amp; Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track, triage, and mark production incident tickets as resolved. Includes severity scoring, affected components, and verified solutions.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>P1 &rarr; P4 Lifecycle</span>
                <span className="text-emerald-400 font-semibold">Resolution Tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Distributed Stack Support Banner */}
        <div className="mt-16 w-full max-w-4xl p-6 rounded-2xl bg-[#0c1220] border border-slate-800/80 text-center space-y-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
            Engineered For Modern Microservice Architectures
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-300">
            <span className="px-3 py-1.5 rounded-lg bg-[#141d2e] border border-slate-700">PostgreSQL</span>
            <span className="px-3 py-1.5 rounded-lg bg-[#141d2e] border border-slate-700">Envoy Proxy</span>
            <span className="px-3 py-1.5 rounded-lg bg-[#141d2e] border border-slate-700">Redis Cluster</span>
            <span className="px-3 py-1.5 rounded-lg bg-[#141d2e] border border-slate-700">OAuth2 Gateway</span>
            <span className="px-3 py-1.5 rounded-lg bg-[#141d2e] border border-slate-700">Kafka Pipelines</span>
            <span className="px-3 py-1.5 rounded-lg bg-[#141d2e] border border-slate-700">Kubernetes &amp; Docker</span>
          </div>
        </div>

        {/* Final Call to Action Box */}
        <div className="mt-14 w-full max-w-3xl p-8 rounded-3xl bg-gradient-to-r from-sky-950/60 via-indigo-950/50 to-slate-900 border border-sky-500/30 text-center space-y-4 shadow-2xl">
          <h3 className="text-2xl font-black text-white tracking-tight">
            Ready to Inspect Distributed Production Logs?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Access the live command center with sample microservice telemetry and self-healing runbooks.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onGetStarted("dashboard")}
              className="px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-sky-500/30 transition-all hover:scale-[1.02] cursor-pointer inline-flex items-center gap-2"
            >
              <span>Get Started with CloudLog</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-[#070b14] py-6 px-6 mt-16 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between max-w-7xl mx-auto">
        <span>&copy; 2026 CloudLog Systems, Inc. All rights reserved.</span>
        <span className="font-mono text-slate-400">Enterprise Cloud Observability &amp; SRE Resilience</span>
      </footer>
    </div>
  );
};
