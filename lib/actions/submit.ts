"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface SubmitResult {
  success: boolean;
  domain?: string;
  websiteId?: string;
  error?: string;
}

export async function submitWebsite(formData: FormData): Promise<SubmitResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required" };

    const categories = formData.getAll("categories") as string[];
    if (!categories.length) return { success: false, error: "Select at least one category" };

    let url = (formData.get("url") as string | null)?.trim() ?? "";
    if (!url) return { success: false, error: "URL is required" };
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

    let domain = "";
    try {
      domain = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return { success: false, error: "Invalid URL" };
    }

    const title = (formData.get("title") as string | null)?.trim() ?? "";
    if (!title) return { success: false, error: "Title is required" };

    const description = (formData.get("description") as string | null)?.trim() || null;
    const faviconUrl = (formData.get("faviconUrl") as string | null) || null;

    const { data: website, error } = await supabase
      .from("websites")
      .insert({
        url,
        domain,
        title,
        description,
        favicon_url: faviconUrl,
        og_image: faviconUrl,
        submitted_by: user.id,
        status: "pending",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const categoryRows = categories.map((category) => ({
      website_id: website.id,
      category,
    }));

    const { error: catError } = await supabase.from("website_categories").insert(categoryRows);
    if (catError) return { success: false, error: catError.message };

    revalidatePath("/");
    revalidatePath("/submit");
    return { success: true, domain, websiteId: website.id };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Unexpected error" };
  }
}
