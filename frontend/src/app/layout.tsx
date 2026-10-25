import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApexSRE — Autonomous Chaos & Cascade Predictor",
  description: "AI-driven microservice observability dashboard that predicts cascading service failures before they happen, visualizes dependency blast radii, and provides one-click automated self-healing playbooks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-[#06090e] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
