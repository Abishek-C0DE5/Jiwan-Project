import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getCurrentUserWithProfile } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";

async function ProfileContent() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || !profile) {
    redirect("/auth/login?redirectTo=/profile");
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            Update your student details. Your email is always kept private.
          </CardDescription>
        </div>
        <Link href={`/profile/${profile.id}`}>
          <Button variant="outline" size="sm">
            View Public Profile
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ProfileSettingsForm profile={profile} />
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<Skeleton className="h-[460px] w-full" />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
