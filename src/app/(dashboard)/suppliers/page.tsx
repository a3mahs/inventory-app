'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Truck, Mail, Phone, Globe, Building } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', contact: '', website: '', notes: '', isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    const res = await fetch('/api/suppliers');
    const data = await res.json();
    setSuppliers(data.data || []);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  function openCreate() { setForm({ name: '', email: '', phone: '', address: '', contact: '', website: '', notes: '', isActive: true }); setEditing(null); setIsModalOpen(true); }
  function openEdit(s: any) { setForm({ name: s.name, email: s.email || '', phone: s.phone || '', address: s.address || '', contact: s.contact || '', website: s.website || '', notes: s.notes || '', isActive: s.isActive }); setEditing(s); setIsModalOpen(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const url = editing ? `/api/suppliers/${editing.id}` : '/api/suppliers';
    await fetch(url, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setIsSubmitting(false);
    setIsModalOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Deactivate this supplier?')) return;
    await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
    load();
  }

  const inputClass = "input-base";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-end">
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Add Supplier</button>
      </div>

      {isLoading ? <Loading text="Loading suppliers..." /> : suppliers.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Truck className="w-8 h-8 text-slate-400" />} title="No suppliers yet" action={<button onClick={openCreate} className="btn-primary">Add Supplier</button>} />
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Products</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                        <Building className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{s.name}</p>
                        {s.email && <p className="text-xs text-slate-400">{s.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td>{s.contact || <span className="text-slate-400">—</span>}</td>
                  <td>{s.phone || <span className="text-slate-400">—</span>}</td>
                  <td><Badge variant="info">{s._count?.products || 0} products</Badge></td>
                  <td><Badge variant={s.isActive ? 'success' : 'outline'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Name *</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contact Person</label>
              <input value={form.contact} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input type="url" value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} className={inputClass} placeholder="https://" />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Address</label>
              <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
