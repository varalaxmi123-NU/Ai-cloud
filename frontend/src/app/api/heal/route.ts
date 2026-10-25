import { NextResponse } from "next/server";
import { healCluster } from "@/lib/sreEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serviceId = body.service_id || "database-service";
    const actionId = body.action_id || "PLAYBOOK_DB_FAILOVER";
    const result = healCluster(serviceId, actionId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
