import { NextResponse } from "next/server";
import { connectDB, getDbName } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ ok: true, db: getDbName() });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "DB connection failed",
      },
      { status: 500 },
    );
  }
}
