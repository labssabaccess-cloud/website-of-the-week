import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ApproveButtons from '@/components/admin/approve-buttons';
import { Globe } from 'lucide-react';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  if (!userData?.is_admin) redirect('/');

  const { data: pendingWebsites } = await supabase
    .from('websites')
    .select('*, users!submitter_id(username, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin — Pending Submissions</h1>
      {!pendingWebsites?.length ? (
        <p className="text-gray-500 text-center py-12">No pending submissions</p>
      ) : (
        <div className="space-y-4">
          {pendingWebsites.map((site: any) => (
            <div key={site.id} className="border rounded-xl p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {site.favicon_url ? (
                    <img src={site.favicon_url} alt="" className="w-10 h-10 rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold">{site.title}</h2>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {site.domain}
                    </a>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(site.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{site.description}</p>
              <div className="text-xs text-gray-500">
                Submitted by {site.users?.username || site.users?.email}
              </div>
              <ApproveButtons websiteId={site.id} currentStatus={site.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
