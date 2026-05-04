import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name, slug").order("name");
  const { data: activeWeek } = await supabase.from("voting_weeks").select("id").eq("is_active", true).single();
  const leaderboards: Record<string, any[]> = {};
  if (activeWeek && categories) {
    for (const category of categories) {
      const { data: votes } = await supabase
        .from("votes")
        .select(`website_id, vote_weight, websites!inner(id, title, domain, description, favicon_url, url)`)
        .eq("category_id", category.id)
        .eq("week_id", activeWeek.id)
        .order("vote_weight", { ascending: false })
        .limit(20);
      const scores: Record<string, any> = {};
      votes?.forEach((vote: any) => {
        if (!scores[vote.website_id]) scores[vote.website_id] = { website: vote.websites, totalScore: 0 };
        scores[vote.website_id].totalScore += vote.vote_weight;
      });
      leaderboards[category.id] = Object.values(scores)
        .sort((a: any, b: any) => b.totalScore - a.totalScore)
        .map((entry: any) => ({ website: entry.website, totalScore: entry.totalScore, userVoted: false }));
    }
  }
  return NextResponse.json(leaderboards);
}
