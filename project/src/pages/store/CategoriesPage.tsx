import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category, Product } from '@/types/database';
import { Spinner } from '@/components/ui';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('id, category_id').eq('is_active', true),
      ]);
      const cats = (catRes.data as Category[]) ?? [];
      const prods = (prodRes.data as Pick<Product, 'id' | 'category_id'>[]) ?? [];
      const countMap: Record<string, number> = {};
      prods.forEach((p) => {
        if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] ?? 0) + 1;
      });
      setCategories(cats);
      setCounts(countMap);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Categories</h1>
        <p className="mt-1 text-stone-500">Browse our collection by category</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/shop?category=${cat.slug}`}
            className="group relative bg-stone-50 rounded-2xl p-8 hover:bg-stone-100 transition-colors border border-stone-200 hover:border-stone-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900 group-hover:text-stone-700">
                  {cat.name}
                </h2>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                  {cat.description}
                </p>
                <p className="mt-4 text-xs font-medium text-stone-400 uppercase tracking-wide">
                  {counts[cat.id] ?? 0} {counts[cat.id] === 1 ? 'product' : 'products'}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
