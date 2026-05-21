'use client';

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { generateSku } from '@/lib/utils';

interface Category { id: string; name: string; }
interface Supplier { id: string; name: string; }

interface ProductFormData {
  name: string; sku: string; description: string; price: string; cost: string;
  stock: string; minStock: string; unit: string; barcode: string; location: string;
  categoryId: string; supplierId: string; isActive: boolean;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function ProductForm({ initialData, onSubmit, onCancel, isEdit }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({
    name: '', sku: '', description: '', price: '', cost: '', stock: '0',
    minStock: '5', unit: 'unit', barcode: '', location: '', categoryId: '', supplierId: '', isActive: true,
    ...initialData,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/suppliers').then((r) => r.json()),
    ]).then(([cats, sups]) => {
      setCategories(cats.data || []);
      setSuppliers(sups.data || []);
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = "input-base";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Product Name *</label>
          <input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="Product name" />
        </div>

        <div>
          <label className={labelClass}>SKU *</label>
          <div className="flex gap-2">
            <input name="sku" value={form.sku} onChange={handleChange} required className={inputClass} placeholder="AUTO-0001" />
            {!isEdit && (
              <button type="button" onClick={() => setForm((p) => ({ ...p, sku: generateSku(form.name || 'PRD') }))}
                className="p-2 text-slate-500 hover:text-blue-600 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>Unit</label>
          <select name="unit" value={form.unit} onChange={handleChange} className={inputClass}>
            {['unit', 'kg', 'g', 'lb', 'liter', 'ml', 'meter', 'box', 'pack', 'dozen'].map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Price (USD) *</label>
          <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required className={inputClass} placeholder="0.00" />
        </div>

        <div>
          <label className={labelClass}>Cost (USD) *</label>
          <input name="cost" type="number" step="0.01" min="0" value={form.cost} onChange={handleChange} required className={inputClass} placeholder="0.00" />
        </div>

        <div>
          <label className={labelClass}>Initial Stock</label>
          <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Min. Stock (Alert)</label>
          <input name="minStock" type="number" min="0" value={form.minStock} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputClass}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Supplier</label>
          <select name="supplierId" value={form.supplierId} onChange={handleChange} className={inputClass}>
            <option value="">Select supplier</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Barcode</label>
          <input name="barcode" value={form.barcode} onChange={handleChange} className={inputClass} placeholder="Optional" />
        </div>

        <div>
          <label className={labelClass}>Location</label>
          <input name="location" value={form.location} onChange={handleChange} className={inputClass} placeholder="e.g. Warehouse A - Row 3" />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass} placeholder="Product description..." />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">Active product</label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
