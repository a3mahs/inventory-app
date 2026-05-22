'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useSocket } from '@/components/providers/SocketProvider';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/suppliers': 'Suppliers',
  '/movements': 'Stock Movements',
  '/alerts': 'Alerts',
  '/ai-assistant': 'AI Assistant',
  '/whatsapp': 'WhatsApp',
  '/settings': 'Settings',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { socket } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    // Load initial unread alerts count
    fetch('/api/alerts?unread=true')
      .then((r) => r.json())
      .then((d) => setUnreadAlerts(d.total || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNewAlert = () => setUnreadAlerts((n) => n + 1);
    const handleReadAlert = () => setUnreadAlerts((n) => Math.max(0, n - 1));
    const handleAllRead = () => setUnreadAlerts(0);

    socket.on('alert:created', handleNewAlert);
    socket.on('alert:marked-read', handleReadAlert);
    socket.on('alert:all-read', handleAllRead);

    return () => {
      socket.off('alert:created', handleNewAlert);
      socket.off('alert:marked-read', handleReadAlert);
      socket.off('alert:all-read', handleAllRead);
    };
  }, [socket]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path || (pathname?.startsWith(path + '/') ?? false)
  )?.[1] || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        unreadAlerts={unreadAlerts}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setMobileMenuOpen(true)}
          title={title}
          unreadAlerts={unreadAlerts}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
