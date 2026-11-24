-- ============================================================================
-- 002_storage_and_policies.sql
-- Storage buckets and object-level RLS policies
-- ============================================================================

-- 1. Book Images Bucket (Public read, owner-scoped upload/delete)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'book-images',
  'book-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- 2. Profile Images Bucket (Public read, owner-scoped upload/delete)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-images',
  'profile-images',
  true,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- 3. Note Documents Bucket (PRIVATE - accessed via server-generated signed URLs)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'note-documents',
  'note-documents',
  false,
  15728640, -- 15 MB
  array['application/pdf']
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Storage Policies: book-images
-- Convention: files stored under "<user_id>/<filename>"
-- ----------------------------------------------------------------------------
create policy "Public can view book images"
  on storage.objects for select
  using (bucket_id = 'book-images');

create policy "Authenticated users can upload book images to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'book-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own book images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'book-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users or admins can delete book images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'book-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- ----------------------------------------------------------------------------
-- Storage Policies: profile-images
-- ----------------------------------------------------------------------------
create policy "Public can view profile images"
  on storage.objects for select
  using (bucket_id = 'profile-images');

create policy "Authenticated users can upload profile images to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own profile images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users or admins can delete profile images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- ----------------------------------------------------------------------------
-- Storage Policies: note-documents (Private bucket)
-- Owners & admins can read directly or create signed URLs; public notes are
-- served via signed URLs after verifying note visibility in the API/server.
-- ----------------------------------------------------------------------------
create policy "Owners and admins can read note documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'note-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or exists (
        select 1 from public.notes n
        where n.file_path = name
          and n.visibility = 'public'
          and n.status = 'active'
      )
    )
  );

create policy "Authenticated users can upload note documents to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'note-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users or admins can delete note documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'note-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
