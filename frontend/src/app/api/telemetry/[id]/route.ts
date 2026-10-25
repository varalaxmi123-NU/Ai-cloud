import { NextResponse } from "next/server";
import { getServiceTelemetry } from "@/lib/sreEngine";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = getServiceTelemetry(id);
  return NextResponse.json(data);
}
