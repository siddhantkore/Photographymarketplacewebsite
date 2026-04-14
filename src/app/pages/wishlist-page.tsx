import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { wishlistApi, productsApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Heart } from 'lucide-react';
import { ProductCard } from '../components/product-card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  product: any;
}

export function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const [wishlistResponse, productsResponse]: any = await Promise.all([
        wishlistApi.get(),
        productsApi.getAll({ page: 1, limit: 6, sort: 'uploadDate', order: 'desc' }),
      ]);

      setItems(wishlistResponse?.success ? wishlistResponse.data?.items || [] : []);
      setSuggestedProducts(
        productsResponse?.success && productsResponse?.data?.products
          ? productsResponse.data.products
          : []
      );
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load wishlist');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadWishlist();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleRemove = async (productId: string) => {
    try {
      setRemovingId(productId);
      const response: any = await wishlistApi.remove(productId);
      if (response?.success) {
        toast.success('Removed from wishlist');
        await loadWishlist();
      } else {
        toast.error(response?.message || 'Failed to remove item');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const suggested = suggestedProducts.filter(
    (product) => !items.some((item) => item.product?.id === product.id)
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wishlist</h1>
          <p className="text-gray-600 mt-1">Save products you want to review or buy later.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-600">Loading wishlist...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg p-10 text-center border border-gray-100">
            <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Your wishlist is empty</h2>
            <p className="text-gray-600 mt-2">
              Save products from the product page and they will appear here for quick access.
            </p>
            <Link to="/explore">
              <Button className="mt-5">Explore Products</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="w-full sm:w-32 h-24 rounded-lg overflow-hidden bg-gray-100"
                  >
                    <ImageWithFallback
                      src={item.product.previewImage}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {item.product.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.product.description}</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      Starting from ₹{item.product.prices?.HD ?? 0}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleRemove(item.product.id)}
                    disabled={removingId === item.product.id}
                  >
                    {removingId === item.product.id ? 'Removing...' : 'Remove'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {suggested.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Suggested for you</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {suggested.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
