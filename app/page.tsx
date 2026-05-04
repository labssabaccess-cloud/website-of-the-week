import { createClient } from '@/lib/supabase/server';
import { getLeaderboard } from '@/lib/actions/vote';
import Link from 'next/link';
import { Globe, Trophy, ArrowUp } from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const categories = [
    { id: 'design', label: 'Design' },
    { id: 'utility', label: 'Utility' },
    { id: 'fun', label: 'Fun' },
  ];

  const leaderboards = await Promise.all(
    categories.map(async (cat) => ({
      ...cat,
      entries: await getLeaderboard(cat.id, 5),
    }))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Website of the Week</h1>
          <p className="text-gray-500 mt-1">Discover and vote for the best websites every week.</p>
        </div>
        {user && (
          <Link
            href="/submit"
            className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
          >
            + Submit
          </Link>
        )}
      </div>

      {leaderboards.map((cat) => (
        <section key={cat.id} className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {cat.label}
          </h2>
          {cat.entries.length === 0 ? (
            <p className="text-gray-400 text-sm">No entries yet for this category.</p>
          ) : (
            <div className="space-y-3">
              {cat.entries.map((entry: any, i: number) => (
                <div
                  key={entry.website.id}
                  className="border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-6">{i + 1}</span>
                    {entry.website.favicon_url ? (
                      <img
                        src={entry.website.favicon_url}
                        alt=""
                        className="w-8 h-8 rounded"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <Globe className="w-8 h-8 text-gray-300" />
                    )}
                    <div>
                      <a
                        href={entry.website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold hover:underline"
                      >
                        {entry.website.title}
                      </a>
                      <p className="text-xs text-gray-400">{entry.website.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
                    <ArrowUp className="h-4 w-4" />
                    {entry.totalScore}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
