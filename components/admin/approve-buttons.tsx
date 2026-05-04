'use client';

import { useState } from 'react';
import { updateWebsiteStatus } from '@/lib/actions/admin';

export function ApproveButtons({ websiteId, currentStatus }: { websiteId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handle = async (newStatus: 'approved' | 'rejected') => {
    setLoading(true);
    await updateWebsiteStatus(websiteId, newStatus);
    setStatus(newStatus);
    setLoading(false);
  };

  if (status === 'approved') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
      ✓ Approved
    </span>
  );

  if (status === 'rejected') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
      ✕ Rejected
    </span>
  );

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handle('approved')}
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium transition-all disabled:opacity-50"
      >
        {loading ? '...' : '✓ Approve'}
      </button>
      <button
        onClick={() => handle('rejected')}
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-sm font-medium transition-all disabled:opacity-50"
      >
        {loading ? '...' : '✕ Reject'}
      </button>
    </div>
  );
}
