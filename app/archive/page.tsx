import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Trophy, Calendar, ArrowLeft } from "lucide-react";

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ week?: string; category?: string }> }) {
  const { week, category } = await searchParams;
  const supabase = await createClient();
  const { data: weeks } = await supabase.from("voting_weeks").select("id, week_number, year, start_time, end_time").order("start_time", { ascending: false });
  const { data: categories } = await supabase.from("categories").select("id, name, slug").order("name");
  let archiveResults: any[] = [];
  let selectedWeek: any = null;
  let selectedCategory: any = null;
  if (week && category) {
    const weekId = weeks?.find((w) => w.week_number.toString() === week)?.id;
    const categoryId = categories?.find((c: any) => c.slug === category)?.id;
    if (weekId && categoryId) {
      selectedWeek = weeks?.find((w) => w.id === weekId);
      selectedCategory = categories?.find((c: any) => c.id === categoryId);
      const { data: archives } = await supabase.from("weekly_archives").select(`rank_position, total_score, websites!inner(id, title, domain, description, favicon_url, url)`).eq("week_id", weekId).eq("category_id", categoryId).order("rank_position", { ascending: true });
      archiveResults = archives || [];
    }
  }
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-md"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-bold">Historical Archives</h1>
      </div>
      <form className="flex flex-wrap gap-4 mb-8">
        <div><label className="block text-sm font-medium mb-1.5">Week</label><select name="week" defaultValue={week || ""} className="px-3 py-2 border rounded-md text-sm"><option value="">Select week...</option>{weeks?.map((w) => (<option key={w.id} value={w.week_number}>Week {w.week_number}, {w.year}</option>))}</select></div>
        <div><label className="block text-sm font-medium mb-1.5">Category</label><select name="category" defaultValue={category || ""} className="px-3 py-2 border rounded-md text-sm"><option value="">Select category...</option>{categories?.map((c: any) => (<option key={c.id} value={c.slug}>{c.name}</option>))}</select></div>
        <div className="flex items-end"><button type="submit" className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800">View Results</button></div>
      </form>
      {selectedWeek && selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600"><Calendar className="h-4 w-4" /><span className="text-sm">Week {selectedWeek.week_number}, {selectedWeek.year} — {selectedCategory.name}</span></div>
          {archiveResults.length === 0 ? <p className="text-gray-500 py-8 text-center">No archive data.</p> : (
            <div className="space-y-3">{archiveResults.map((entry: any) => (
              <div key={entry.websites.id} className={`flex items-center gap-4 p-4 border rounded-lg ${entry.rank_position <= 3 ? "bg-yellow-50 border-yellow-200" : ""}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${entry.rank_position === 1 ? "bg-yellow-400 text-white" : entry.rank_position === 2 ? "bg-gray-300 text-white" : entry.rank_position === 3 ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-600"}`}>{entry.rank_position <= 3 ? <Trophy className="h-4 w-4" /> : entry.rank_position}</div>
                <div className="flex-1"><Link href={`/website/${entry.websites.domain}`} className="font-medium hover:underline">{entry.websites.title}</Link><p className="text-sm text-gray-500">{entry.websites.domain}</p></div>
                <div className="text-right"><div className="font-bold">{Math.round(entry.total_score)}</div><div className="text-xs text-gray-500">points</div></div>
              </div>
            ))}</div>
          )}
        </div>
      )}
    </div>
  );
}
