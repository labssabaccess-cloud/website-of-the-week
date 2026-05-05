'use client';
import Link from 'next/link';
import Image from 'next/image';
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
          <Image
            src="/logo.svg"
            alt="OTW"
            width={80}
            height={28}
            className="h-7 w-auto"
            priority
          />
          <span className="text-xs text-slate-500 font-medium hidden sm:block">of the week</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/submit"
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-900/30"
          >
            + Submit
          </Link>
          {user ? (
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
