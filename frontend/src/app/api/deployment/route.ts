import { NextResponse } from "next/server";
import { getDeploymentRegression } from "@/lib/logGenerator";

export async function GET() {
  const data = getDeploymentRegression();
  return NextResponse.json(data);
}
