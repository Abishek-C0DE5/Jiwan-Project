"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we will send you a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <Alert variant="success" className="space-y-2">
              <p className="font-medium">Reset link sent</p>
              <p>
                If an account exists for <strong>{email}</strong>, you will
                receive an email with instructions to reset your password.
              </p>
              <div className="pt-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <Alert variant="destructive">{error}</Alert>}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending link..." : "Send reset link"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  Back to Login
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
