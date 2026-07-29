import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category, ProductInput } from '@/types/database';
import { formatCurrency, slugify } from '@/lib/format';
import { Spinner, Button, Badge, EmptyState } from '@/components/ui';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts((prodRes.data as Product[]) ?? []);
    setCategories((catRes.data as Category[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Failed to delete product: ' + error.message);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Products</h1>
          <p className="text-sm text-stone-500 mt-0.5">Manage your product catalog</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 bg-white"
        />
      </div>

      {loading ? (
        <Spinner className="py-20" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="w-16 h-16" />}
          title={search ? "No products match your search" : "No products yet"}
          description={search ? "Try a different search term." : "Add your first product to get started."}
          action={
            !search && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wide px-4 py-3">Product</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wide px-4 py-3">Price</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Stock</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-stone-600 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                        />
                        <span className="text-sm font-medium text-stone-900 line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-stone-600">{product.categories?.name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-stone-900">{formatCurrency(product.price)}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-sm font-medium ${product.stock <= 0 ? 'text-red-600' : product.stock <= 10 ? 'text-amber-600' : 'text-stone-900'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={product.is_active ? 'green' : 'gray'}>
                        {product.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditing(product);
                            setShowForm(true);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-200 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
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
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            load();
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductInput>({
    category_id: product?.category_id ?? null,
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    image_url: product?.image_url ?? '',
    stock: product?.stock ?? 0,
    is_active: product?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      price: Number(form.price),
      stock: Number(form.stock),
    };

    let result;
    if (product) {
      result = await supabase.from('products').update(payload).eq('id', product.id);
    } else {
      result = await supabase.from('products').insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-stone-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-stone-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Product Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: product ? form.slug : slugify(e.target.value) })}
              className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
              placeholder="Product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Slug</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 font-mono"
              placeholder="product-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 resize-none"
              placeholder="Product description"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Stock</label>
              <input
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Image URL</label>
            <input
              type="url"
              required
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
              placeholder="https://..."
            />
            {form.image_url && (
              <img src={form.image_url} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-lg border border-stone-200" />
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
              <select
                value={form.category_id ?? ''}
                onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
                className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 bg-white"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Status</label>
              <select
                value={form.is_active ? 'active' : 'hidden'}
                onChange={(e) => setForm({ ...form, is_active: e.target.value === 'active' })}
                className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 bg-white"
              >
                <option value="active">Active (visible)</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-stone-200">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
