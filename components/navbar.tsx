'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="border-b px-4 py-3 flex items-center justify-between">
      <Link href="/" className="font-bold text-lg">Website of the Week</Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link href="/submit" className="text-sm">Submit</Link>
            <Link href="/auth/signout" className="text-sm">Sign out</Link>
          </>
        ) : (
          <Link href="/auth/signin" className="text-sm">Sign in</Link>
        )}
      </div>
    </nav>
  );
}
