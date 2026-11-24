export type UserRole = "student" | "admin";

export type BookCondition = "Like New" | "Good" | "Acceptable";
export type BookStatus = "available" | "sold" | "removed";

export type NoteType = "created" | "pdf";
export type NoteVisibility = "public" | "private";
export type NoteStatus = "active" | "removed";

export type InquiryStatus = "pending" | "replied" | "closed";

export type ReportTargetType = "book" | "note";
export type ReportStatus = "pending" | "reviewed" | "dismissed" | "action_taken";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  institution: string | null;
  education_level: string | null;
  location: string | null;
  role: UserRole;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  institution: string | null;
  education_level: string | null;
  location: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BookListing {
  id: string;
  seller_id: string;
  title: string;
  author: string;
  subject: string;
  category_id: string;
  education_level: string;
  price_npr: number;
  original_price_npr: number | null;
  condition: BookCondition;
  description: string;
  images: string[];
  location: string;
  status: BookStatus;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  seller?: PublicProfile | null;
}

export interface StudyNote {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  subject: string;
  education_level: string;
  topic: string | null;
  note_type: NoteType;
  content: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  visibility: NoteVisibility;
  status: NoteStatus;
  created_at: string;
  updated_at: string;
  author?: PublicProfile | null;
}

export interface Inquiry {
  id: string;
  book_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  reply: string | null;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  book?: Pick<BookListing, "id" | "title" | "price_npr" | "status" | "images"> | null;
  sender?: PublicProfile | null;
  receiver?: PublicProfile | null;
}

export interface SavedBook {
  id: string;
  user_id: string;
  book_id: string;
  created_at: string;
  book?: BookListing | null;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  reporter?: PublicProfile | null;
}

export interface YouTubeVideoResult {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string | null;
}
