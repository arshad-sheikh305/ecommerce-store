import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Minus, Plus, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { Spinner, Button, EmptyState } from '@/components/ui';
import { PackageSearch } from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('slug', slug)
        .maybeSingle();
      setProduct(data as Product | null);
      setLoading(false);
    }
    load();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
    navigate('/cart');
  };

  if (loading) return <Spinner className="py-20" size="lg" />;

  if (!product) {
    return (
      <EmptyState
        icon={<PackageSearch className="w-16 h-16" />}
        title="Product not found"
        description="The product you're looking for doesn't exist or has been removed."
        action={
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        }
      />
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to shop
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-50 border border-stone-200">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {outOfStock && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 bg-stone-900 text-white text-sm font-medium rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.categories && (
            <Link
              to={`/shop?category=${product.categories.slug}`}
              className="text-sm font-medium text-stone-500 uppercase tracking-wide hover:text-stone-900 transition-colors mb-2"
            >
              {product.categories.name}
            </Link>
          )}
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-stone-900">{formatCurrency(product.price)}</p>

          <p className="mt-6 text-stone-600 leading-relaxed">{product.description}</p>

          {/* Stock indicator */}
          <div className="mt-6">
            {outOfStock ? (
              <p className="text-sm font-medium text-red-600">Currently unavailable</p>
            ) : product.stock <= 10 ? (
              <p className="text-sm font-medium text-amber-600">Only {product.stock} left in stock</p>
            ) : (
              <p className="text-sm font-medium text-green-600">In stock</p>
            )}
          </div>

          {/* Quantity + actions */}
          {!outOfStock && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-stone-700">Quantity</label>
                <div className="flex items-center border border-stone-300 rounded-full">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-stone-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  variant={added ? 'secondary' : 'outline'}
                  size="lg"
                  className="flex-1"
                >
                  {added ? (
                    <><Check className="w-5 h-5" /> Added to Cart</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                  )}
                </Button>
                <Button onClick={handleBuyNow} size="lg" className="flex-1">
                  Buy Now
                </Button>
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-8 pt-8 border-t border-stone-200 space-y-3">
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <Truck className="w-5 h-5 text-stone-400" />
              Free shipping on orders over $75
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <RotateCcw className="w-5 h-5 text-stone-400" />
              30-day hassle-free returns
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <ShieldCheck className="w-5 h-5 text-stone-400" />
              Secure encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
