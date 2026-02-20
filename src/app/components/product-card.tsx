import { Link } from 'react-router';
import { Product } from '../lib/mock-data';
import { ShoppingCart, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
        {/* Image with Watermark */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          <ImageWithFallback
            src={product.previewImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Watermark Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white/20 text-4xl font-bold transform rotate-[-30deg] select-none">
              PHOTOMARKET
            </div>
          </div>
          
          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="capitalize">
              {product.type === 'bundle' && <Package className="w-3 h-3 mr-1" />}
              {product.type}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Categories */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
              >
                {category}
              </span>
            ))}
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Starting from</div>
              <div className="font-bold text-gray-900">₹{product.prices.HD}</div>
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
