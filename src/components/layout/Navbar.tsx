import { Suspense } from "react";
import { getCurrentUserWithProfile } from "@/lib/supabase/server";
import { NavbarClient } from "./NavbarClient";

async function NavbarWithAuth() {
  const { user, profile } = await getCurrentUserWithProfile();
  return <NavbarClient user={user} profile={profile} />;
}

export function Navbar() {
  return (
    <Suspense
      fallback={
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col border-r border-border bg-card" />
      }
    >
      <NavbarWithAuth />
    </Suspense>
  );
}
