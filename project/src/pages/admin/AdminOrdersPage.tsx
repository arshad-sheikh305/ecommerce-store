import { useEffect, useState, useCallback } from 'react';
import { ShoppingCart, Search, X, Package, MapPin, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types/database';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { Spinner, Badge, EmptyState, Button } from '@/components/ui';

const statusColors: Record<string, 'gray' | 'green' | 'blue' | 'amber' | 'red'> = {
  pending: 'amber',
  paid: 'blue',
  shipped: 'blue',
  delivered: 'green',
  cancelled: 'red',
};

const allStatuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) {
      alert('Failed to update order: ' + error.message);
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    setSelected((prev) => (prev?.id === orderId ? { ...prev, status } : prev));
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_name.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Orders</h1>
        <p className="text-sm text-stone-500 mt-0.5">Manage and track customer orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer name..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500 bg-white"
        >
          <option value="all">All Statuses</option>
          {allStatuses.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-16 h-16" />}
          title="No orders found"
          description={search || statusFilter !== 'all' ? "Try adjusting your filters." : "Orders will appear here once customers start buying."}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wide px-4 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Customer</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wide px-4 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-stone-600 uppercase tracking-wide px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-stone-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(order)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-medium text-stone-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-stone-700">{order.shipping_name}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-stone-500">{formatDateTime(order.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-stone-900">{formatCurrency(order.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={statusColors[order.status]}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(order);
                        }}
                        className="text-sm font-medium text-stone-600 hover:text-stone-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
        />
      )}
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-stone-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h2>
            <p className="text-sm text-stone-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateTime(order.created_at)}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status update */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 mb-2">Order Status</label>
            <div className="flex flex-wrap gap-2">
              {allStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(order.id, s)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all capitalize ${
                    order.status === s
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-stone-400" />
              Items ({order.order_items?.length ?? 0})
            </h3>
            <div className="space-y-2 bg-stone-50 rounded-xl p-4">
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
              <div className="border-t border-stone-200 pt-2 flex justify-between text-base">
                <span className="font-semibold text-stone-900">Total</span>
                <span className="font-bold text-stone-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone-400" />
              Shipping Address
            </h3>
            <div className="bg-stone-50 rounded-xl p-4 text-sm text-stone-700">
              <p className="font-medium text-stone-900">{order.shipping_name}</p>
              <p>{order.shipping_address}</p>
              <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
              <p>{order.shipping_country}</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-200">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
