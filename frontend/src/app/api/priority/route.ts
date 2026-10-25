import { NextResponse } from "next/server";
import { calculatePriorityScores } from "@/lib/logGenerator";

export async function GET() {
  const scores = calculatePriorityScores();
  return NextResponse.json({ scores, count: scores.length });
}
