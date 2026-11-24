import type { Profile, Report } from "@/types/database";

export const DEMO_COOKIE_NAME = "godawari_demo_role";

export interface DemoAccount {
  role: "student" | "admin";
  email: string;
  password: string;
  user: { id: string; email: string };
  profile: Profile;
}

export const DEMO_STUDENT_ACCOUNT: DemoAccount = {
  role: "student",
  email: "student@godawari.edu.np",
  password: "student123",
  user: {
    id: "demo-user-1",
    email: "student@godawari.edu.np",
  },
  profile: {
    id: "demo-user-1",
    email: "student@godawari.edu.np",
    full_name: "Aarav Adhikari",
    avatar_url: null,
    institution: "Godawari College",
    education_level: "Bachelor's",
    location: "Itahari, Sunsari",
    role: "student",
    is_suspended: false,
    created_at: "2026-09-12T00:00:00Z",
    updated_at: "2026-11-20T00:00:00Z",
  },
};

// Dummy admin account for testing — replace email when real admin email is provided.
export const DEMO_ADMIN_ACCOUNT: DemoAccount = {
  role: "admin",
  email: "admin@godawari.edu.np",
  password: "admin123",
  user: {
    id: "demo-admin-1",
    email: "admin@godawari.edu.np",
  },
  profile: {
    id: "demo-admin-1",
    email: "admin@godawari.edu.np",
    full_name: "Godawari Admin",
    avatar_url: null,
    institution: "Godawari College",
    education_level: "Administration",
    location: "Itahari, Sunsari",
    role: "admin",
    is_suspended: false,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-11-20T00:00:00Z",
  },
};

export function matchDemoCredentials(
  email: string,
  password: string
): DemoAccount | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedEmail === DEMO_STUDENT_ACCOUNT.email &&
    password === DEMO_STUDENT_ACCOUNT.password
  ) {
    return DEMO_STUDENT_ACCOUNT;
  }
  if (
    normalizedEmail === DEMO_ADMIN_ACCOUNT.email &&
    password === DEMO_ADMIN_ACCOUNT.password
  ) {
    return DEMO_ADMIN_ACCOUNT;
  }
  return null;
}

export function getDemoAccountByRole(role?: string | null): DemoAccount | null {
  if (role === "admin") return DEMO_ADMIN_ACCOUNT;
  if (role === "student") return DEMO_STUDENT_ACCOUNT;
  return null;
}

export const DEMO_ADMIN_USERS: Profile[] = [
  DEMO_ADMIN_ACCOUNT.profile,
  DEMO_STUDENT_ACCOUNT.profile,
  {
    id: "demo-user-2",
    email: "prisha.shrestha@godawari.edu.np",
    full_name: "Prisha Shrestha",
    avatar_url: null,
    institution: "Godawari College",
    education_level: "Bachelor's",
    location: "Itahari, Sunsari",
    role: "student",
    is_suspended: false,
    created_at: "2026-10-02T00:00:00Z",
    updated_at: "2026-11-18T00:00:00Z",
  },
  {
    id: "demo-user-3",
    email: "rohan.gurung@godawari.edu.np",
    full_name: "Rohan Gurung",
    avatar_url: null,
    institution: "Godawari College",
    education_level: "Bachelor's",
    location: "Itahari, Sunsari",
    role: "student",
    is_suspended: false,
    created_at: "2026-10-15T00:00:00Z",
    updated_at: "2026-11-19T00:00:00Z",
  },
];

export const DEMO_REPORTS: Report[] = [
  {
    id: "demo-report-1",
    reporter_id: "demo-user-2",
    target_type: "book",
    target_id: "demo-book-1",
    reason: "Duplicate textbook listing",
    details: "Same Fundamentals of Physics edition posted twice.",
    status: "pending",
    reviewed_by: null,
    created_at: "2026-11-23T14:30:00Z",
    updated_at: "2026-11-23T14:30:00Z",
  },
  {
    id: "demo-report-2",
    reporter_id: "demo-user-3",
    target_type: "note",
    target_id: "demo-note-1",
    reason: "Blurry scan on page 4",
    details: "One diagram page needs a clearer scan.",
    status: "pending",
    reviewed_by: null,
    created_at: "2026-11-22T09:15:00Z",
    updated_at: "2026-11-22T09:15:00Z",
  },
];

export interface CollegeNotice {
  id: string;
  title: string;
  age: string;
  href: string;
  active: boolean;
}

export const DEMO_NOTICES: CollegeNotice[] = [
  {
    id: "notice-1",
    title: "B.Sc. CSIT & BBS second-hand textbook exchange is open for the new semester",
    age: "1 day ago",
    href: "/marketplace",
    active: true,
  },
  {
    id: "notice-2",
    title: "Tribhuvan University past question papers & lecture PDFs available in Study Notes",
    age: "3 days ago",
    href: "/notes",
    active: true,
  },
  {
    id: "notice-3",
    title: "Watch curated topic-based academic video lessons without distractions",
    age: "1 week ago",
    href: "/learn",
    active: true,
  },
];
