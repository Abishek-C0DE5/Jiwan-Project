"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { bookListingSchema } from "@/lib/validations/schemas";
import {
  ALLOWED_IMAGE_TYPES,
  BOOK_CONDITIONS,
  EDUCATION_LEVELS,
  MAX_BOOK_IMAGE_BYTES,
} from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import type { BookListing, Category } from "@/types/database";

interface BookFormProps {
  categories: Category[];
  userId: string;
  initialData?: BookListing;
}

export function BookForm({
  categories,
  userId,
  initialData,
}: BookFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title || "");
  const [author, setAuthor] = useState(initialData?.author || "");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id || categories[0]?.id || ""
  );
  const [educationLevel, setEducationLevel] = useState(
    initialData?.education_level || EDUCATION_LEVELS[1]
  );
  const [priceNpr, setPriceNpr] = useState(
    initialData ? String(initialData.price_npr) : ""
  );
  const [originalPriceNpr, setOriginalPriceNpr] = useState(
    initialData?.original_price_npr ? String(initialData.original_price_npr) : ""
  );
  const [condition, setCondition] = useState(
    initialData?.condition || BOOK_CONDITIONS[1]
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.images || []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const files = Array.from(e.target.files || []);
    const totalCount = existingImages.length + newFiles.length + files.length;
    if (totalCount > 5) {
      setError("You can upload up to 5 images per book listing.");
      return;
    }

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError("Only JPG, PNG, and WebP images are allowed.");
        return;
      }
      if (file.size > MAX_BOOK_IMAGE_BYTES) {
        setError(`"${file.name}" exceeds the 5 MB image limit.`);
        return;
      }
    }

    setNewFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = bookListingSchema.safeParse({
      title,
      author,
      subject,
      category_id: categoryId,
      education_level: educationLevel,
      price_npr: priceNpr,
      original_price_npr: originalPriceNpr,
      condition,
      description,
      location,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please check your inputs.");
      return;
    }

    if (existingImages.length === 0 && newFiles.length === 0) {
      setError("Please add at least one photo of your book.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [...existingImages];

      for (const file of newFiles) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("book-images")
          .upload(filePath, file, { contentType: file.type });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("book-images").getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      const payload = {
        ...parsed.data,
        images: uploadedUrls,
      };

      if (isEditing && initialData) {
        const { error: updateError } = await supabase
          .from("book_listings")
          .update(payload)
          .eq("id", initialData.id)
          .eq("seller_id", userId);

        if (updateError) {
          throw new Error(updateError.message);
        }

        router.push(`/books/${initialData.id}`);
        router.refresh();
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("book_listings")
          .insert({
            ...payload,
            seller_id: userId,
            status: "available",
          })
          .select("id")
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        router.push(`/books/${inserted.id}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Book Title *</Label>
          <Input
            id="title"
            required
            placeholder="e.g., Principles of Physics (Grade 12)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="author">Author *</Label>
          <Input
            id="author"
            required
            placeholder="e.g., Halliday & Resnick"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            required
            placeholder="e.g., Physics"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <Select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="educationLevel">Class / Education Level *</Label>
          <Select
            id="educationLevel"
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
          <Label htmlFor="priceNpr">Selling Price (NPR) *</Label>
          <Input
            id="priceNpr"
            type="number"
            min={0}
            required
            placeholder="e.g., 450"
            value={priceNpr}
            onChange={(e) => setPriceNpr(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="originalPriceNpr">Original Price (NPR, optional)</Label>
          <Input
            id="originalPriceNpr"
            type="number"
            min={0}
            placeholder="e.g., 950"
            value={originalPriceNpr}
            onChange={(e) => setOriginalPriceNpr(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="condition">Book Condition *</Label>
          <Select
            id="condition"
            value={condition}
            onChange={(e) =>
              setCondition(e.target.value as (typeof BOOK_CONDITIONS)[number])
            }
          >
            {BOOK_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">General Location (City / Area) *</Label>
          <Input
            id="location"
            required
            placeholder="e.g., Baneshwor, Kathmandu"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          required
          rows={4}
          placeholder="Describe the edition, markings/highlights, and where you prefer to hand over the book..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <Label>Book Photos * (up to 5 images, max 5 MB each)</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {existingImages.map((url, idx) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Book photo ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setExistingImages((prev) => prev.filter((_, i) => i !== idx))
                }
                className="absolute top-1.5 right-1.5 rounded-full bg-card/90 p-1 text-destructive shadow hover:bg-card cursor-pointer"
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {newFiles.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setNewFiles((prev) => prev.filter((_, i) => i !== idx))
                }
                className="absolute top-1.5 right-1.5 rounded-full bg-card/90 p-1 text-destructive shadow hover:bg-card cursor-pointer"
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {existingImages.length + newFiles.length < 5 && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/40 text-xs text-muted-foreground hover:bg-muted">
              <ImagePlus className="h-6 w-6" />
              <span>Add photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? isEditing
              ? "Saving changes..."
              : "Publishing listing..."
            : isEditing
            ? "Save changes"
            : "Publish listing"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
