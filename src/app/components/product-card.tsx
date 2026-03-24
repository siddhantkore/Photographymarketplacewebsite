import { Link } from 'react-router';
import type { Product } from '../lib/mock-data';
import { ShoppingCart, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.discountPercent?.HD || 0;
  const displayPrice = product.displayPrices?.HD;

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="h-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="relative aspect-[5/4] bg-gray-100 overflow-hidden">
          <ImageWithFallback
            src={product.previewImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {product.type === 'bundle' && <Package className="w-3 h-3 mr-1" />}
              {product.type}
            </Badge>
            {product.featured && <Badge>Featured</Badge>}
          </div>
          {discount > 0 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-rose-600 text-white hover:bg-rose-600">-{discount}%</Badge>
            </div>
          )}
        </div>

        <div className="p-4 md:p-5">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-4">
            {product.categories.slice(0, 2).map((category) => (
              <span key={category} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {category}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Starting from</div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-gray-900">₹{product.prices.HD}</div>
                {discount > 0 && displayPrice ? (
                  <div className="text-xs text-gray-500 line-through">₹{displayPrice}</div>
                ) : null}
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              View
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
