import { NextResponse } from "next/server";
import { connectDB, getDbName } from "@/lib/db";
import { runtimeEnvConfigured } from "@/lib/runtime-env";

export async function GET() {
  const envChecks = {
    MONGODB_URI: runtimeEnvConfigured("MONGODB_URI"),
    PROFILE_GATE_USERNAME: runtimeEnvConfigured("PROFILE_GATE_USERNAME"),
    PROFILE_GATE_PASSWORD: runtimeEnvConfigured("PROFILE_GATE_PASSWORD"),
    ADMIN_USERNAME: runtimeEnvConfigured("ADMIN_USERNAME"),
    ADMIN_PASSWORD: runtimeEnvConfigured("ADMIN_PASSWORD"),
    R2_BUCKET_NAME: runtimeEnvConfigured("R2_BUCKET_NAME"),
  };

  try {
    await connectDB();
    return NextResponse.json({
      ok: true,
      db: getDbName(),
      env: envChecks,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "DB connection failed",
        env: envChecks,
      },
      { status: 500 },
    );
  }
}