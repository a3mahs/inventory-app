'use client';

import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, XCircle, CheckCircle, CheckCheck, Trash2, Package } from 'lucide-react';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { useSocket } from '@/components/providers/SocketProvider';
import Link from 'next/link';

const ALERT_CONFIG: Record<string, { icon: any; color: string; bg: string; variant: any }> = {
  LOW_STOCK: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', variant: 'warning' },
  OUT_OF_STOCK: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', variant: 'danger' },
  OVERSTOCK: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', variant: 'info' },
  REORDER: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', variant: 'warning' },
  SYSTEM: { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800', variant: 'default' },
};

export default function AlertsPage() {
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const load = async (f = filter, p = page) => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(p), pageSize: '20' });
    if (f === 'unread') params.set('unread', 'true');
    const res = await fetch(`/api/alerts?${params}`);
    const data = await res.json();
    setAlerts(data.data || []);
    setTotal(data.total || 0);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [page]);
  useEffect(() => { setPage(1); load(filter, 1); }, [filter]);

  useEffect(() => {
    if (!socket) return;
    socket.on('alert:created', () => load());
    socket.on('alert:marked-read', () => load());
    socket.on('alert:all-read', () => load());
    return () => { socket.off('alert:created'); socket.off('alert:marked-read'); socket.off('alert:all-read'); };
  }, [socket]);

  async function markRead(id: string) {
    await fetch(`/api/alerts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isRead: true }) });
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  }

  async function markAllRead() {
    await fetch('/api/alerts/read-all', { method: 'POST' });
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  }

  async function deleteAlert(id: string) {
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            All ({total})
          </button>
          <button onClick={() => setFilter('unread')} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter === 'unread' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-xs">
            <CheckCheck className="w-4 h-4" />Mark All Read
          </button>
        )}
      </div>

      {isLoading ? <Loading text="Loading alerts..." /> : alerts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<CheckCircle className="w-8 h-8 text-green-500" />}
            title="No alerts"
            description="Your inventory is in great shape!"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const config = ALERT_CONFIG[alert.type] || ALERT_CONFIG.SYSTEM;
            const Icon = config.icon;
            return (
              <div key={alert.id} className={`card p-4 flex items-start gap-4 transition-all ${!alert.isRead ? 'border-l-4 border-l-blue-500' : 'opacity-75'}`}>
                <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{alert.title}</p>
                        <Badge variant={config.variant as any} size="sm">{alert.type.replace('_', ' ')}</Badge>
                        {!alert.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{alert.message}</p>
                      {alert.product && (
                        <Link href={`/products/${alert.product.id}`} className="text-xs text-blue-600 hover:underline mt-1 block">
                          View product →
                        </Link>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{formatDateTime(alert.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!alert.isRead && (
                        <button onClick={() => markRead(alert.id)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Mark as read">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => deleteAlert(alert.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
