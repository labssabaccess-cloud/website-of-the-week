import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const websiteId = searchParams.get("websiteId");
  if (!websiteId) return NextResponse.json({ error: "Missing websiteId" }, { status: 400 });

  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select(`*, users(username, id)`)
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json(data || []);
}
