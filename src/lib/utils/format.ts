import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNPR(amount: number): string {
  return `NPR ${new Intl.NumberFormat("en-NP").format(amount)}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const EDUCATION_LEVELS = [
  "Grade 8-10 (SEE)",
  "Grade 11-12 (+2)",
  "Bachelor's",
  "Master's",
  "Entrance Prep",
  "Other",
] as const;

export const BOOK_CONDITIONS = ["Like New", "Good", "Acceptable"] as const;

export const SUBJECT_SUGGESTIONS = [
  "Physics",
  "Chemistry",
  "Biology",
  "Mathematics",
  "Computer Science",
  "Economics",
  "Accountancy",
  "Business Studies",
  "English",
  "Nepali",
  "Other",
] as const;

export const MAX_BOOK_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_NOTE_PDF_BYTES = 15 * 1024 * 1024; // 15 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_PDF_TYPES = ["application/pdf"];
