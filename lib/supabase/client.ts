import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NPSU!,
    process.env.KEPUB!
  );
}
