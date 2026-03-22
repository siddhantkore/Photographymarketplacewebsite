import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { Package, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ordersApi } from '../services/api';
import { toast } from 'sonner';

type OrderItem = {
  productId: string;
  title: string;
  previewImage: string;
  resolution: string;
  price: number;
  accessStartTime?: string | null;
  accessExpiryTime?: string | null;
};

type Order = {
  id: string;
  date: string;
  total: number;
  status: string;
  items: OrderItem[];
};

export function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingKeys, setDownloadingKeys] = useState<Record<string, boolean>>({});
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response: any = await ordersApi.getAll({ limit: 100 });
        setOrders(response?.data?.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        toast.error('Unable to load your orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const makeItemKey = (orderId: string, item: OrderItem) =>
    `${orderId}:${item.productId}:${item.resolution}`;

  const isExpired = (expiry: string | null | undefined) =>
    Boolean(expiry && new Date(expiry).getTime() <= Date.now());

  const handleDownload = async (order: Order, item: OrderItem) => {
    const key = makeItemKey(order.id, item);

    try {
      setDownloadingKeys((prev) => ({ ...prev, [key]: true }));
      const response: any = await ordersApi.generateDownloadLink({
        orderId: order.id,
        productId: item.productId,
        resolution: item.resolution,
      });

      const urls: string[] =
        response?.data?.downloadUrls ||
        (response?.data?.downloadUrl ? [response.data.downloadUrl] : []);

      if (!urls.length) {
        throw new Error('No downloadable files found');
      }

      setGeneratedLinks((prev) => ({ ...prev, [key]: urls }));
      window.open(urls[0], '_blank', 'noopener,noreferrer');
      toast.success(urls.length > 1 ? `Bundle access ready (${urls.length} files)` : 'Download started');
    } catch (error: any) {
      console.error('Failed to generate download link:', error);
      toast.error(error?.message || 'Unable to generate secure download link');
    } finally {
      setDownloadingKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {isLoading && (
          <div className="bg-white p-6 rounded-lg shadow-sm text-sm text-gray-600">Loading orders...</div>
        )}

        {!isLoading && orders.length > 0 ? (
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
                  {order.items.map((item) => {
                    const key = makeItemKey(order.id, item);
                    const expired = isExpired(item.accessExpiryTime);
                    const canDownload = order.status === 'completed' && !expired;
                    const downloadLinks = generatedLinks[key] || [];

                    return (
                      <div key={key} className="rounded-md border border-gray-100 p-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-600">
                              {item.resolution} • ₹{item.price}
                            </p>
                            {item.accessExpiryTime && (
                              <p className={`text-xs mt-1 ${expired ? 'text-red-600' : 'text-gray-500'}`}>
                                Access expires: {new Date(item.accessExpiryTime).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="gap-2"
                            disabled={!canDownload || Boolean(downloadingKeys[key])}
                            onClick={() => handleDownload(order, item)}
                          >
                            <Download className="w-4 h-4" />
                            {downloadingKeys[key] ? 'Generating...' : 'Download'}
                          </Button>
                        </div>
                        {downloadLinks.length > 1 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {downloadLinks.map((url, index) => (
                              <a
                                key={`${key}:${index}`}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                File {index + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="font-bold text-gray-900">Total: ₹{order.total}</div>
                  <Badge>{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : !isLoading ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
            <Link to="/explore">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
