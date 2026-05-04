"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function generateClaimToken(websiteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const token = `otw-verify-${crypto.randomBytes(16).toString("hex")}`;

  const { error } = await supabase
    .from("websites")
    .update({ claim_token: token })
    .eq("id", websiteId)
    .is("owner_id", null);

  if (error) throw new Error(error.message);
  return { token };
}

export async function verifyOwnership(websiteId: string, method?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const { data: website } = await supabase
    .from("websites")
    .select("domain, claim_token")
    .eq("id", websiteId)
    .single();

  if (!website?.claim_token) throw new Error("No claim token found. Generate one first.");

  try {
    const res = await fetch(`https://${website.domain}`, {
      headers: { "User-Agent": "OTW-Verify/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    const metaMatch = html.match(
      new RegExp(`<meta[^>]*name=["']otw-verify["'][^>]*content=["']${website.claim_token}["']`, "i")
    );
    if (metaMatch) {
      await supabase.from("websites").update({
        owner_id: user.id,
        is_verified_owner: true,
        claim_token: null,
      }).eq("id", websiteId);
      await supabase.from("users").update({ reputation_score: 1.2 }).eq("id", user.id);
      revalidatePath(`/website/${website.domain}`);
      return { success: true, method: "meta" };
    }
  } catch {}

  return { success: false, error: "Token not found in page HTML. Make sure the meta tag is published." };
}
