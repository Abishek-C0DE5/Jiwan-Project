"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bold, Eye, Heading2, Italic, List, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createdNoteSchema } from "@/lib/validations/schemas";
import { EDUCATION_LEVELS } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { NoteContentRenderer } from "./NoteContentRenderer";
import type { StudyNote } from "@/types/database";

interface NoteEditorFormProps {
  userId: string;
  initialData?: StudyNote;
}

export function NoteEditorForm({ userId, initialData }: NoteEditorFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [educationLevel, setEducationLevel] = useState(
    initialData?.education_level || EDUCATION_LEVELS[1]
  );
  const [topic, setTopic] = useState(initialData?.topic || "");
  const [visibility, setVisibility] = useState<"public" | "private">(
    initialData?.visibility || "public"
  );
  const [content, setContent] = useState(initialData?.content || "");
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function insertFormatting(prefix: string, suffix = "") {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || "text";
    const next =
      content.slice(0, start) + prefix + selected + suffix + content.slice(end);
    setContent(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createdNoteSchema.safeParse({
      title,
      subject,
      education_level: educationLevel,
      topic,
      content,
      visibility,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please check your inputs.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();

      if (isEditing && initialData) {
        const { error: updateError } = await supabase
          .from("notes")
          .update({
            title: parsed.data.title,
            subject: parsed.data.subject,
            education_level: parsed.data.education_level,
            topic: parsed.data.topic || null,
            content: parsed.data.content,
            visibility: parsed.data.visibility,
          })
          .eq("id", initialData.id)
          .eq("author_id", userId);

        if (updateError) throw new Error(updateError.message);
        router.push(`/notes/${initialData.id}`);
        router.refresh();
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("notes")
          .insert({
            author_id: userId,
            title: parsed.data.title,
            subject: parsed.data.subject,
            education_level: parsed.data.education_level,
            topic: parsed.data.topic || null,
            note_type: "created",
            content: parsed.data.content,
            visibility: parsed.data.visibility,
            status: "active",
          })
          .select("id")
          .single();

        if (insertError) throw new Error(insertError.message);
        router.push(`/notes/${inserted.id}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="noteTitle">Note Title *</Label>
          <Input
            id="noteTitle"
            required
            placeholder="e.g., Newton's Laws of Motion — Quick Summary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="noteSubject">Subject *</Label>
          <Input
            id="noteSubject"
            required
            placeholder="e.g., Physics"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="noteLevel">Class / Education Level *</Label>
          <Select
            id="noteLevel"
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
          <Label htmlFor="noteTopic">Topic (optional)</Label>
          <Input
            id="noteTopic"
            placeholder="e.g., Mechanics"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="noteVisibility">Visibility *</Label>
          <Select
            id="noteVisibility"
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

      {/* Editor + Preview */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Note Content *</Label>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5">
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer ${
                !previewMode
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
              Write
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer ${
                previewMode
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>
        </div>

        {!previewMode ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/50 px-2.5 py-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting("\n## ")}
                title="Heading"
              >
                <Heading2 className="h-4 w-4" />
                <span className="text-xs">Heading</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting("**", "**")}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting("*", "*")}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting("\n- ")}
                title="Bullet list"
              >
                <List className="h-4 w-4" />
                <span className="text-xs">List</span>
              </Button>
            </div>
            <Textarea
              ref={textareaRef}
              rows={12}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`## Key Concepts\nWrite your study notes clearly...\n\n- Point 1\n- Point 2`}
              className="border-0 rounded-none focus-visible:ring-0 font-sans"
            />
          </div>
        ) : (
          <div className="min-h-[260px] rounded-xl border border-border bg-card p-5">
            {content.trim() ? (
              <NoteContentRenderer content={content} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing to preview yet. Switch to Write to add content.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : isEditing
            ? "Save Changes"
            : "Publish Note"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
