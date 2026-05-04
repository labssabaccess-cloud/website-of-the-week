"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit/limiter";
import { headers } from "next/headers";

interface VoteResult {
  success: boolean;
  transferred: boolean;
  weight: number;
  error?: string;
}

export async function castVote(websiteId: string, categoryId: string): Promise<VoteResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, transferred: false, weight: 0, error: "Authentication required" };
  if (!user.email_confirmed_at) return { success: false, transferred: false, weight: 0, error: "Email verification required" };

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  const limited = await rateLimit(`vote:${user.id}:${ip}`);
  if (!limited.success) return { success: false, transferred: false, weight: 0, error: `Rate limit exceeded. Try again in ${limited.retryAfter}s` };

  const { data: activeWeek } = await supabase.from("voting_weeks").select("id").eq("is_active", true).single();
  if (!activeWeek) return { success: false, transferred: false, weight: 0, error: "No active voting week" };

  const { data: voteResult, error: voteError } = await supabase.rpc("cast_vote", {
    p_user_id: user.id,
    p_website_id: websiteId,
    p_category_id: categoryId,
    p_week_id: activeWeek.id,
  });

  if (voteError) return { success: false, transferred: false, weight: 0, error: voteError.message };

  const result = voteResult[0];
  revalidatePath("/");
  revalidatePath(`/website/${websiteId}`);
  return { success: true, transferred: result.transferred, weight: result.new_weight };
}

export async function getLeaderboard(categoryId: string, limit: number = 20) {
  const supabase = await createClient();
  const { data: activeWeek } = await supabase.from("voting_weeks").select("id").eq("is_active", true).single();
  if (!activeWeek) return [];

  const { data: votes } = await supabase
    .from("votes")
    .select("website_id, vote_weight, websites!inner(id, title, domain, description, favicon_url, url)")
    .eq("category_id", categoryId)
    .eq("week_id", activeWeek.id)
    .limit(limit);

  const scores: Record<string, { website: any; totalScore: number }> = {};
  votes?.forEach((v: any) => {
    if (!scores[v.website_id]) scores[v.website_id] = { website: v.websites, totalScore: 0 };
    scores[v.website_id].totalScore += v.vote_weight;
  });

  return Object.values(scores).sort((a, b) => b.totalScore - a.totalScore);
}

export async function getUserVoteForCategory(categoryId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: activeWeek } = await supabase.from("voting_weeks").select("id").eq("is_active", true).single();
  if (!activeWeek) return null;
  const { data: vote } = await supabase.from("votes").select("website_id").eq("user_id", user.id).eq("category_id", categoryId).eq("week_id", activeWeek.id).single();
  return vote?.website_id || null;
}
