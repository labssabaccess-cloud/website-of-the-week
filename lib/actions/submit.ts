"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitWebsite(input: {
  url: string;
  title: string;
  description?: string;
  categories: string[];
  faviconUrl?: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Authentication required");
  if (!input.categories?.length) throw new Error("Select at least one category");

  let normalizedUrl = input.url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`;

  let domain = "";
  try {
    domain = new URL(normalizedUrl).hostname.replace(/^www\./, "");
  } catch {
    throw new Error("Invalid URL");
  }

  const { data: website, error } = await supabase
    .from("websites")
    .insert({
      url: normalizedUrl,
      domain,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      favicon_url: input.faviconUrl || null,
      og_image: input.faviconUrl || null,
      submitted_by: user.id,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const categoryRows = input.categories.map((category) => ({
    website_id: website.id,
    category,
  }));

  const { error: catError } = await supabase.from("website_categories").insert(categoryRows);
  if (catError) throw new Error(catError.message);

  revalidatePath("/");
  revalidatePath("/submit");
  return { success: true, domain, websiteId: website.id };
}
