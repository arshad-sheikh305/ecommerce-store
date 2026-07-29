import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Order } from '@/types/database';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { Spinner, EmptyState, Button, Badge } from '@/components/ui';

const statusColors: Record<string, 'gray' | 'green' | 'blue' | 'amber' | 'red'> = {
  pending: 'amber',
  paid: 'blue',
  shipped: 'blue',
  delivered: 'green',
  cancelled: 'red',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders((data as Order[]) ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <Spinner className="py-20" size="lg" />;

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Package className="w-20 h-20" />}
          title="No orders yet"
          description="When you place your first order, it will appear here."
          action={
            <Link to="/shop">
              <Button size="lg">Start Shopping</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id;
          return (
            <div
              key={order.id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-stone-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-stone-500">{formatDateTime(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <Badge color={statusColors[order.status]}>{order.status}</Badge>
                  <span className="font-bold text-stone-900 hidden sm:block">
                    {formatCurrency(order.total)}
                  </span>
                  <ChevronRight
                    className={`w-5 h-5 text-stone-400 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-stone-200 p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 mb-2">Items</h3>
                    <div className="space-y-2">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-stone-700">
                            {item.product_name} <span className="text-stone-400">x{item.quantity}</span>
                          </span>
                          <span className="font-medium text-stone-900">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-3">
                    <h3 className="text-sm font-semibold text-stone-900 mb-2">Shipping Address</h3>
                    <p className="text-sm text-stone-600">
                      {order.shipping_name}<br />
                      {order.shipping_address}<br />
                      {order.shipping_city}, {order.shipping_state} {order.shipping_zip}<br />
                      {order.shipping_country}
                    </p>
                  </div>

                  <div className="border-t border-stone-200 pt-3 flex justify-between text-base">
                    <span className="font-semibold text-stone-900">Total</span>
                    <span className="font-bold text-stone-900">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
