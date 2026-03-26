import { Link } from 'react-router';
import type { Product } from '../lib/mock-data';
import { ShoppingCart, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { cn } from './ui/utils';

interface ProductCardProps {
  product: Product;
  layout?: 'default' | 'square';
}

export function ProductCard({ product, layout = 'default' }: ProductCardProps) {
  const discount = product.discountPercent?.HD || 0;
  const displayPrice = product.displayPrices?.HD;
  const isSquareLayout = layout === 'square';

  return (
    <Link to={`/product/${product.id}`} className="group block h-full">
      <div
        className={cn(
          'h-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow',
          isSquareLayout && 'aspect-square flex flex-col'
        )}
      >
        <div
          className={cn(
            'relative bg-gray-100 overflow-hidden',
            isSquareLayout ? 'flex-1 min-h-0 p-2' : 'aspect-[5/4]'
          )}
        >
          <ImageWithFallback
            src={product.previewImage}
            alt={product.title}
            className={cn(
              'w-full h-full group-hover:scale-105 transition-transform duration-300',
              isSquareLayout ? 'object-contain rounded-lg' : 'object-cover'
            )}
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

        <div className={cn('p-4 md:p-5', isSquareLayout && 'p-3 md:p-4')}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          {!isSquareLayout && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className={cn('flex flex-wrap gap-1 mb-4', isSquareLayout && 'mb-3')}>
            {product.categories.slice(0, isSquareLayout ? 1 : 2).map((category) => (
              <span key={category} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {category}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-gray-500">
                {isSquareLayout ? 'From' : 'Starting from'}
              </div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-gray-900">₹{product.prices.HD}</div>
                {discount > 0 && displayPrice ? (
                  <div className="text-xs text-gray-500 line-through">₹{displayPrice}</div>
                ) : null}
              </div>
            </div>
            <Button size="sm" variant="outline" className={cn('gap-2 shrink-0', isSquareLayout && 'px-3')}>
              <ShoppingCart className="w-4 h-4" />
              View
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
