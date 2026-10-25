import { NextResponse } from "next/server";
import { getCorrelatedIncidents } from "@/lib/logGenerator";

export async function GET() {
  const incidents = getCorrelatedIncidents();
  return NextResponse.json({ incidents, count: incidents.length });
}
