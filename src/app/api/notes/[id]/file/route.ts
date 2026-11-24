import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const download = searchParams.get("download") === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: note } = await supabase
    .from("notes")
    .select("id, author_id, file_path, file_name, visibility, status, note_type")
    .eq("id", id)
    .single();

  if (!note || note.note_type !== "pdf" || !note.file_path) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const isOwner = user?.id === note.author_id;
  let isAdmin = false;
  if (user && !isOwner) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  const canAccess =
    (note.status === "active" && note.visibility === "public") ||
    isOwner ||
    isAdmin;

  if (!canAccess) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const { data: signed, error } = await supabase.storage
    .from("note-documents")
    .createSignedUrl(note.file_path, 300, {
      download: download ? note.file_name || "study-note.pdf" : false,
    });

  if (error || !signed?.signedUrl) {
    return NextResponse.json(
      { error: "Unable to generate document link." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}
