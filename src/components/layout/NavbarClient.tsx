"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PlaySquare,
  Plus,
  ShieldCheck,
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
  { href: "/", label: "Home", icon: Home },
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

  function isItemActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-card border-r border-border px-4 py-6">
      <div className="space-y-6">
        {/* Brand */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground block leading-none">
              StudyHub
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Student Platform
            </span>
          </div>
        </Link>

        {/* Quick Sell CTA */}
        <Link
          href="/marketplace/new"
          onClick={() => setMobileOpen(false)}
          className="block"
        >
          <Button className="w-full justify-center gap-2 shadow-xs">
            <Plus className="h-4 w-4" />
            Sell a Book
          </Button>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-secondary text-primary font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {profile?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname.startsWith("/admin")
                  ? "bg-secondary text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Admin Moderation</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Bottom Auth / Profile Section */}
      <div className="pt-4 border-t border-border space-y-2">
        {user ? (
          <>
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted transition-colors"
            >
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name || user.email || "Student"}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {profile?.full_name || "Student"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  View profile
                </p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={signingOut}
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {signingOut ? "Logging out..." : "Log out"}
            </Button>
          </>
        ) : (
          <div className="space-y-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="block"
            >
              <Button variant="outline" className="w-full">
                Log in
              </Button>
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setMobileOpen(false)}
              className="block"
            >
              <Button variant="secondary" className="w-full">
                Create account
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-md lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold text-foreground">
            StudyHub
          </span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
