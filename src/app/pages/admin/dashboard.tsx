import { useEffect, useMemo, useState } from 'react';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Mail } from 'lucide-react';
import { adminApi } from '../../services/api';

type DashboardPayload = {
  cards: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    newInquiries: number;
  };
  recentOrders: Array<{
    id: string;
    userName: string;
    itemsCount: number;
    total: number;
    createdAt: string;
  }>;
  popularProducts: Array<{
    id: string;
    title: string;
    popularity: number;
    category: string;
  }>;
};

const defaultDashboard: DashboardPayload = {
  cards: {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    newInquiries: 0,
  },
  recentOrders: [],
  popularProducts: [],
};

export function AdminDashboard() {
  const [data, setData] = useState<DashboardPayload>(defaultDashboard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const response: any = await adminApi.getDashboard();
        if (response?.success && response?.data) {
          setData({
            ...defaultDashboard,
            ...response.data,
          });
        } else {
          setData(defaultDashboard);
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        setData(defaultDashboard);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const completionRate = useMemo(() => {
    const total = data.cards.totalOrders;
    if (!total) return 0;
    return Math.round((data.cards.completedOrders / total) * 100);
  }, [data.cards.completedOrders, data.cards.totalOrders]);

  const cards = [
    { label: 'Total Users', value: data.cards.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Products', value: data.cards.totalProducts, icon: Package, color: 'bg-green-500' },
    { label: 'Purchased Orders', value: data.cards.completedOrders, icon: ShoppingCart, color: 'bg-indigo-500' },
    { label: 'Revenue', value: `₹${data.cards.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-amber-500' },
    { label: 'New Inquiries', value: data.cards.newInquiries, icon: Mail, color: 'bg-rose-500' },
    { label: 'Order Completion', value: `${completionRate}%`, icon: TrendingUp, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Live operational summary</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2.5 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stat.value}
              </p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Purchases</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : data.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">
                      {order.userName} • {order.itemsCount} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No completed purchases yet.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Popular Products</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : data.popularProducts.length > 0 ? (
            <div className="space-y-3">
              {data.popularProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{product.title}</p>
                    <p className="text-xs text-gray-500">{product.category || 'Uncategorized'}</p>
                  </div>
                  <div className="text-sm text-gray-700 font-medium">{product.popularity} views</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No product activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
