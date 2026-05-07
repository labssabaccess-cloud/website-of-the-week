import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 60;

const ACHIEVEMENT_META: Record<string, { icon: string; label: string; color: string }> = {
  first_win: { icon: '🥇', label: 'First Win', color: 'text-yellow-400' },
  hat_trick: { icon: '🎩', label: 'Hat Trick (3 wins)', color: 'text-purple-400' },
  five_wins: { icon: '⭐', label: '5 Wins', color: 'text-blue-400' },
  ten_wins: { icon: '💎', label: '10 Wins', color: 'text-cyan-400' },
  streak_3: { icon: '🔥', label: '3-Week Streak', color: 'text-orange-400' },
  streak_5: { icon: '⚡', label: '5-Week Streak', color: 'text-yellow-300' },
  community_fav: { icon: '❤️', label: 'Community Favourite', color: 'text-red-400' },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function SiteProfilePage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const supabase = await createClient();
  const slug = decodeURIComponent(rawSlug);

  // Fetch website data
  const { data: site } = await supabase
    .from('websites')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!site) notFound();

  // Fetch win tallies
  const { data: tallies } = await supabase
    .from('website_win_tallies')
    .select('category_id, win_count, last_win_week_start, streak_weeks')
    .eq('website_id', site.id);

  // Fetch achievements
  const { data: achievements } = await supabase
    .from('website_achievements')
    .select('achievement_type, awarded_at')
    .eq('website_id', site.id)
    .order('awarded_at', { ascending: false });

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('website_reviews')
    .select('id, sentiment, body, created_at')
    .eq('website_id', site.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const totalWins = tallies?.reduce((sum, t) => sum + (t.win_count ?? 0), 0) ?? 0;
  const pros = reviews?.filter(r => r.sentiment === 'pro') ?? [];
  const cons = reviews?.filter(r => r.sentiment === 'con') ?? [];

  const categoryLabels: Record<string, string> = {
    design: 'Design',
    'developer-tools': 'Dev Tools',
    productivity: 'Productivity',
    fun: 'Fun',
    news: 'News',
    utility: 'Utility',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-gray-400 hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors">
            ← Back to leaderboard
          </Link>
          <div className="flex items-start gap-6 mt-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-3xl shadow-xl">
              {site.favicon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={site.favicon_url} alt="" className="w-12 h-12 rounded-xl" />
              ) : (
                '🌐'
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{site.name}</h1>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 text-sm mt-1 inline-block transition-colors"
              >
                {site.url} ↗
              </a>
              {site.description && (
                <p className="text-gray-300 mt-2 text-sm max-w-xl">{site.description}</p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mt-8">
            <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">{totalWins}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total Wins</p>
            </div>
            <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{achievements?.length ?? 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Achievements</p>
            </div>
            <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-green-400">{pros.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Pros</p>
            </div>
            <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-red-400">{cons.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Cons</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        {/* Win Tallies by Category */}
        {tallies && tallies.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🏆</span> Win Tallies by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tallies.map(t => (
                <div
                  key={t.category_id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-indigo-600 transition-colors"
                >
                  <p className="text-sm text-gray-400 capitalize">{categoryLabels[t.category_id] ?? t.category_id}</p>
                  <p className="text-3xl font-bold text-white mt-1">{t.win_count}</p>
                  {t.streak_weeks > 1 && (
                    <p className="text-xs text-orange-400 mt-1">🔥 {t.streak_weeks}-week streak</p>
                  )}
                  {t.last_win_week_start && (
                    <p className="text-xs text-gray-600 mt-1">
                      Last win: {new Date(t.last_win_week_start).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🎖️</span> Achievements
            </h2>
            <div className="flex flex-wrap gap-3">
              {achievements.map((a, i) => {
                const meta = ACHIEVEMENT_META[a.achievement_type] ?? {
                  icon: '🏅',
                  label: a.achievement_type,
                  color: 'text-gray-300',
                };
                return (
                  <div
                    key={i}
                    className="bg-gray-900 border border-gray-800 rounded-full px-4 py-2 flex items-center gap-2 hover:border-purple-600 transition-colors"
                    title={`Awarded ${new Date(a.awarded_at).toLocaleDateString()}`}
                  >
                    <span className="text-lg">{meta.icon}</span>
                    <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Pros & Cons */}
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span>💬</span> Community Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pros */}
            <div>
              <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                <span>✅</span> Pros ({pros.length})
              </h3>
              {pros.length === 0 ? (
                <p className="text-gray-600 text-sm">No pros submitted yet.</p>
              ) : (
                <ul className="space-y-3">
                  {pros.map(r => (
                    <li
                      key={r.id}
                      className="bg-gray-900 border border-green-900/40 rounded-xl p-4 text-sm text-gray-300"
                    >
                      {r.body}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Cons */}
            <div>
              <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                <span>❌</span> Cons ({cons.length})
              </h3>
              {cons.length === 0 ? (
                <p className="text-gray-600 text-sm">No cons submitted yet.</p>
              ) : (
                <ul className="space-y-3">
                  {cons.map(r => (
                    <li
                      key={r.id}
                      className="bg-gray-900 border border-red-900/40 rounded-xl p-4 text-sm text-gray-300"
                    >
                      {r.body}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Submit Review CTA */}
        <section className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-800/40 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Have an opinion?</h3>
          <p className="text-gray-400 text-sm mb-5">Submit a pro or con for this site and help the community.</p>
          <Link
            href={`/sites/${slug}/review`}
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Write a Review
          </Link>
        </section>
      </div>
    </div>
  );
}
