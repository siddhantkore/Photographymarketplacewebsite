import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Eye } from 'lucide-react';
import { ordersApi } from '../../services/api';
import { toast } from 'sonner';

interface AdminOrder {
  id: string;
  total: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  items?: Array<{ id: string }>;
  itemsCount?: number;
}

const statusBadgeVariant = (status: AdminOrder['status']) => {
  if (status === 'completed') return 'default';
  if (status === 'failed') return 'destructive';
  return 'secondary';
};

export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('completed');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response: any = await ordersApi.getAllAdmin({
        page,
        limit: 20,
        status: statusFilter,
      });

      if (response?.success && response?.data) {
        setOrders(response.data.orders || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load orders');
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  const filteredOrders = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return orders;
    return orders.filter((order) => {
      const idMatch = order.id.toLowerCase().includes(normalized);
      const userName = order.user?.name?.toLowerCase() || '';
      const userEmail = order.user?.email?.toLowerCase() || '';
      return idMatch || userName.includes(normalized) || userEmail.includes(normalized);
    });
  }, [orders, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">
          Real purchase orders only. Pending is hidden by default.
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order id or user"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Order status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={7}>
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-4 text-gray-600">
                    <div>{order.user?.name || 'Unknown user'}</div>
                    <div className="text-xs text-gray-500">{order.user?.email || '-'}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-gray-900">
                    {order.itemsCount ?? order.items?.length ?? 0}
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-900">₹{order.total.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <Badge variant={statusBadgeVariant(order.status)}>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Button variant="ghost" size="sm" disabled>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={7}>
                  No orders found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
