import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">StudyHub</p>
              <p className="text-xs text-muted-foreground">
                Student book marketplace, study notes &amp; video learning.
              </p>
            </div>
          </div>

          <nav
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
            aria-label="Footer"
          >
            <Link href="/marketplace" className="hover:text-foreground">
              Marketplace
            </Link>
            <Link href="/notes" className="hover:text-foreground">
              Study Notes
            </Link>
            <Link href="/learn" className="hover:text-foreground">
              Learn
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="mt-6 border-t border-border pt-4 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <p>Built for students. Buy &amp; sell responsibly; share only authorized study materials.</p>
          <p>&copy; 2026 StudyHub</p>
        </div>
      </div>
    </footer>
  );
}
