import { Badge } from '../../components/ui/badge';
import { Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function AdminOrders() {
  const orders = [
    { id: 'ORD-001', user: 'John Doe', date: '2026-02-15', items: 2, total: 1798, status: 'completed' as const },
    { id: 'ORD-002', user: 'Jane Smith', date: '2026-02-14', items: 1, total: 699, status: 'completed' as const },
    { id: 'ORD-003', user: 'Bob Johnson', date: '2026-02-13', items: 3, total: 2497, status: 'pending' as const },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Orders</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 text-gray-600">{order.user}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-gray-900">{order.items}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">₹{order.total}</td>
                <td className="px-6 py-4">
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
