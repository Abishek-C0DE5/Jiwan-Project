import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MAX_NOTE_PDF_BYTES } from "@/lib/utils/format";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_suspended")
      .eq("id", user.id)
      .single();

    if (profile?.is_suspended) {
      return NextResponse.json(
        { error: "Your account is suspended and cannot upload notes." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const educationLevel = String(formData.get("education_level") || "").trim();
    const topic = String(formData.get("topic") || "").trim();
    const visibility = String(formData.get("visibility") || "public");

    if (!title || title.length < 2) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!description || description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters." },
        { status: 400 }
      );
    }
    if (!subject || !educationLevel) {
      return NextResponse.json(
        { error: "Subject and education level are required." },
        { status: 400 }
      );
    }
    if (visibility !== "public" && visibility !== "private") {
      return NextResponse.json(
        { error: "Invalid visibility setting." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "PDF file is required." },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_NOTE_PDF_BYTES) {
      return NextResponse.json(
        { error: "PDF must be between 1 byte and 15 MB." },
        { status: 400 }
      );
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    // Server-side magic bytes check (%PDF-)
    const buffer = Buffer.from(await file.arrayBuffer());
    const header = buffer.subarray(0, 5).toString("ascii");
    if (header !== "%PDF-") {
      return NextResponse.json(
        { error: "Invalid PDF file signature." },
        { status: 400 }
      );
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${crypto.randomUUID()}-${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from("note-documents")
      .upload(filePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: inserted, error: dbError } = await supabase
      .from("notes")
      .insert({
        author_id: user.id,
        title,
        description,
        subject,
        education_level: educationLevel,
        topic: topic || null,
        note_type: "pdf",
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        visibility,
        status: "active",
      })
      .select("id")
      .single();

    if (dbError) {
      await supabase.storage.from("note-documents").remove([filePath]);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ id: inserted.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while uploading PDF." },
      { status: 500 }
    );
  }
}
