import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient, getCurrentUserWithProfile } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookForm } from "@/components/marketplace/BookForm";
import type { BookListing, Category } from "@/types/database";

async function EditBookContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const { user } = await getCurrentUserWithProfile();
  if (!user) {
    redirect(`/auth/login?redirectTo=/books/${id}/edit`);
  }

  const supabase = await createClient();
  const [{ data: book }, { data: categories }] = await Promise.all([
    supabase
      .from("book_listings")
      .select("*")
      .eq("id", id)
      .single<BookListing>(),
    supabase.from("categories").select("*").order("name", { ascending: true }),
  ]);

  if (!book) {
    notFound();
  }
  if (book.seller_id !== user.id) {
    redirect(`/books/${id}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Edit Book Listing</CardTitle>
        <CardDescription>
          Update the price, condition, photos, or description for your book.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BookForm
          categories={(categories as Category[]) || []}
          userId={user.id}
          initialData={book}
        />
      </CardContent>
    </Card>
  );
}

export default function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
        <EditBookContent paramsPromise={params} />
      </Suspense>
    </div>
  );
}
