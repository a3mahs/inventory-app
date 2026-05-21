'use client';

import { useEffect, useState } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown, RefreshCw, RotateCcw } from 'lucide-react';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/utils';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  IN: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Stock In' },
  OUT: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Stock Out' },
  ADJUSTMENT: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Adjustment' },
  RETURN: { icon: RotateCcw, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Return' },
};

export default function MovementsPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const load = async (p = page) => {
    setIsLoading(true);
    const res = await fetch(`/api/movements?page=${p}&pageSize=20`);
    const data = await res.json();
    setMovements(data.data || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setIsLoading(false);
  };

  useEffect(() => { load(page); }, [page]);

  return (
    <div className="space-y-5 animate-fade-in">
      {isLoading ? <Loading text="Loading movements..." /> : movements.length === 0 ? (
        <div className="card">
          <EmptyState icon={<ArrowUpDown className="w-8 h-8 text-slate-400" />} title="No stock movements yet" />
        </div>
      ) : (
        <div className="table-container">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">{total} movements</p>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th>Type</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Stock Change</th>
                <th>User</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => {
                const config = TYPE_CONFIG[m.type] || TYPE_CONFIG.IN;
                const Icon = config.icon;
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{m.product.name}</p>
                        <code className="text-xs text-slate-400">{m.product.sku}</code>
                      </div>
                    </td>
                    <td>
                      <span className={`font-semibold ${config.color}`}>
                        {m.type === 'OUT' ? '-' : m.type === 'ADJUSTMENT' ? '=' : '+'}{m.quantity}
                      </span>
                    </td>
                    <td className="text-sm text-slate-500 dark:text-slate-400">{m.prevStock} → {m.newStock}</td>
                    <td className="text-sm">{m.user?.name || m.user?.email}</td>
                    <td className="text-sm text-slate-400 max-w-xs truncate">{m.reason || '—'}</td>
                    <td className="text-xs text-slate-400">{formatDateTime(m.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50">Previous</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
