'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">OTW</span>
          <span className="text-xs text-slate-500 font-medium hidden sm:block">of the week</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/submit"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25"
          >
            + Submit
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-sm text-slate-400 truncate max-w-[140px]">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
