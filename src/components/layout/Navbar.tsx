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
        <header className="sticky top-0 z-40 h-16 border-b border-border bg-card/95" />
      }
    >
      <NavbarWithAuth />
    </Suspense>
  );
}
