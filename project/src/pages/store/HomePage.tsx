import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types/database';
import ProductCard from '@/components/store/ProductCard';
import { Spinner } from '@/components/ui';

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $75' },
  { icon: RotateCcw, title: '30-Day Returns', desc: 'No questions asked' },
  { icon: ShieldCheck, title: 'Secure Checkout', desc: 'Encrypted & protected' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8),
        supabase.from('categories').select('*').order('name'),
      ]);
      setProducts((prodRes.data as Product[]) ?? []);
      setCategories((catRes.data as Category[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-stone-900/5 text-stone-600 text-xs font-medium rounded-full mb-6">
                New Collection 2026
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-[1.1]">
                Designed for
                <br />
                <span className="italic font-light">everyday living.</span>
              </h1>
              <p className="mt-6 text-lg text-stone-600 max-w-md leading-relaxed">
                Discover thoughtfully crafted products that blend form and function.
                Quality you can feel, designed to last a lifetime.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors group"
                >
                  Shop Collection
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-900 font-medium rounded-full border border-stone-300 hover:border-stone-400 transition-colors"
                >
                  Browse Categories
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.pexels.com/photos/7772548/pexels-photo-7772548.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Headphones"
                    className="w-full h-64 object-cover rounded-2xl shadow-md"
                  />
                  <img
                    src="https://images.pexels.com/photos/6312194/pexels-photo-6312194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Ceramic mugs"
                    className="w-full h-48 object-cover rounded-2xl shadow-md"
                  />
                </div>
                <div className="space-y-4 pt-12">
                  <img
                    src="https://images.pexels.com/photos/18662969/pexels-photo-18662969.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Smartwatch"
                    className="w-full h-48 object-cover rounded-2xl shadow-md"
                  />
                  <img
                    src="https://images.pexels.com/photos/33342693/pexels-photo-33342693.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Leather backpack"
                    className="w-full h-64 object-cover rounded-2xl shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-y border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-stone-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{f.title}</p>
                  <p className="text-xs text-stone-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Shop by Category</h2>
              <p className="mt-1 text-stone-500">Find exactly what you're looking for</p>
            </div>
            <Link to="/categories" className="text-sm font-medium text-stone-700 hover:text-stone-900 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center justify-center p-6 bg-stone-50 rounded-2xl hover:bg-stone-100 transition-colors"
              >
                <span className="text-sm font-semibold text-stone-900 group-hover:text-stone-700">
                  {cat.name}
                </span>
                <span className="text-xs text-stone-400 mt-1 capitalize">{cat.slug}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">New Arrivals</h2>
            <p className="mt-1 text-stone-500">Fresh additions to our collection</p>
          </div>
          <Link to="/shop" className="text-sm font-medium text-stone-700 hover:text-stone-900 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Spinner className="py-20" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-stone-900 px-8 py-16 sm:px-16 sm:py-20 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-900" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Join the Mercado community
            </h2>
            <p className="mt-4 text-stone-300 max-w-lg mx-auto">
              Sign up to track orders, save your favorites, and get early access to new drops and exclusive offers.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-900 font-medium rounded-full hover:bg-stone-100 transition-colors"
            >
              Create an Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
