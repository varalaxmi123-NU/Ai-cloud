import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudLog AI — Autonomous Log Analyzer & SRE Cascade Predictor",
  description: "Enterprise cloud observability platform with real-time log anomaly detection, natural-language search, alert correlation, and deployment regression prevention.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-[#0b0f19] bg-ambient-mesh text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
