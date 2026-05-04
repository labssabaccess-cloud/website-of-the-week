import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const revalidate = 300;

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  design: { label: 'Design', emoji: '🎨' },
  'developer-tools': { label: 'Dev Tools', emoji: '🛠️' },
  productivity: { label: 'Productivity', emoji: '⚡' },
  fun: { label: 'Fun', emoji: '🎉' },
  news: { label: 'News', emoji: '📰' },
  utility: { label: 'Utility', emoji: '🔧' },
};

export default async function ArchivePage() {
  const supabase = await createClient();

  const { data: weeks } = await supabase
    .from('voting_weeks')
    .select('id, week_number, year, start_time, end_time, is_active')
    .eq('is_active', false)
    .order('year', { ascending: false })
    .order('week_number', { ascending: false })
    .limit(20);

  const { data: archives } = await supabase
    .from('weekly_archives')
    .select('week_id, category_id, rank_position, total_score, websites(id, title, domain, favicon_url, url)')
    .order('rank_position', { ascending: true });

  const grouped: Record<string, typeof archives> = {};
  archives?.forEach((entry) => {
    const key = `${entry.week_id}__${entry.category_id}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(entry);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2">🏆 Archive</h1>
        <p className="text-slate-400">Browse past weekly leaderboard winners.</p>
      </div>

      {!weeks || weeks.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-16 text-center">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-slate-400">No past weeks yet. Check back after the first week ends!</p>
          <Link href="/" className="text-violet-400 hover:text-violet-300 text-sm mt-2 inline-block">View live leaderboard →</Link>
        </div>
      ) : (
        <div className="space-y-12">
          {weeks.map((week) => (
            <div key={week.id}>
              <h2 className="text-xl font-bold text-white mb-4">
                Week {week.week_number} — <span className="text-slate-400 font-normal text-base">{week.year}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(CATEGORY_LABELS).map(([catSlug, { label, emoji }]) => {
                  const key = `${week.id}__${catSlug}`;
                  const entries = grouped[key] || [];
                  return (
                    <div key={catSlug} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                        <span>{emoji}</span>
                        <span className="text-sm font-semibold text-white">{label}</span>
                      </div>
                      <div className="divide-y divide-white/[0.04]">
                        {entries.length === 0 ? (
                          <p className="px-4 py-4 text-xs text-slate-500">No data for this category.</p>
                        ) : entries.slice(0, 3).map((entry: any) => (
                          <div key={entry.rank_position} className="px-4 py-3 flex items-center gap-3">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              entry.rank_position === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                              entry.rank_position === 2 ? 'bg-slate-400/20 text-slate-300' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>{entry.rank_position}</span>
                            {entry.websites?.favicon_url && <img src={entry.websites.favicon_url} alt="" className="w-4 h-4 rounded flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <a href={entry.websites?.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-slate-200 hover:text-violet-400 truncate block transition-colors">
                                {entry.websites?.title}
                              </a>
                            </div>
                            <span className="text-xs text-violet-400 font-semibold">{Math.round(entry.total_score)} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
