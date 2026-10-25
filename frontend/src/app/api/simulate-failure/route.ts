import { NextResponse } from "next/server";
import { simulateFailure } from "@/lib/sreEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serviceId = body.service_id || "database-service";
    const scenario = body.scenario_type || "database_connection_pool_exhaustion";
    const result = simulateFailure(serviceId, scenario);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
