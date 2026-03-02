'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center">
        <button
          type="button"
          className="mr-3 md:hidden"
          onClick={onMenuToggle}
          aria-label="メニューを開く"
        >
          <div className="flex h-6 w-6 flex-col items-center justify-center gap-1">
            <div className="h-0.5 w-5 bg-gray-600" />
            <div className="h-0.5 w-5 bg-gray-600" />
            <div className="h-0.5 w-5 bg-gray-600" />
          </div>
        </button>
        <Link href="/reports" className="text-lg font-bold text-gray-900">
          営業日報システム
        </Link>
      </div>
      <div className="flex items-center">
        {user && (
          <>
            <span className="text-sm text-gray-700">{user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-4 text-sm text-gray-500 hover:text-gray-700"
            >
              ログアウト
            </button>
          </>
        )}
      </div>
    </header>
  );
}
