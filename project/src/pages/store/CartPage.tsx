import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/format';
import { EmptyState, Button } from '@/components/ui';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 7.95;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingCart className="w-20 h-20" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our collection and find something you love."
          action={
            <Link to="/shop">
              <Button size="lg">
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-8">
        Shopping Cart <span className="text-lg font-normal text-stone-400">({totalItems} items)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex gap-4 p-4 bg-white border border-stone-200 rounded-2xl"
            >
              <Link to={`/product/${item.product.slug}`} className="shrink-0">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl bg-stone-50"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {item.product.categories && (
                      <span className="text-xs text-stone-400 uppercase tracking-wide">
                        {item.product.categories.name}
                      </span>
                    )}
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="block text-sm sm:text-base font-semibold text-stone-900 hover:text-stone-700 line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm font-medium text-stone-700 mt-1">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-stone-400 hover:text-red-600 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-stone-300 rounded-full">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-stone-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 mt-4"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-stone-50 rounded-2xl p-6 border border-stone-200">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-medium text-stone-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="font-medium text-stone-900">
                  {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Estimated Tax</span>
                <span className="font-medium text-stone-900">{formatCurrency(tax)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-stone-400 pt-1">
                  Add {formatCurrency(75 - subtotal)} more for free shipping
                </p>
              )}
              <div className="border-t border-stone-300 pt-3 flex justify-between text-base">
                <span className="font-semibold text-stone-900">Total</span>
                <span className="font-bold text-stone-900">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full mt-6"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
