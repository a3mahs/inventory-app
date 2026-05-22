'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Edit2, Plus, Minus, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { StockBadge, Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [movementModal, setMovementModal] = useState(false);
  const [movementForm, setMovementForm] = useState({ type: 'IN', quantity: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => { setProduct(d.data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [id]);

  async function handleMovement(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch('/api/movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id, ...movementForm, quantity: parseInt(movementForm.quantity) }),
    });
    setIsSubmitting(false);
    if (res.ok) {
      setMovementModal(false);
      setMovementForm({ type: 'IN', quantity: '', reason: '' });
      const updated = await fetch(`/api/products/${id}`).then((r) => r.json());
      setProduct(updated.data);
    }
  }

  if (isLoading) return <Loading text="Loading product..." className="py-32" />;
  if (!product) return <div className="text-center py-32 text-slate-500">Product not found</div>;

  const movementTypeColors: Record<string, string> = {
    IN: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    OUT: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    ADJUSTMENT: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    RETURN: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link href="/products" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Products
        </Link>
        <button onClick={() => setMovementModal(true)} className="btn-primary">
          <ArrowUpDown className="w-4 h-4" />Stock Movement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{product.name}</h1>
                  <code className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{product.sku}</code>
                  <div className="flex items-center gap-2 mt-2">
                    <StockBadge stock={product.stock} minStock={product.minStock} />
                    {product.category && <Badge variant="info">{product.category.name}</Badge>}
                    {!product.isActive && <Badge variant="outline">Inactive</Badge>}
                  </div>
                </div>
              </div>
            </div>
            {product.description && (
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{product.description}</p>
            )}
          </div>

          {/* Details Grid */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Product Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Sale Price', value: formatCurrency(product.price) },
                { label: 'Cost Price', value: formatCurrency(product.cost) },
                { label: 'Margin', value: `${(((Number(product.price) - Number(product.cost)) / Number(product.price)) * 100).toFixed(1)}%` },
                { label: 'Current Stock', value: `${product.stock} ${product.unit}` },
                { label: 'Min. Stock', value: `${product.minStock} ${product.unit}` },
                { label: 'Total Value', value: formatCurrency(product.stock * Number(product.cost)) },
                { label: 'Supplier', value: product.supplier?.name || '—' },
                { label: 'Location', value: product.location || '—' },
                { label: 'Barcode', value: product.barcode || '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Movements */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Recent Movements</h3>
          {product.movements?.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No movements yet</p>
          ) : (
            <div className="space-y-2">
              {product.movements?.map((m: any) => (
                <div key={m.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${movementTypeColors[m.type] || ''}`}>
                    {m.type === 'IN' || m.type === 'RETURN' ? '+' : m.type === 'ADJUSTMENT' ? '=' : '-'}{m.quantity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.user?.name}</p>
                    {m.reason && <p className="text-xs text-slate-400 truncate">{m.reason}</p>}
                    <p className="text-xs text-slate-400">{formatDateTime(m.createdAt)}</p>
                  </div>
                  <span className="text-xs text-slate-400">{m.prevStock}→{m.newStock}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Movement Modal */}
      <Modal isOpen={movementModal} onClose={() => setMovementModal(false)} title="Record Stock Movement" size="sm">
        <form onSubmit={handleMovement} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Movement Type</label>
            <select value={movementForm.type} onChange={(e) => setMovementForm((p) => ({ ...p, type: e.target.value }))}
              className="input-base">
              <option value="IN">Stock In (+)</option>
              <option value="OUT">Stock Out (-)</option>
              <option value="ADJUSTMENT">Adjustment (=)</option>
              <option value="RETURN">Return (+)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {movementForm.type === 'ADJUSTMENT' ? 'New Stock Level' : 'Quantity'}
            </label>
            <input type="number" min="1" required value={movementForm.quantity}
              onChange={(e) => setMovementForm((p) => ({ ...p, quantity: e.target.value }))}
              className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason (optional)</label>
            <input value={movementForm.reason} onChange={(e) => setMovementForm((p) => ({ ...p, reason: e.target.value }))}
              placeholder="e.g. Sale, Purchase, Damaged..." className="input-base" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setMovementModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Recording...' : 'Record Movement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
