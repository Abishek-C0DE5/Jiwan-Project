"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  GraduationCap,
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
  { href: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
];

export function NavbarClient({ user, profile }: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "76px" : "256px"
    );
  }, [collapsed]);

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

  const renderSidebarBody = (isCollapsed: boolean, isMobile = false) => (
    <div
      className={cn(
        "flex h-full flex-col justify-between bg-white border-r border-border py-5 transition-all duration-300",
        isCollapsed ? "px-3" : "px-4"
      )}
    >
      <div className="space-y-6">
        {/* Brand + Minimize Toggle */}
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "justify-between px-1"
          )}
        >
          {!isCollapsed && (
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 min-w-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6d28d9] text-white shadow-xs">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <span className="text-lg font-extrabold tracking-tight text-foreground block leading-none">
                  StudyHub
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Learn · Practice · Grow
                </span>
              </div>
            </Link>
          )}

          {!isMobile && (
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              title={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-[#ede9fe] hover:text-[#5b21b6] transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <ChevronsLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Quick Sell CTA */}
        <Link
          href="/marketplace/new"
          onClick={() => setMobileOpen(false)}
          title="Sell a Book"
          className="block"
        >
          <Button
            className={cn(
              "w-full rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6] text-white shadow-xs",
              isCollapsed ? "px-0 justify-center" : "justify-center gap-2"
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Sell a Book</span>}
          </Button>
        </Link>

        {/* Navigation Links */}
        <div className="space-y-1.5">
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-semibold text-muted-foreground">
              Menu
            </p>
          )}
          <nav className="space-y-1" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200",
                    isCollapsed ? "justify-center px-0" : "gap-3 px-3",
                    active
                      ? "bg-[#ede9fe] text-[#5b21b6] font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-[#6d28d9]" : ""
                    )}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}

            {profile?.role === "admin" && (
              <Link
                href="/admin"
                title={isCollapsed ? "Admin Moderation" : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200",
                  isCollapsed ? "justify-center px-0" : "gap-3 px-3",
                  pathname.startsWith("/admin")
                    ? "bg-[#ede9fe] text-[#5b21b6] font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Admin</span>}
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Bottom Auth / Profile Section */}
      <div className="pt-4 border-t border-border space-y-2">
        {user ? (
          <>
            <Link
              href="/profile"
              title={isCollapsed ? profile?.full_name || "Profile" : undefined}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center rounded-xl p-2 hover:bg-muted transition-colors",
                isCollapsed ? "justify-center" : "gap-3"
              )}
            >
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name || user.email || "Student"}
                size="sm"
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {profile?.full_name || "Student"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    View profile
                  </p>
                </div>
              )}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              title={isCollapsed ? "Log out" : undefined}
              onClick={handleLogout}
              disabled={signingOut}
              className={cn(
                "w-full text-muted-foreground hover:text-destructive hover:bg-red-50",
                isCollapsed ? "justify-center px-0" : "justify-start"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!isCollapsed && (
                <span>{signingOut ? "Logging out..." : "Log out"}</span>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-2">
            <Link
              href="/auth/login"
              title="Log in"
              onClick={() => setMobileOpen(false)}
              className="block"
            >
              <Button
                variant="outline"
                className={cn(
                  "w-full",
                  isCollapsed ? "px-0 justify-center" : "justify-center gap-2"
                )}
              >
                <LogIn className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Log in</span>}
              </Button>
            </Link>
            <Link
              href="/auth/signup"
              title="Create account"
              onClick={() => setMobileOpen(false)}
              className="block"
            >
              <Button
                variant="secondary"
                className={cn(
                  "w-full bg-[#ede9fe] text-[#5b21b6] hover:bg-violet-200/70",
                  isCollapsed ? "px-0 justify-center" : "justify-center gap-2"
                )}
              >
                <UserPlus className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Create account</span>}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Left Sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:flex-col transition-[width] duration-300 ease-in-out",
          collapsed ? "lg:w-[76px]" : "lg:w-64"
        )}
      >
        {renderSidebarBody(collapsed, false)}
      </aside>

      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur-md lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6d28d9] text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold text-foreground">
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
            {renderSidebarBody(false, true)}
          </div>
        </div>
      )}
    </>
  );
}
