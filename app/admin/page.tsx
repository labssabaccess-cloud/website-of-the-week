import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ApproveButtons } from '@/components/admin/approve-buttons';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-white mb-2">Access denied</h1>
      <p className="text-slate-400">You don't have admin privileges.</p>
    </div>
  );

  const { data: pending } = await supabase
    .from('websites')
    .select('id, title, url, domain, description, favicon_url, created_at, submitter_id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Admin Dashboard</h1>
        <p className="text-slate-400">{pending?.length ?? 0} websites pending review</p>
      </div>

      {!pending || pending.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-16 text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-slate-400">All caught up! No pending submissions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((site) => (
            <div key={site.id} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 flex flex-col sm:flex-row gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {site.favicon_url ? (
                  <img src={site.favicon_url} alt="" className="w-10 h-10 rounded-lg flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate">{site.title}</h3>
                  <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-400 hover:text-violet-300 truncate block transition-colors">{site.domain}</a>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{site.description}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <ApproveButtons websiteId={site.id} currentStatus="pending" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
