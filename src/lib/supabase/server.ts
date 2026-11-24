import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DEMO_COOKIE_NAME, getDemoAccountByRole } from "@/lib/auth/demo";
import type { Profile } from "@/types/database";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component where setting cookies is not allowed.
          // Session refresh is handled in src/proxy.ts.
        }
      },
    },
  });
}

export async function getCurrentUserWithProfile(): Promise<{
  user: { id: string; email?: string } | null;
  profile: Profile | null;
}> {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const demoRole = cookieStore.get(DEMO_COOKIE_NAME)?.value;
    const demoAccount = getDemoAccountByRole(demoRole);
    if (demoAccount) {
      return {
        user: demoAccount.user,
        profile: demoAccount.profile,
      };
    }
    return { user: null, profile: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return {
    user: { id: user.id, email: user.email },
    profile: profile ?? null,
  };
}
