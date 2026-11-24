import { z } from "zod";
import { BOOK_CONDITIONS } from "@/lib/utils/format";

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name is too long"),
  institution: z
    .string()
    .trim()
    .max(120, "Institution name is too long")
    .optional()
    .or(z.literal("")),
  education_level: z
    .string()
    .trim()
    .max(60, "Education level is too long")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .trim()
    .max(80, "Location is too long")
    .optional()
    .or(z.literal("")),
});

export const bookListingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Book title must be at least 2 characters")
    .max(140, "Book title is too long"),
  author: z
    .string()
    .trim()
    .min(2, "Author name must be at least 2 characters")
    .max(100, "Author name is too long"),
  subject: z
    .string()
    .trim()
    .min(2, "Subject is required")
    .max(60, "Subject is too long"),
  category_id: z.string().uuid("Please select a valid category"),
  education_level: z
    .string()
    .trim()
    .min(2, "Please select a class or education level"),
  price_npr: z.coerce
    .number()
    .int("Price must be a whole number in NPR")
    .min(0, "Price cannot be negative")
    .max(100000, "Price seems too high"),
  original_price_npr: z
    .union([
      z.coerce.number().int().min(0).max(200000),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .transform((val) => (val === "" || val === undefined ? null : val)),
  condition: z.enum(BOOK_CONDITIONS, {
    message: "Please select a valid condition",
  }),
  description: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters describing the book")
    .max(2000, "Description is too long"),
  location: z
    .string()
    .trim()
    .min(2, "General location (city/area) is required")
    .max(80, "Location is too long"),
});

export const createdNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Note title must be at least 2 characters")
    .max(140, "Note title is too long"),
  subject: z
    .string()
    .trim()
    .min(2, "Subject is required")
    .max(60, "Subject is too long"),
  education_level: z
    .string()
    .trim()
    .min(2, "Class or education level is required"),
  topic: z.string().trim().max(100, "Topic is too long").optional().or(z.literal("")),
  content: z
    .string()
    .trim()
    .min(20, "Note content must be at least 20 characters")
    .max(50000, "Note content is too long"),
  visibility: z.enum(["public", "private"]),
});

export const pdfNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Document title must be at least 2 characters")
    .max(140, "Document title is too long"),
  description: z
    .string()
    .trim()
    .min(10, "Please add a short description (at least 10 characters)")
    .max(1000, "Description is too long"),
  subject: z
    .string()
    .trim()
    .min(2, "Subject is required")
    .max(60, "Subject is too long"),
  education_level: z
    .string()
    .trim()
    .min(2, "Class or education level is required"),
  topic: z.string().trim().max(100, "Topic is too long").optional().or(z.literal("")),
  visibility: z.enum(["public", "private"]),
  permission_confirmed: z.literal(true, {
    message:
      "You must confirm this is your own work or you have permission to share it.",
  }),
});

export const inquirySchema = z.object({
  book_id: z.string().uuid(),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(1000, "Message is too long"),
});

export const reportSchema = z.object({
  target_type: z.enum(["book", "note"]),
  target_id: z.string().uuid(),
  reason: z.string().trim().min(3, "Please select or enter a reason").max(120),
  details: z.string().trim().max(1000).optional().or(z.literal("")),
});
