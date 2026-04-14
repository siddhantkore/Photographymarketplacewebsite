import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/cart-context';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { productsApi } from '../services/api';
import { ProductCard } from '../components/product-card';

export function CartPage() {
  const { items, removeFromCart, getTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadSuggestions = async () => {
      try {
        const response: any = await productsApi.getAll({
          page: 1,
          limit: 8,
          sort: 'popularity',
          order: 'desc',
        });
        if (response?.success && response?.data?.products) {
          setSuggestedProducts(response.data.products);
        }
      } catch (error) {
        console.error('Failed to load cart suggestions', error);
      }
    };

    loadSuggestions();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to login to view your cart</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Add some amazing photos to get started!</p>
          <Link to="/explore">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.resolution}`}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex gap-4">
                  <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                    <div className="relative w-32 h-24 bg-gray-100 rounded overflow-hidden">
                      <ImageWithFallback
                        src={item.previewImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-white/20 text-lg font-bold transform rotate-[-30deg] select-none">
                          LPS
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.productId}`}>
                      <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{item.resolution}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-lg text-gray-900">₹{item.price}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.productId, item.resolution)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({items.length})</span>
                  <span>₹{getTotal()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">₹{getTotal()}</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout">
                <Button size="lg" className="w-full mb-3">
                  Proceed to Checkout
                </Button>
              </Link>
              
              <Link to="/explore">
                <Button variant="outline" size="lg" className="w-full">
                  Continue Shopping
                </Button>
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Secure Checkout</h3>
                <p className="text-sm text-gray-600">
                  Your payment information is processed securely. We do not store credit card details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {suggestedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Suggested for you</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {suggestedProducts
                .filter((product) => !items.some((item) => item.productId === product.id))
                .slice(0, 6)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
