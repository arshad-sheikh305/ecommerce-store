import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import { Button, Spinner } from '@/components/ui';
import type { Order } from '@/types/database';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shipping_name: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'United States',
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const shipping = subtotal >= 75 ? 0 : 7.95;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile?.full_name) {
      setForm((f) => ({ ...f, shipping_name: f.shipping_name || profile.full_name }));
    }
  }, [profile]);

  if (items.length === 0 && !successOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-stone-300 mb-4" />
        <h1 className="text-2xl font-bold text-stone-900">Your cart is empty</h1>
        <p className="mt-2 text-stone-500">Add some products before checking out.</p>
        <Link to="/shop" className="mt-6 inline-block">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProcessing(true);
    setError(null);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'paid',
          total: total,
          shipping_name: form.shipping_name,
          shipping_address: form.shipping_address,
          shipping_city: form.shipping_city,
          shipping_state: form.shipping_state,
          shipping_zip: form.shipping_zip,
          shipping_country: form.shipping_country,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const order = orderData as Order;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: Number(item.product.price),
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      setSuccessOrder(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (successOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-stone-900">Order Confirmed!</h1>
        <p className="mt-3 text-stone-600">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        <div className="mt-6 bg-stone-50 rounded-2xl p-6 text-left">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone-500">Order Number</span>
            <span className="font-mono font-medium text-stone-900">
              #{successOrder.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone-500">Total</span>
            <span className="font-medium text-stone-900">{formatCurrency(successOrder.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Shipping to</span>
            <span className="font-medium text-stone-900">{successOrder.shipping_city}, {successOrder.shipping_state}</span>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders">
            <Button variant="outline">View My Orders</Button>
          </Link>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to cart
      </Link>

      <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* Shipping form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Shipping Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.shipping_name}
                  onChange={(e) => setForm({ ...form, shipping_name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 transition-colors"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Street Address</label>
                <input
                  type="text"
                  required
                  value={form.shipping_address}
                  onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 transition-colors"
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">City</label>
                <input
                  type="text"
                  required
                  value={form.shipping_city}
                  onChange={(e) => setForm({ ...form, shipping_city: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 transition-colors"
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">State</label>
                <input
                  type="text"
                  required
                  value={form.shipping_state}
                  onChange={(e) => setForm({ ...form, shipping_state: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 transition-colors"
                  placeholder="CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">ZIP Code</label>
                <input
                  type="text"
                  required
                  value={form.shipping_zip}
                  onChange={(e) => setForm({ ...form, shipping_zip: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 transition-colors"
                  placeholder="94103"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Country</label>
                <input
                  type="text"
                  required
                  value={form.shipping_country}
                  onChange={(e) => setForm({ ...form, shipping_country: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Payment Method</h2>
            <div className="border border-stone-300 rounded-xl p-4 flex items-center gap-3 bg-stone-50">
              <CreditCard className="w-6 h-6 text-stone-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-900">Demo Checkout</p>
                <p className="text-xs text-stone-500">No real payment will be processed. Your order will be marked as paid automatically.</p>
              </div>
              <Lock className="w-5 h-5 text-stone-400" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
              {error}
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-stone-50 rounded-2xl p-6 border border-stone-200">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-900 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-medium text-stone-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm border-t border-stone-300 pt-4">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Tax (8%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-stone-900 border-t border-stone-300 pt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mt-6" disabled={processing}>
              {processing ? (
                <><Spinner size="sm" /> Placing Order...</>
              ) : (
                <><Lock className="w-4 h-4" /> Place Order</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
