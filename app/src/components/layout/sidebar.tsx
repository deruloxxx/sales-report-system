'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  label: string;
  href: string;
  managerOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { label: '日報', href: '/reports' },
  { label: '顧客', href: '/customers' },
  { label: '営業', href: '/staffs', managerOnly: true },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isManager } = useAuth();

  const visibleItems = menuItems.filter((item) => !item.managerOnly || isManager);

  const sidebarContent = (
    <nav className="min-h-0 w-60 overflow-y-auto border-r border-gray-200 bg-white">
      <ul>
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={`flex items-center px-6 py-3 text-sm font-medium ${
                  isActive
                    ? 'border-r-2 border-blue-700 bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block">{sidebarContent}</aside>

      {/* Mobile overlay sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
          <aside className="relative z-50 h-full">{sidebarContent}</aside>
        </div>
      )}
    </>
  );
}
