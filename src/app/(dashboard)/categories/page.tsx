'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#3B82F6' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data.data || []);
    setIsLoading(false);
  };

  useEffect(() => { loadCategories(); }, []);

  function openCreate() { setForm({ name: '', description: '', color: '#3B82F6' }); setEditing(null); setIsModalOpen(true); }
  function openEdit(cat: any) { setForm({ name: cat.name, description: cat.description || '', color: cat.color || '#3B82F6' }); setEditing(cat); setIsModalOpen(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const url = editing ? `/api/categories/${editing.id}` : '/api/categories';
    const method = editing ? 'PATCH' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setIsSubmitting(false);
    setIsModalOpen(false);
    loadCategories();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    loadCategories();
  }

  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-end">
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Add Category</button>
      </div>

      {isLoading ? (
        <Loading text="Loading categories..." />
      ) : categories.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Tag className="w-8 h-8 text-slate-400" />} title="No categories yet" action={<button onClick={openCreate} className="btn-primary">Add Category</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                  <Tag className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{cat.name}</h3>
              {cat.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{cat.description}</p>}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{cat._count?.products || 0} products</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="input-base" placeholder="Category name" />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="input-base" />
          </div>
          <div>
            <label className={labelClass}>Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600" />
              <input value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} className="input-base" placeholder="#3B82F6" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
