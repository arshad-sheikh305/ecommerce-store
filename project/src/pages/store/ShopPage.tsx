import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types/database';
import ProductCard from '@/components/store/ProductCard';
import { Spinner, EmptyState, Button } from '@/components/ui';
import { Link } from 'react-router-dom';
import { PackageSearch } from 'lucide-react';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get('q') ?? '';
  const categorySlug = searchParams.get('category') ?? '';
  const sort = (searchParams.get('sort') as SortOption) ?? 'newest';

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*, categories(*)')
        .eq('is_active', true);

      if (categorySlug) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle();
        if (cat) {
          query = query.eq('category_id', cat.id);
        }
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      switch (sort) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name-asc':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const [prodRes, catRes] = await Promise.all([
        query,
        supabase.from('categories').select('*').order('name'),
      ]);

      setProducts((prodRes.data as Product[]) ?? []);
      setCategories((catRes.data as Category[]) ?? []);
      setLoading(false);
    }
    load();
  }, [searchQuery, categorySlug, sort]);

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug]
  );

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = searchQuery || categorySlug;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
          {activeCategory ? activeCategory.name : searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
        </h1>
        <p className="mt-1 text-stone-500">
          {loading ? 'Loading...' : `${products.length} ${products.length === 1 ? 'item' : 'items'}`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className={`lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="font-semibold text-stone-900">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-stone-900 mb-3">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => updateParam('category', '')}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      !categorySlug
                        ? 'bg-stone-900 text-white font-medium'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => updateParam('category', cat.slug)}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        categorySlug === cat.slug
                          ? 'bg-stone-900 text-white font-medium'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            )}
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 border border-stone-300 rounded-lg lg:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-stone-500">Sort:</label>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-500 bg-white"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Spinner className="py-20" />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="w-16 h-16" />}
              title="No products found"
              description="Try adjusting your filters or search terms."
              action={
                <Link to="/shop">
                  <Button variant="outline">Browse all products</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
