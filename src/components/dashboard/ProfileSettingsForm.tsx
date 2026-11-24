"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { profileSchema } from "@/lib/validations/schemas";
import {
  ALLOWED_IMAGE_TYPES,
  EDUCATION_LEVELS,
  MAX_PROFILE_IMAGE_BYTES,
} from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/types/database";

export function ProfileSettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name);
  const [institution, setInstitution] = useState(profile.institution || "");
  const [educationLevel, setEducationLevel] = useState(
    profile.education_level || ""
  );
  const [location, setLocation] = useState(profile.location || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Profile photo must be JPG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setError("Profile photo must be 2 MB or less.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${profile.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw new Error(uploadError.message);

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsed = profileSchema.safeParse({
      full_name: fullName,
      institution,
      education_level: educationLevel,
      location,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid profile inputs.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: parsed.data.full_name,
          institution: parsed.data.institution || null,
          education_level: parsed.data.education_level || null,
          location: parsed.data.location || null,
          avatar_url: avatarUrl || null,
        })
        .eq("id", profile.id);

      if (updateError) throw new Error(updateError.message);
      setSuccess("Profile updated successfully.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {error && <Alert variant="destructive">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} name={fullName} size="lg" />
        <div className="space-y-1">
          <Label className="block">Profile Photo</Label>
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
            {uploadingAvatar ? "Uploading..." : "Change photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="sr-only"
            />
          </label>
          <p className="text-xs text-muted-foreground">JPG, PNG, or WebP (max 2 MB)</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pEmail">Email (private, never shown publicly)</Label>
        <Input id="pEmail" value={profile.email} disabled />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pFullName">Full Name *</Label>
        <Input
          id="pFullName"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pLevel">Class / Education Level</Label>
          <Select
            id="pLevel"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
          >
            <option value="">Not specified</option>
            {EDUCATION_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pLocation">City / General Location</Label>
          <Input
            id="pLocation"
            placeholder="e.g., Lalitpur"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pInstitution">Educational Institution</Label>
        <Input
          id="pInstitution"
          placeholder="e.g., Pulchowk Campus"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={saving || uploadingAvatar}>
        {saving ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
