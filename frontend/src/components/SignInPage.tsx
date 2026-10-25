"use client";

import React, { useState } from "react";
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Activity,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  KeyRound
} from "lucide-react";
import { EnterpriseLogo } from "@/components/EnterpriseLogo";

interface SignInPageProps {
  onSuccess: () => void;
  onBackToWelcome: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onSuccess,
  onBackToWelcome,
}) => {
  const [email, setEmail] = useState<string>("company@gmail.com");
  const [password, setPassword] = useState<string>("1234");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      // Validate credentials
      if (email.trim().toLowerCase() === "company@gmail.com" && password === "1234") {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 800);
      } else {
        setLoading(false);
        setError("Invalid credentials. Please use company@gmail.com and password 1234.");
      }
    }, 600);
  };

  const handleFillDemo = () => {
    setEmail("company@gmail.com");
    setPassword("1234");
    setError(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0b0f19] text-white flex flex-col justify-center items-center px-4 py-12 selection:bg-cyan-500/30">
      {/* Background Lighting */}
      <div className="absolute inset-0 bg-ambient-mesh pointer-events-none" />
      <div className="absolute inset-0 bg-grid-cyber pointer-events-none opacity-40" />

      {/* Top action row right above the card */}
      <div className="relative z-10 w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={onBackToWelcome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#131b2e] hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Welcome</span>
        </button>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          SRE Command Portal
        </span>
      </div>

      {/* Sign In Card */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#111827] border border-slate-700/80 shadow-2xl shadow-cyan-950/20 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <EnterpriseLogo size={42} showText={false} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Sign In to CloudLog Enterprise
          </h2>
          <p className="text-xs text-slate-300">
            Enter your enterprise credentials to access the command center.
          </p>
        </div>

        {/* Demo Hint Banner */}
        <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200 flex items-center justify-between">
          <div>
            <span className="font-bold block text-white text-[11px]">DEMO CREDENTIALS:</span>
            <span className="font-mono text-cyan-300 text-xs">Email: company@gmail.com</span>
            <br />
            <span className="font-mono text-cyan-300 text-xs">Password: 1234</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 text-[11px] font-bold transition-all cursor-pointer"
          >
            Auto-Fill
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Credentials authenticated! Entering command center...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Work Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="company@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1e293b] border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/40 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1e293b] border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/40 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : success ? (
              <span className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Access Granted</span>
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
