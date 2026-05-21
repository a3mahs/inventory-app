'use client';

import { Package, AlertTriangle, DollarSign, Tag, Truck, Bell } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/ui/Loading';

interface StatsCardsProps {
  stats?: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalCategories: number;
    totalSuppliers: number;
    totalInventoryValue: number;
    unreadAlerts: number;
    recentMovements: number;
  };
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      change: 'Active items',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(stats?.totalInventoryValue ?? 0),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      change: 'At cost price',
    },
    {
      title: 'Low Stock',
      value: stats?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      change: `${stats?.outOfStockCount ?? 0} out of stock`,
    },
    {
      title: 'Categories',
      value: stats?.totalCategories ?? 0,
      icon: Tag,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      change: 'Product groups',
    },
    {
      title: 'Suppliers',
      value: stats?.totalSuppliers ?? 0,
      icon: Truck,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      change: 'Active vendors',
    },
    {
      title: 'Unread Alerts',
      value: stats?.unreadAlerts ?? 0,
      icon: Bell,
      color: stats?.unreadAlerts ? 'text-red-600' : 'text-slate-600',
      bg: stats?.unreadAlerts ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-slate-800/50',
      change: `${stats?.recentMovements ?? 0} movements (7d)`,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5">
            <LoadingSkeleton className="h-4 w-24 mb-3" />
            <LoadingSkeleton className="h-8 w-16 mb-2" />
            <LoadingSkeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="card p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{card.title}</p>
              <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.change}</p>
          </div>
        );
      })}
    </div>
  );
}
