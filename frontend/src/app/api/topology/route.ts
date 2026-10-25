import { NextResponse } from "next/server";
import { getClusterState } from "@/lib/sreEngine";

export async function GET() {
  const state = getClusterState();
  return NextResponse.json(state);
}
