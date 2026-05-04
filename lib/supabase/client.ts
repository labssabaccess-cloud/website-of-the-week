import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_NPSU!,
    process.env.NEXT_PUBLIC_KEPUB!
  );
}
