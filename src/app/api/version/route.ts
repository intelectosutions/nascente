import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const file = path.join(process.cwd(), "public", "version.json");
    const raw = fs.readFileSync(file, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(
      { ...data, env: process.env.NODE_ENV || "development" },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { version: "0.0.0", commit: "unknown", branch: "unknown", buildTime: new Date().toISOString(), env: process.env.NODE_ENV || "development" },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
