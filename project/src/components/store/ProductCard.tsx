import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '@/types/database';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const outOfStock = product.stock <= 0;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-stone-300 transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? 'opacity-60' : ''}`}
        />
        {outOfStock && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-stone-900 text-white text-xs font-medium rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 10 && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
              Only {product.stock} left
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-sm font-medium text-stone-900 shadow-lg">
            <Eye className="w-4 h-4" />
            View
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4">
        {product.categories && (
          <span className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1">
            {product.categories.name}
          </span>
        )}
        <h3 className="text-sm font-semibold text-stone-900 line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-stone-500 line-clamp-2 mb-3 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-stone-900">
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all ${
              added
                ? 'bg-green-600 text-white'
                : outOfStock
                ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-900 hover:text-white'
            }`}
            title={added ? 'Added!' : 'Add to cart'}
          >
            {added ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
