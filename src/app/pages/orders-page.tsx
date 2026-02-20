import { Navigate, Link } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { Package, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export function OrdersPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mock orders for demonstration
  const orders = [
    {
      id: 'ORD-001',
      date: '2026-02-15',
      items: ['Majestic Lion Portrait', 'Mountain Landscape Collection'],
      total: 1798,
      status: 'completed' as const,
    },
    {
      id: 'ORD-002',
      date: '2026-02-10',
      items: ['Wedding Celebration Moments'],
      total: 699,
      status: 'completed' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge>{order.status}</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <p key={index} className="text-sm text-gray-700">
                      • {item}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="font-bold text-gray-900">Total: ₹{order.total}</div>
                  <Button size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
            <Link to="/explore">
              <Button>Browse Products</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
