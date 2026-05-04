"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addComment(websiteId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  if (!content || content.trim().length < 1 || content.trim().length > 1000) {
    throw new Error("Comment must be between 1 and 1000 characters");
  }
  const { data, error } = await supabase
    .from("comments")
    .insert({ website_id: websiteId, user_id: user.id, content: content.trim() })
    .select("*, users(username, email)")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/website/${websiteId}`);
  return data;
}

export async function deleteComment(commentId: string, websiteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath(`/website/${websiteId}`);
  return { success: true };
}

export async function getComments(websiteId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, users(username, email)")
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
