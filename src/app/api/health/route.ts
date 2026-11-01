import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Liveness/readiness probe. Reports whether enquiries can be delivered, without exposing settings. */
export function GET() {
  const { mail } = getConfig();
  return NextResponse.json(
    { status: mail.ready ? "ok" : "degraded", enquiries: mail.ready ? "available" : "unavailable" },
    { status: 200 },
  );
}
