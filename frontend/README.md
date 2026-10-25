# CloudLog Enterprise — Frontend Application

Next.js 16 (App Router), TypeScript, and Tailwind CSS client application for CloudLog Enterprise.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev -- -p 3000

# Build production bundle
npm run build
```

## Vercel Deployment

Deploy this folder directly to Vercel:
```bash
npx vercel
```
Or import the repository in [Vercel Dashboard](https://vercel.com/new) and set the Root Directory to `frontend`.

## Features
- **Failure Chain Detective**: Interactive causal failure chain with clickable log proof.
- **Observability Dashboard**: 3-section layout with dynamic time-series charts, severity distribution, and service health overview.
- **Universal Log Analyzer**: Ingest `.log`, `.txt`, `.json`, `.csv` files client-side with zero data leakage.
- **AI Incident Investigator**: Evidence-based root-cause synthesis with actionable runbooks.
- **Failure Replay Engine**: Multi-hop outage cascade player.
- **Deployment Regression**: Canary release comparison and safe rollback recommendations.
