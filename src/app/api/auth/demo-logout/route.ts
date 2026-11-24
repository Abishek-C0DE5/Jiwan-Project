import { NextResponse } from "next/server";
import { DEMO_COOKIE_NAME } from "@/lib/auth/demo";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEMO_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
