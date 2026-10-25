import { NextResponse } from "next/server";
import { executeNLPFilter } from "@/lib/logGenerator";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }
    const result = executeNLPFilter(query);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
