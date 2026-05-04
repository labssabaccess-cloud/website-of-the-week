import { createClient } from '@/lib/supabase/server';
import { getLeaderboard } from '@/lib/actions/vote';
import Link from 'next/link';

export const revalidate = 60;

const CATEGORIES = [
  { id: 'design', label: 'Design', emoji: '🎨' },
  { id: 'developer-tools', label: 'Dev Tools', emoji: '🛠️' },
  { id: 'productivity', label: 'Productivity', emoji: '⚡' },
  { id: 'fun', label: 'Fun', emoji: '🎉' },
  { id: 'news', label: 'News', emoji: '📰' },
  { id: 'utility', label: 'Utility', emoji: '🔧' },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const leaderboards = await Promise.all(
    CATEGORIES.map(async (cat) => ({
      ...cat,
      entries: await getLeaderboard(cat.id, 5),
    }))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
          Live voting — resets every Sunday
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
          <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Of The Week</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
          Discover and vote for the best websites on the internet. One vote per category, per week.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/submit" className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25">
            + Submit a site
          </Link>
          <Link href="/archive" className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold border border-white/10 transition-all">
            View archive
          </Link>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {leaderboards.map((cat) => (
          <div key={cat.id} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-violet-500/30 transition-all duration-300 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{cat.emoji}</span>
                <h2 className="font-semibold text-white">{cat.label}</h2>
              </div>
              <span className="text-xs text-slate-500">{cat.entries.length} sites</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {cat.entries.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-slate-500 text-sm">No entries yet.</p>
                  <Link href="/submit" className="text-violet-400 text-sm hover:text-violet-300 mt-1 inline-block">Be first to submit →</Link>
                </div>
              ) : (
                cat.entries.map((entry: any, i: number) => (
                  <div key={entry.website.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors group">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      i === 1 ? 'bg-slate-400/20 text-slate-300' :
                      i === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/5 text-slate-500'
                    }`}>{i + 1}</span>
                    {entry.website.favicon_url ? (
                      <img src={entry.website.favicon_url} alt="" className="w-5 h-5 rounded flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-5 h-5 rounded bg-violet-500/20 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <a href={entry.website.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-200 hover:text-violet-400 truncate block transition-colors">
                        {entry.website.title}
                      </a>
                      <span className="text-xs text-slate-500 truncate block">{entry.website.domain}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-violet-400">
                      <span>▲</span>
                      <span>{Math.round(entry.totalScore)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
