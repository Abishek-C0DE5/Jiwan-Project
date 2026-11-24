"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp } from "lucide-react";
import { pdfNoteSchema } from "@/lib/validations/schemas";
import {
  ALLOWED_PDF_TYPES,
  EDUCATION_LEVELS,
  MAX_NOTE_PDF_BYTES,
  formatFileSize,
} from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

export function PdfUploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [educationLevel, setEducationLevel] = useState<string>(
    EDUCATION_LEVELS[1]
  );
  const [topic, setTopic] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [permissionConfirmed, setPermissionConfirmed] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (
      !ALLOWED_PDF_TYPES.includes(selected.type) &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Only PDF files (.pdf) are allowed.");
      e.target.value = "";
      return;
    }

    if (selected.size > MAX_NOTE_PDF_BYTES) {
      setError("PDF file size must be 15 MB or less.");
      e.target.value = "";
      return;
    }

    setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select a PDF file to upload.");
      return;
    }

    const parsed = pdfNoteSchema.safeParse({
      title,
      description,
      subject,
      education_level: educationLevel,
      topic,
      visibility,
      permission_confirmed: permissionConfirmed,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please check your inputs.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", parsed.data.title);
      formData.append("description", parsed.data.description);
      formData.append("subject", parsed.data.subject);
      formData.append("education_level", parsed.data.education_level);
      formData.append("topic", parsed.data.topic || "");
      formData.append("visibility", parsed.data.visibility);

      const res = await fetch("/api/notes/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      router.push(`/notes/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload PDF.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="pdfTitle">Document Title *</Label>
          <Input
            id="pdfTitle"
            required
            placeholder="e.g., Calculus Integration Formula Sheet"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pdfSubject">Subject *</Label>
          <Input
            id="pdfSubject"
            required
            placeholder="e.g., Mathematics"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pdfLevel">Class / Education Level *</Label>
          <Select
            id="pdfLevel"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
          >
            {EDUCATION_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pdfTopic">Topic (optional)</Label>
          <Input
            id="pdfTopic"
            placeholder="e.g., Integral Calculus"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pdfVisibility">Visibility *</Label>
          <Select
            id="pdfVisibility"
            value={visibility}
            onChange={(e) =>
              setVisibility(e.target.value as "public" | "private")
            }
          >
            <option value="public">Public (Visible to all students)</option>
            <option value="private">Private (Only visible to you)</option>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pdfDescription">Description *</Label>
        <Textarea
          id="pdfDescription"
          rows={3}
          required
          placeholder="Briefly explain what these notes cover..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>PDF File * (max 15 MB)</Label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center hover:bg-muted">
          <FileUp className="h-7 w-7 text-primary" />
          {file ? (
            <div>
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} &middot; Click to replace
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground">
                Click to choose a PDF file
              </p>
              <p className="text-xs text-muted-foreground">
                Only .pdf documents up to 15 MB
              </p>
            </div>
          )}
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileSelect}
            className="sr-only"
          />
        </label>
      </div>

      <label className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={permissionConfirmed}
          onChange={(e) => setPermissionConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border"
        />
        <span>
          I confirm that I created this document or have permission to share it.
          I understand that pirated textbooks or unauthorized copyrighted scans
          are prohibited and will be removed.
        </span>
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading PDF..." : "Upload Study Note"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={uploading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
