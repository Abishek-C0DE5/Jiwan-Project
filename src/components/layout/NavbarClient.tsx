"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PlaySquare,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/types/database";

interface NavbarClientProps {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
}

const NAV_ITEMS = [
  { href: "/marketplace", label: "Marketplace", icon: BookOpen },
  { href: "/notes", label: "Study Notes", icon: FileText },
  { href: "/learn", label: "Learn", icon: PlaySquare },
  { href: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
];

export function NavbarClient({ user, profile }: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-foreground"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">StudyHub</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.full_name || user.email || "Student"}
                  size="sm"
                />
                <span className="max-w-[140px] truncate">
                  {profile?.full_name || "Profile"}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={signingOut}
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {profile?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Moderation
            </Link>
          )}

          <div className="pt-2 mt-2 border-t border-border space-y-1">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <User className="h-4 w-4" />
                  Profile ({profile?.full_name || "Student"})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  {signingOut ? "Logging out..." : "Log out"}
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  href="/auth/login"
                  className="flex-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
