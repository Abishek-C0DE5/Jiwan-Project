import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="godawari-cta-gradient text-white mt-auto w-full border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <Image
                src="/images/college-logo.jpg"
                alt="Godawari College Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover border border-white/20"
              />
              <div>
                <p className="font-serif text-base font-bold text-white">
                  Godawari College
                </p>
                <p className="text-[11px] text-[#f4b63e]">
                  Itahari, Sunsari · Est. 1992 AD
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-white/75">
              Tribhuvan University affiliated B.Sc. CSIT and BBS student
              platform for textbooks, study notes, and video lessons.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#f2a51a]">
              Quick Links
            </p>
            <nav className="flex flex-col gap-2 text-sm text-white/80" aria-label="Footer Quick Links">
              <Link href="/" className="hover:text-[#f4b63e] transition-colors">
                Home
              </Link>
              <Link href="/marketplace" className="hover:text-[#f4b63e] transition-colors">
                Book Marketplace
              </Link>
              <Link href="/notes" className="hover:text-[#f4b63e] transition-colors">
                Study Notes
              </Link>
              <Link href="/learn" className="hover:text-[#f4b63e] transition-colors">
                Video Lessons
              </Link>
            </nav>
          </div>

          {/* Student Actions */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#f2a51a]">
              Student Hub
            </p>
            <nav className="flex flex-col gap-2 text-sm text-white/80" aria-label="Footer Student Hub">
              <Link href="/marketplace/new" className="hover:text-[#f4b63e] transition-colors">
                Sell a Textbook
              </Link>
              <Link href="/notes/new" className="hover:text-[#f4b63e] transition-colors">
                Upload Study Notes
              </Link>
              <Link href="/dashboard" className="hover:text-[#f4b63e] transition-colors">
                My Dashboard
              </Link>
              <Link href="/auth/login" className="hover:text-[#f4b63e] transition-colors">
                Student Login
              </Link>
            </nav>
          </div>

          {/* Programs */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#f2a51a]">
              Programs
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/80">
              <Link
                href="/marketplace?q=Computer+Science"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 hover:border-[#f2a51a]/60 hover:text-[#f4b63e] transition-colors"
              >
                B.Sc. CSIT Resources
              </Link>
              <Link
                href="/marketplace?q=Business"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 hover:border-[#f2a51a]/60 hover:text-[#f4b63e] transition-colors"
              >
                BBS Study Materials
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-white/65">
          <p>&copy; 2026 Godawari College. All rights reserved.</p>
          <p>Itahari, Sunsari, Nepal · Affiliated with Tribhuvan University</p>
        </div>
      </div>
    </footer>
  );
}
