'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: { slug: string };
}

export default function ReviewPage({ params }: Props) {
  const slug = params.slug;
  const router = useRouter();
  const [sentiment, setSentiment] = useState<'pro' | 'con'>('pro');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, sentiment, body: body.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to submit review.');
      } else {
        setSuccess(true);
        setTimeout(() => router.push(`/sites/${slug}`), 2000);
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <Link
          href={`/sites/${slug}`}
          className="text-gray-400 hover:text-white text-sm mb-8 inline-flex items-center gap-1 transition-colors"
        >
          ← Back to profile
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mt-4">
          <h1 className="text-2xl font-bold mb-1">Write a Review</h1>
          <p className="text-gray-400 text-sm mb-6">Share what you think about this site.</p>

          {success ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-green-400 font-semibold">Review submitted!</p>
              <p className="text-gray-400 text-sm mt-1">Redirecting back to the profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sentiment selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSentiment('pro')}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
                      sentiment === 'pro'
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-green-700'
                    }`}
                  >
                    ✅ Pro
                  </button>
                  <button
                    type="button"
                    onClick={() => setSentiment('con')}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
                      sentiment === 'con'
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-red-700'
                    }`}
                  >
                    ❌ Con
                  </button>
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your review
                </label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder={sentiment === 'pro' ? 'What do you love about this site?' : 'What could be improved?'}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
                <p className="text-xs text-gray-600 mt-1 text-right">{body.length}/500</p>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !body.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
