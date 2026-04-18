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
          'h-full bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow',
          isSquareLayout && 'aspect-square flex flex-col'
        )}
      >
        <div
          className={cn(
            'relative bg-gray-100 overflow-hidden',
            isSquareLayout ? 'flex-1 min-h-0 p-2' : 'aspect-[4/3]'
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
            <Badge variant="secondary" className="h-6 px-2 text-[11px] capitalize">
              {product.type === 'bundle' && <Package className="w-3 h-3 mr-1" />}
              {product.type}
            </Badge>
            {product.featured && <Badge className="h-6 px-2 text-[11px]">Featured</Badge>}
          </div>
          {discount > 0 && (
            <div className="absolute top-2 right-2">
              <Badge className="h-6 px-2 text-[11px] bg-rose-600 text-white hover:bg-rose-600">-{discount}%</Badge>
            </div>
          )}
        </div>

        <div className={cn('p-3 md:p-4', isSquareLayout && 'p-3 md:p-4')}>
          <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          {!isSquareLayout && (
            <p className="text-xs md:text-sm text-gray-500 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className={cn('flex flex-wrap gap-1 mb-3', isSquareLayout && 'mb-2.5')}>
            {product.categories.slice(0, isSquareLayout ? 1 : 2).map((category) => (
              <span key={category} className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {category}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-gray-500">
                {isSquareLayout ? 'From' : 'Starting from'}
              </div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-gray-900 text-sm md:text-base">₹{product.prices.HD}</div>
                {discount > 0 && displayPrice ? (
                  <div className="text-[11px] text-gray-500 line-through">₹{displayPrice}</div>
                ) : null}
              </div>
            </div>
            <Button size="sm" variant="outline" className={cn('h-8 gap-1.5 px-3 text-xs shrink-0', isSquareLayout && 'px-3')}>
              <ShoppingCart className="w-4 h-4" />
              View
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
