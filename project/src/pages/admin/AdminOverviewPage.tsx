import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types/database';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { Spinner, Badge } from '@/components/ui';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

const statusColors: Record<string, 'gray' | 'green' | 'blue' | 'amber' | 'red'> = {
  pending: 'amber',
  paid: 'blue',
  shipped: 'blue',
  delivered: 'green',
  cancelled: 'red',
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [prodRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      const allOrders = (ordersRes.data as Order[]) ?? [];
      const revenue = allOrders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + Number(o.total), 0);

      setStats({
        totalProducts: prodRes.count ?? 0,
        totalOrders: allOrders.length,
        totalRevenue: revenue,
        pendingOrders: allOrders.filter((o) => o.status === 'pending' || o.status === 'paid').length,
      });
      setRecentOrders(allOrders.slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <Spinner className="py-20" size="lg" />;

  const cards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'bg-stone-100 text-stone-700',
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-1">Dashboard</h1>
      <p className="text-sm text-stone-500 mb-8">Overview of your store performance</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-stone-200">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{card.value}</p>
            <p className="text-sm text-stone-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-stone-600" />
            <h2 className="text-lg font-semibold text-stone-900">Recent Orders</h2>
          </div>
          <Link
            to="/admin/orders"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-stone-500">No orders yet</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to="/admin/orders"
                className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-900">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-stone-500">{formatDateTime(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge color={statusColors[order.status]}>{order.status}</Badge>
                  <span className="text-sm font-bold text-stone-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
