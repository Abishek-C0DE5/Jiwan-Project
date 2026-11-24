-- ============================================================================
-- 001_initial_schema.sql
-- Core schema, views, triggers, indexes, and Row Level Security (RLS) policies
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) >= 2),
  email text not null,
  avatar_url text,
  institution text,
  education_level text,
  location text,
  role text not null default 'student' check (role in ('student', 'admin')),
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles (role);

-- Safe public projection of profiles (never exposes email or suspension flags)
create or replace view public.public_profiles as
select
  id,
  full_name,
  avatar_url,
  institution,
  education_level,
  location,
  created_at
from public.profiles
where is_suspended = false;

grant select on public.public_profiles to anon, authenticated;

-- Helper function to check admin role without RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_suspended = false
  );
$$;

-- Helper function to check if current user is not suspended
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_suspended = false
  );
$$;

-- Automatically update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Automatically create profile row when a new user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, institution, education_level, location)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'institution'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'education_level'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'location'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS for profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id and role = 'student' and is_suspended = false);

create policy "Users can update their own profile without changing role or suspension"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and is_suspended = (select p.is_suspended from public.profiles p where p.id = auth.uid())
  );

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES (Book Categories)
-- ----------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

insert into public.categories (name, slug) values
  ('Science', 'science'),
  ('Mathematics', 'mathematics'),
  ('Computer Science', 'computer-science'),
  ('Management', 'management'),
  ('English', 'english'),
  ('Other', 'other')
on conflict (slug) do nothing;

alter table public.categories enable row level security;

create policy "Anyone can view categories"
  on public.categories for select
  using (true);

create policy "Only admins can manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. BOOK LISTINGS
-- ----------------------------------------------------------------------------
create table public.book_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 2),
  author text not null check (char_length(trim(author)) >= 2),
  subject text not null check (char_length(trim(subject)) >= 2),
  category_id uuid not null references public.categories (id),
  education_level text not null,
  price_npr integer not null check (price_npr >= 0),
  original_price_npr integer check (original_price_npr is null or original_price_npr >= 0),
  condition text not null check (condition in ('Like New', 'Good', 'Acceptable')),
  description text not null check (char_length(trim(description)) >= 10),
  images text[] not null default '{}',
  location text not null check (char_length(trim(location)) >= 2),
  status text not null default 'available' check (status in ('available', 'sold', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_book_listings_seller on public.book_listings (seller_id);
create index idx_book_listings_category on public.book_listings (category_id);
create index idx_book_listings_status_created on public.book_listings (status, created_at desc);
create index idx_book_listings_price on public.book_listings (price_npr);

create trigger trg_book_listings_updated_at
  before update on public.book_listings
  for each row execute function public.set_updated_at();

alter table public.book_listings enable row level security;

create policy "Public can view available or sold books from active sellers"
  on public.book_listings for select
  using (
    status in ('available', 'sold')
    or seller_id = auth.uid()
    or public.is_admin()
  );

create policy "Authenticated active users can create book listings"
  on public.book_listings for insert
  with check (
    auth.uid() = seller_id
    and public.is_active_user()
    and status = 'available'
  );

create policy "Sellers can update their own books"
  on public.book_listings for update
  using (auth.uid() = seller_id and public.is_active_user())
  with check (auth.uid() = seller_id);

create policy "Admins can update any book listing"
  on public.book_listings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Sellers or admins can delete book listings"
  on public.book_listings for delete
  using (auth.uid() = seller_id or public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. STUDY NOTES (Created Notes & Uploaded PDFs)
-- ----------------------------------------------------------------------------
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 2),
  description text,
  subject text not null check (char_length(trim(subject)) >= 2),
  education_level text not null,
  topic text,
  note_type text not null check (note_type in ('created', 'pdf')),
  content text,
  file_path text,
  file_name text,
  file_size integer check (file_size is null or file_size > 0),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  status text not null default 'active' check (status in ('active', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_notes_author on public.notes (author_id);
create index idx_notes_subject on public.notes (subject);
create index idx_notes_status_visibility on public.notes (status, visibility, created_at desc);

create trigger trg_notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

alter table public.notes enable row level security;

create policy "Public can view active public notes; authors and admins view all theirs"
  on public.notes for select
  using (
    (status = 'active' and visibility = 'public')
    or author_id = auth.uid()
    or public.is_admin()
  );

create policy "Authenticated active users can create notes"
  on public.notes for insert
  with check (
    auth.uid() = author_id
    and public.is_active_user()
    and status = 'active'
  );

create policy "Authors can update their own notes"
  on public.notes for update
  using (auth.uid() = author_id and public.is_active_user())
  with check (auth.uid() = author_id);

create policy "Admins can update any note"
  on public.notes for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Authors or admins can delete notes"
  on public.notes for delete
  using (auth.uid() = author_id or public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. INQUIRIES (Buyer <-> Seller messages on books)
-- ----------------------------------------------------------------------------
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.book_listings (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  message text not null check (char_length(trim(message)) >= 5),
  reply text,
  status text not null default 'pending' check (status in ('pending', 'replied', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_inquiry_not_self check (sender_id <> receiver_id)
);

create index idx_inquiries_sender on public.inquiries (sender_id, created_at desc);
create index idx_inquiries_receiver on public.inquiries (receiver_id, created_at desc);
create index idx_inquiries_book on public.inquiries (book_id);

create trigger trg_inquiries_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

alter table public.inquiries enable row level security;

create policy "Participants and admins can view inquiries"
  on public.inquiries for select
  using (
    auth.uid() = sender_id
    or auth.uid() = receiver_id
    or public.is_admin()
  );

create policy "Authenticated active users can send inquiries"
  on public.inquiries for insert
  with check (
    auth.uid() = sender_id
    and public.is_active_user()
    and sender_id <> receiver_id
  );

create policy "Participants can update inquiries (e.g. seller reply or close)"
  on public.inquiries for update
  using (auth.uid() = receiver_id or auth.uid() = sender_id)
  with check (auth.uid() = receiver_id or auth.uid() = sender_id);

-- ----------------------------------------------------------------------------
-- 6. SAVED BOOKS (Favourites)
-- ----------------------------------------------------------------------------
create table public.saved_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  book_id uuid not null references public.book_listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create index idx_saved_books_user on public.saved_books (user_id, created_at desc);

alter table public.saved_books enable row level security;

create policy "Users can view their own saved books"
  on public.saved_books for select
  using (auth.uid() = user_id);

create policy "Users can save books"
  on public.saved_books for insert
  with check (auth.uid() = user_id and public.is_active_user());

create policy "Users can remove their saved books"
  on public.saved_books for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 7. REPORTS (Content Moderation)
-- ----------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('book', 'note')),
  target_id uuid not null,
  reason text not null check (char_length(trim(reason)) >= 3),
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'action_taken')),
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_reports_status on public.reports (status, created_at desc);
create index idx_reports_target on public.reports (target_type, target_id);

create trigger trg_reports_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

alter table public.reports enable row level security;

create policy "Reporters can view their own reports; admins view all"
  on public.reports for select
  using (auth.uid() = reporter_id or public.is_admin());

create policy "Authenticated active users can submit reports"
  on public.reports for insert
  with check (
    auth.uid() = reporter_id
    and public.is_active_user()
    and status = 'pending'
  );

create policy "Only admins can update reports"
  on public.reports for update
  using (public.is_admin())
  with check (public.is_admin());
