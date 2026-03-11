'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import {
  LayoutDashboard, Users, MapPin, Trophy, LogOut, Wifi, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem { href: string; label: string; icon: React.ReactNode; roles: string[]; }

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['student'] },
  { href: '/teacher',   label: 'Class Overview', icon: <Users className="w-5 h-5" />, roles: ['teacher'] },
  { href: '/admin',     label: 'Admin Panel', icon: <Users className="w-5 h-5" />, roles: ['admin'] },
  { href: '/teacher/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-5 h-5" />, roles: ['teacher', 'admin'] },
];

export default function Sidebar() {
  const { user, clearUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch {}
    clearUser();
    router.push('/login');
  }

  const visible = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="w-64 min-h-screen bg-brand-900 text-white flex flex-col">
      {/* Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">TapIt</p>
            <p className="text-xs text-indigo-300 capitalize">{user?.role ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {visible.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              )}
            >
              {item.icon}
              {item.label}
              {active && <ChevronRight className="ml-auto w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold uppercase">
            {user?.email?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-indigo-300 capitalize">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full text-indigo-200 hover:text-white hover:bg-white/10 justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
