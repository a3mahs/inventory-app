'use client';

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { LoadingSkeleton } from '@/components/ui/Loading';

interface MovementChartData { date: string; in: number; out: number; }
interface CategoryChartData { name: string; value: number; color: string; }
interface TopProductData { name: string; stock: number; value: number; }

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

export function MovementLineChart({ data, isLoading }: { data?: MovementChartData[]; isLoading?: boolean }) {
  if (isLoading) return <LoadingSkeleton className="h-64 w-full rounded-xl" />;
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Stock Movements (30 days)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
            tickFormatter={(v, i) => i % 7 === 0 ? v : ''} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--tw-bg-opacity, #1e293b)', border: 'none', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Line type="monotone" dataKey="in" stroke="#10B981" strokeWidth={2} dot={false} name="Stock In" />
          <Line type="monotone" dataKey="out" stroke="#EF4444" strokeWidth={2} dot={false} name="Stock Out" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopProductsBarChart({ data, isLoading }: { data?: TopProductData[]; isLoading?: boolean }) {
  if (isLoading) return <LoadingSkeleton className="h-64 w-full rounded-xl" />;
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Top Products by Stock</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Bar dataKey="stock" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Stock" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ data, isLoading }: { data?: CategoryChartData[]; isLoading?: boolean }) {
  if (isLoading) return <LoadingSkeleton className="h-64 w-full rounded-xl" />;
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Products by Category</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data || []} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
            {(data || []).map((entry, index) => (
              <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value, name) => [`${value} products`, name]}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
