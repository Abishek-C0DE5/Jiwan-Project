import { NextResponse } from "next/server";
import { DEMO_COOKIE_NAME, matchDemoCredentials } from "@/lib/auth/demo";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";

    const matched = matchDemoCredentials(email, password);
    if (!matched) {
      return NextResponse.json(
        { error: "Invalid demo email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      role: matched.role,
      redirectTo: matched.role === "admin" ? "/admin" : "/dashboard",
    });

    response.cookies.set(DEMO_COOKIE_NAME, matched.role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }
}
