"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DEMO_ADMIN_ACCOUNT,
  DEMO_STUDENT_ACCOUNT,
  matchDemoCredentials,
} from "@/lib/auth/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    authError === "auth_callback_failed"
      ? "Email verification or reset link expired. Please try again."
      : null
  );

  async function signInWithDemo(demoEmail: string, demoPassword: string) {
    const res = await fetch("/api/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: demoEmail, password: demoPassword }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Invalid credentials.");
      return;
    }

    const data = await res.json();
    const target =
      data.role === "admin" && redirectTo === "/dashboard"
        ? "/admin"
        : redirectTo;
    router.push(target);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const demoMatch = matchDemoCredentials(email, password);
      if (demoMatch) {
        await signInWithDemo(email, password);
        return;
      }

      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        setError(
          "Invalid credentials. Use the demo Student or Admin credentials below to test."
        );
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError(
        "Unable to connect to authentication service. Try the demo credentials below."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickLogin(role: "student" | "admin") {
    const account =
      role === "admin" ? DEMO_ADMIN_ACCOUNT : DEMO_STUDENT_ACCOUNT;
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
    setLoading(true);
    try {
      await signInWithDemo(account.email, account.password);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Log in to manage your books, notes, and inquiries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="destructive">{error}</Alert>}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@godawari.edu.np"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              New to Sushma Godawari Student Hub?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-primary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Demo Credentials Card for Testing */}
      <Card className="border-[#12434d]/20 bg-[#f8fafc]">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[#12434d]">
              Demo Test Accounts
            </p>
            <span className="rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[11px] font-semibold text-[#083b45]">
              Testing Mode
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-white p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#12434d]">
                <UserCheck className="h-3.5 w-3.5" />
                Student Account
              </div>
              <div className="text-[11px] text-muted-foreground space-y-0.5 font-mono">
                <p className="truncate">{DEMO_STUDENT_ACCOUNT.email}</p>
                <p>Pass: {DEMO_STUDENT_ACCOUNT.password}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => handleQuickLogin("student")}
                className="w-full text-xs border-[#12434d]/30 text-[#12434d] hover:bg-[#12434d]/10"
              >
                Login as Student
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-white p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#071d2b]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#f2a51a]" />
                Admin Account (Dummy)
              </div>
              <div className="text-[11px] text-muted-foreground space-y-0.5 font-mono">
                <p className="truncate">{DEMO_ADMIN_ACCOUNT.email}</p>
                <p>Pass: {DEMO_ADMIN_ACCOUNT.password}</p>
              </div>
              <Button
                type="button"
                size="sm"
                disabled={loading}
                onClick={() => handleQuickLogin("admin")}
                className="w-full text-xs bg-[#f2a51a] text-[#071d2b] font-semibold hover:bg-[#e2a024]"
              >
                Login as Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md items-center px-4 py-12">
      <Suspense fallback={<div className="w-full h-80 rounded-xl bg-muted animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
