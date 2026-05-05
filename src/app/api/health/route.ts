import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    data: {
      app: "OpsPilot",
      status: "healthy",
    },
  });
}
