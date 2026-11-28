export interface CollegeNotice {
  id: string;
  title: string;
  age: string;
  href: string;
  active: boolean;
}

export const DEFAULT_NOTICES: CollegeNotice[] = [
  {
    id: "notice-1",
    title: "B.Sc. CSIT & BBS Textbook Exchange Week is Live on Campus Marketplace",
    age: "Today",
    href: "/marketplace",
    active: true,
  },
  {
    id: "notice-2",
    title: "Mid-Term Study Notes & Past Question PDFs Updated in Study Notes",
    age: "2d ago",
    href: "/notes",
    active: true,
  },
  {
    id: "notice-3",
    title: "Focused Video Lessons for Calculus, DSA & Financial Accounting Now Available",
    age: "3d ago",
    href: "/learn",
    active: true,
  },
];
