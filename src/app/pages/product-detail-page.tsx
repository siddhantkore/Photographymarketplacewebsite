import { useParams, Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { products, Resolution } from '../lib/mock-data';
import { useCart } from '../contexts/cart-context';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductCard } from '../components/product-card';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Heart,
  Share2,
  Download,
  Package,
  Calendar,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';

export function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedResolution, setSelectedResolution] = useState<Resolution>('HD');

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/explore">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.categories.some((c) => product.categories.includes(c)))
    .slice(0, 3);

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to continue');
      navigate('/login');
      return true;
    }
    return false;
  };

  const handleAddToCart = async () => {
    if (requireAuth()) return false;

    try {
      await addToCart({
        productId: product.id,
        title: product.title,
        previewImage: product.previewImage,
        resolution: selectedResolution,
        price: product.prices[selectedResolution],
      });
      toast.success('Added to cart successfully!');
      return true;
    } catch {
      toast.error('Failed to add to cart');
      return false;
    }
  };

  const handleBuyNow = async () => {
    if (requireAuth()) return;

    const added = await handleAddToCart();
    if (added) {
      window.location.href = '/cart';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-600">
            <li>
              <Link to="/" className="hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/explore" className="hover:text-blue-600">
                Explore
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={product.previewImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white/20 text-6xl font-bold transform rotate-[-30deg] select-none">
                  PHOTOMARKET
                </div>
              </div>
              {/* Type Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="capitalize">
                  {product.type === 'bundle' && <Package className="w-3 h-3 mr-1" />}
                  {product.type}
                </Badge>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Digital Download</h4>
                  <p className="text-sm text-blue-700">
                    Instant access after purchase. Download in your selected resolution.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.categories.map((category) => (
                <Link key={category} to={`/explore?category=${category.toLowerCase()}`}>
                  <Badge variant="secondary">{category}</Badge>
                </Link>
              ))}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(product.uploadDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {product.popularity} views
              </div>
              {product.filesCount && (
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {product.filesCount} files
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

            {/* Tags */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Resolution Selection */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Select Resolution</h3>
              <RadioGroup value={selectedResolution} onValueChange={(v) => setSelectedResolution(v as Resolution)}>
                <div className="space-y-3">
                  {(Object.keys(product.prices) as Resolution[]).map((resolution) => (
                    <div
                      key={resolution}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                        selectedResolution === resolution
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedResolution(resolution)}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={resolution} id={resolution} />
                        <Label htmlFor={resolution} className="cursor-pointer">
                          <div className="font-medium text-gray-900">{resolution}</div>
                          <div className="text-sm text-gray-500">
                            {resolution === 'HD' && '1280 x 720'}
                            {resolution === 'Full HD' && '1920 x 1080'}
                            {resolution === '4K' && '3840 x 2160'}
                          </div>
                        </Label>
                      </div>
                      <div className="font-bold text-gray-900">₹{product.prices[resolution]}</div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* What's Included */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">What's Included</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  High-quality digital file
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Commercial use license
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Instant download
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Lifetime access
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-4">
              <Button onClick={handleBuyNow} size="lg" className="flex-1">
                Buy Now - ₹{product.prices[selectedResolution]}
              </Button>
              <Button onClick={handleAddToCart} variant="outline" size="lg" className="flex-1 gap-2">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Heart className="w-4 h-4" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
