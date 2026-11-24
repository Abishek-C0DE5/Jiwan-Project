import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  createClient,
  getCurrentUserWithProfile,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { DEMO_CATEGORIES } from "@/lib/data/demo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookForm } from "@/components/marketplace/BookForm";
import type { Category } from "@/types/database";

async function SellBookContent() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user) {
    redirect("/auth/login?redirectTo=/marketplace/new");
  }
  if (profile?.is_suspended) {
    redirect("/dashboard");
  }

  const supabaseConfigured = isSupabaseConfigured();
  let categories: Category[] = DEMO_CATEGORIES;

  if (supabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    categories = (data as Category[]) || [];
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Sell a Book</CardTitle>
        <CardDescription>
          Share accurate details and clear photos so other students can find
          your textbook.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BookForm
          categories={categories}
          userId={user.id}
          isDemoMode={!supabaseConfigured}
        />
      </CardContent>
    </Card>
  );
}

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
        <SellBookContent />
      </Suspense>
    </div>
  );
}
