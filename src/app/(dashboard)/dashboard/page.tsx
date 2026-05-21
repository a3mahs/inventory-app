'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { MovementLineChart, TopProductsBarChart, CategoryPieChart } from '@/components/dashboard/Charts';
import { AlertTriangle, ArrowRight, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { StockBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((d) => { setStats(d.data); setIsLoadingStats(false); })
      .catch(() => setIsLoadingStats(false));

    fetch('/api/dashboard/charts')
      .then((r) => r.json())
      .then((d) => { setCharts(d.data); setIsLoadingCharts(false); })
      .catch(() => setIsLoadingCharts(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <StatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <MovementLineChart data={charts?.movementChart} isLoading={isLoadingCharts} />
        </div>
        <CategoryPieChart data={charts?.categoryDistribution} isLoading={isLoadingCharts} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsBarChart data={charts?.topProducts} isLoading={isLoadingCharts} />

        {/* Low stock alert list */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Low Stock Items
            </h3>
            <Link href="/alerts" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats?.topLowStock?.length > 0 ? (
            <div className="space-y-2">
              {stats.topLowStock.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StockBadge stock={product.stock} minStock={product.minStock} />
                    <p className="text-xs text-slate-500 mt-1">{product.stock} / {product.minStock} min</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-2">
                <AlertTriangle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">All products have sufficient stock</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
