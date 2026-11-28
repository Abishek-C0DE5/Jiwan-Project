"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  FileText,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  PlaySquare,
  Plus,
  ShieldCheck,
  UserPlus,
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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const NOTICE_ITEMS = [
  {
    text: "B.Sc. CSIT & BBS second-hand textbook exchange is open for the new semester",
    age: "1 day ago",
    href: "/marketplace",
  },
  {
    text: "Tribhuvan University past question papers & lecture PDFs available in Study Notes",
    age: "3 days ago",
    href: "/notes",
  },
  {
    text: "Watch curated topic-based academic video lessons without distractions",
    age: "1 week ago",
    href: "/learn",
  },
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

  return (
    <>
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: College Crest Logo & Brand */}
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 min-w-0 shrink-0"
          >
            <Image
              src="/images/college-logo.jpg"
              alt="Sushma Godawari Student Hub Logo"
              width={44}
              height={44}
              priority
              className="h-11 w-11 rounded-full object-cover border border-[#12434d]/20 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#12434d] block leading-tight">
                Sushma Godawari Student Hub
              </span>
              <span className="hidden sm:block text-[11px] font-medium text-muted-foreground">
                A Place Where Dreams Are Nurtured
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Primary"
          >
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#12434d]/10 text-[#12434d] font-semibold"
                      : "text-foreground/80 hover:bg-muted hover:text-[#12434d]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors inline-flex items-center gap-1.5",
                  pathname.startsWith("/admin")
                    ? "bg-[#12434d]/10 text-[#12434d] font-semibold"
                    : "text-foreground/80 hover:bg-muted hover:text-[#12434d]"
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right: Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <Link href="/marketplace/new">
              <Button
                size="sm"
                className="rounded-lg bg-[#f2a51a] text-[#071d2b] font-semibold hover:bg-[#e2a024] shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Sell a Book
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-border">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted transition-colors"
                >
                  <Avatar
                    src={profile?.avatar_url}
                    name={profile?.full_name || user.email || "Student"}
                    size="sm"
                  />
                  <span className="max-w-[110px] truncate text-sm font-semibold text-foreground">
                    {profile?.full_name || "Student"}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={signingOut}
                  title="Log out"
                  className="text-muted-foreground hover:text-destructive hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1 border-l border-border">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#12434d]/25 text-[#12434d] hover:bg-[#12434d]/5"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="bg-[#12434d] text-white hover:bg-[#083b45]"
                  >
                    Join Hub
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-[#12434d] hover:bg-muted lg:hidden cursor-pointer"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Notice Ticker Bar (Godawari College signature strip) */}
        <div className="godawari-notice-gradient text-white border-t border-white/10">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1.5 sm:px-6 lg:px-8">
            <span className="shrink-0 rounded bg-[#f2a51a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#071d2b]">
              Notice
            </span>
            <div className="relative flex-1 overflow-hidden">
              <div className="animate-notice-marquee flex items-center gap-10 whitespace-nowrap text-xs">
                {[...NOTICE_ITEMS, ...NOTICE_ITEMS].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="inline-flex items-center gap-2 text-white/90 hover:text-[#f4b63e] transition-colors"
                  >
                    <span>{item.text}</span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-[#f4b63e]">
                      {item.age}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/notes"
              className="hidden sm:inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-[#f4b63e] hover:text-white transition-colors"
            >
              View All
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Right-Side Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-[#071d2b]/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col justify-between bg-white p-5 shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <Image
                    src="/images/college-logo.jpg"
                    alt="Sushma Godawari Student Hub"
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover border border-[#12434d]/20"
                  />
                  <span className="font-serif text-base font-bold text-[#12434d]">
                    Sushma Godawari Student Hub
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <Link
                href="/marketplace/new"
                onClick={() => setMobileOpen(false)}
                className="block"
              >
                <Button className="w-full rounded-xl bg-[#f2a51a] text-[#071d2b] font-semibold hover:bg-[#e2a024]">
                  <Plus className="h-4 w-4" />
                  Sell a Book
                </Button>
              </Link>

              <nav className="space-y-1" aria-label="Mobile Navigation">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-[#12434d]/10 text-[#12434d] font-semibold"
                          : "text-foreground/80 hover:bg-muted hover:text-[#12434d]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-[#12434d]" : "text-muted-foreground"
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
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                      pathname.startsWith("/admin")
                        ? "bg-[#12434d]/10 text-[#12434d] font-semibold"
                        : "text-foreground/80 hover:bg-muted"
                    )}
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Admin</span>
                  </Link>
                )}
              </nav>
            </div>

            <div className="border-t border-border pt-4 space-y-2.5">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted"
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
                    <Button variant="outline" className="w-full justify-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Log in
                    </Button>
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block"
                  >
                    <Button className="w-full justify-center gap-2 bg-[#12434d] text-white hover:bg-[#083b45]">
                      <UserPlus className="h-4 w-4" />
                      Create account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
