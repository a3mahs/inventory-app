'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Eye, Package, ArrowUpDown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from '@/components/products/ProductForm';
import { Badge, StockBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { formatCurrency, formatDate, debounce } from '@/lib/utils';
import Link from 'next/link';
import { useSocket } from '@/components/providers/SocketProvider';

export default function ProductsPage() {
  const { socket } = useSocket();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const loadProducts = useCallback(async (s = search, st = statusFilter, p = page) => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(p), pageSize: '15' });
    if (s) params.set('search', s);
    if (st) params.set('status', st);

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.data || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setIsLoading(false);
  }, [search, statusFilter, page]);

  useEffect(() => { loadProducts(); }, [page]);

  useEffect(() => {
    setPage(1);
    loadProducts(search, statusFilter, 1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!socket) return;
    const handle = () => loadProducts();
    socket.on('product:created', handle);
    socket.on('product:updated', handle);
    socket.on('product:deleted', handle);
    socket.on('stock:adjusted', handle);
    return () => {
      socket.off('product:created', handle);
      socket.off('product:updated', handle);
      socket.off('product:deleted', handle);
      socket.off('stock:adjusted', handle);
    };
  }, [socket, loadProducts]);

  const debouncedSearch = useCallback(debounce((v: string) => setSearch(v), 300), []);

  async function handleCreate(formData: any) {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        categoryId: formData.categoryId || null,
        supplierId: formData.supplierId || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setIsModalOpen(false);
    loadProducts();
  }

  async function handleEdit(formData: any) {
    const res = await fetch(`/api/products/${editingProduct.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        minStock: parseInt(formData.minStock),
        categoryId: formData.categoryId || null,
        supplierId: formData.supplierId || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setEditingProduct(null);
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm('Deactivate this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    loadProducts();
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search products, SKU..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="input-base pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base w-full sm:w-40"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isLoading ? 'Loading...' : `${total} products`}
          </p>
        </div>

        {isLoading ? (
          <Loading text="Loading products..." className="py-16" />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8 text-slate-400" />}
            title="No products found"
            description="Add your first product or adjust your search filters"
            action={<button onClick={() => setIsModalOpen(true)} className="btn-primary">Add Product</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{product.name}</p>
                        {product.supplier && (
                          <p className="text-xs text-slate-400">{product.supplier.name}</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                        {product.sku}
                      </code>
                    </td>
                    <td>
                      {product.category ? (
                        <Badge>{product.category.name}</Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>
                      <span className={`font-semibold ${product.stock === 0 ? 'text-red-600' : product.stock <= product.minStock ? 'text-yellow-600' : 'text-slate-900 dark:text-slate-100'}`}>
                        {product.stock}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">/ {product.minStock} min</span>
                    </td>
                    <td>
                      <StockBadge stock={product.stock} minStock={product.minStock} />
                    </td>
                    <td className="text-slate-400 text-xs">{formatDate(product.updatedAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${product.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50">Previous</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product" size="lg">
        <ProductForm onSubmit={handleCreate} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {/* Edit modal */}
      {editingProduct && (
        <Modal isOpen onClose={() => setEditingProduct(null)} title="Edit Product" size="lg">
          <ProductForm
            isEdit
            initialData={{
              name: editingProduct.name, sku: editingProduct.sku, description: editingProduct.description || '',
              price: String(editingProduct.price), cost: String(editingProduct.cost),
              stock: String(editingProduct.stock), minStock: String(editingProduct.minStock),
              unit: editingProduct.unit, barcode: editingProduct.barcode || '',
              location: editingProduct.location || '', categoryId: editingProduct.categoryId || '',
              supplierId: editingProduct.supplierId || '', isActive: editingProduct.isActive,
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditingProduct(null)}
          />
        </Modal>
      )}
    </div>
  );
}
