import { NextResponse } from "next/server";

const RESET_SECRET = process.env.DATA_RESET_SECRET ?? "nutriai-dev-reset";

export async function POST(request: Request) {
  let key = request.headers.get("x-reset-key");

  if (!key) {
    try {
      const body = (await request.json()) as { key?: string };
      key = body.key ?? null;
    } catch {
      key = null;
    }
  }

  if (!key || key !== RESET_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
