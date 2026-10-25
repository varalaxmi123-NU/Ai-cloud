import { NextResponse } from "next/server";
import { resetClusterState } from "@/lib/sreEngine";

export async function POST() {
  const result = resetClusterState();
  return NextResponse.json(result);
}
