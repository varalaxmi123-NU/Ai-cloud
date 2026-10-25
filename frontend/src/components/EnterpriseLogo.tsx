"use client";

import React from "react";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const EnterpriseLogo: React.FC<LogoProps> = ({
  size = 34,
  showText = true,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Precision Geometric Isometric Infrastructure Prism - Pure Enterprise SaaS */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 p-1.5 border border-slate-700/80 shadow-md shadow-black/40"
        style={{ width: size + 8, height: size + 8 }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow"
        >
          <defs>
            {/* Top Plane: Electric Sky */}
            <linearGradient id="facet-top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Left Plane: Deep Sapphire */}
            <linearGradient id="facet-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>

            {/* Right Plane: Dark Indigo Carbon */}
            <linearGradient id="facet-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Isometric Cube Geometry */}
          {/* Top Diamond Facet */}
          <path
            d="M18 3L32 11L18 19L4 11Z"
            fill="url(#facet-top)"
            stroke="#38bdf8"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Left Vertical Facet */}
          <path
            d="M4 11L18 19V33L4 25Z"
            fill="url(#facet-left)"
            stroke="#1d4ed8"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Right Vertical Facet */}
          <path
            d="M18 19L32 11V25L18 33Z"
            fill="url(#facet-right)"
            stroke="#334155"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Precision Center Node Grid */}
          <path
            d="M18 9L26 13.5L18 18L10 13.5Z"
            fill="#ffffff"
            fillOpacity="0.28"
          />
          <circle cx="18" cy="19" r="2.2" fill="#38bdf8" />
          <circle cx="18" cy="19" r="1" fill="#ffffff" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-extrabold text-white text-base sm:text-lg tracking-tight leading-none">
              Cloud<span className="text-sky-400">Log</span>
            </span>
            <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold tracking-widest text-slate-300 bg-slate-800 border border-slate-700/80 rounded">
              ENTERPRISE
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 tracking-wider font-semibold uppercase mt-0.5 hidden sm:block">
            Distributed Systems Observability
          </span>
        </div>
      )}
    </div>
  );
};
