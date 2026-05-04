'use client';

import { useState, useRef } from 'react';
import { submitWebsite } from '@/lib/actions/submit';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { id: 'design', label: 'Design', emoji: '🎨' },
  { id: 'developer-tools', label: 'Dev Tools', emoji: '🛠️' },
  { id: 'productivity', label: 'Productivity', emoji: '⚡' },
  { id: 'fun', label: 'Fun', emoji: '🎉' },
  { id: 'news', label: 'News', emoji: '📰' },
  { id: 'utility', label: 'Utility', emoji: '🔧' },
];

export default function SubmitPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const toggleCat = (id: string) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setSubmitting(true);
    setError('');
    const formData = new FormData(formRef.current);
    selectedCats.forEach((c) => formData.append('categories', c));
    const result = await submitWebsite(formData);
    if (result.success) setSuccess(true);
    else setError(result.error || 'Submission failed.');
    setSubmitting(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" /></div>;

  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h1 className="text-2xl font-bold text-white mb-2">Sign in required</h1>
      <p className="text-slate-400 mb-6">You need to sign in before you can submit a website.</p>
      <Link href="/auth/signin" className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all">Sign in</Link>
    </div>
  );

  if (success) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold text-white mb-2">Submitted!</h1>
      <p className="text-slate-400 mb-6">Your site has been submitted and is pending review by an admin.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setSuccess(false); formRef.current?.reset(); setSelectedCats([]); }} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all">Submit another</button>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all">Back to home</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Submit a website</h1>
        <p className="text-slate-400">All submissions are reviewed before going live. Max 2 categories.</p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Website URL *</label>
            <input name="url" type="url" required placeholder="https://example.com" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
            <input name="title" type="text" required placeholder="My Awesome Website" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
            <textarea name="description" required rows={3} placeholder="What makes this website special?" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all resize-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Categories * <span className="text-slate-500">(pick up to 2)</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const selected = selectedCats.includes(cat.id);
              const disabled = !selected && selectedCats.length >= 2;
              return (
                <button key={cat.id} type="button" onClick={() => toggleCat(cat.id)} disabled={disabled}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selected ? 'bg-violet-600/20 border-violet-500 text-violet-300' :
                    disabled ? 'bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed' :
                    'bg-white/[0.03] border-white/10 text-slate-300 hover:border-violet-500/50 hover:text-white'
                  }`}>
                  <span>{cat.emoji}</span><span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <button type="submit" disabled={submitting || selectedCats.length === 0}
          className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25">
          {submitting ? 'Submitting...' : 'Submit website'}
        </button>
      </form>
    </div>
  );
}
