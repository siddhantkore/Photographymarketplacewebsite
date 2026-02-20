import { Link } from 'react-router';
import { products, categories } from '../lib/mock-data';
import { ProductCard } from '../components/product-card';
import { AdvertisementSidebar } from '../components/advertisement-sidebar';
import { Button } from '../components/ui/button';
import { ChevronRight, TrendingUp, Clock } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';

export function HomePage() {
  const featuredProducts = products.slice(0, 3);
  const latestProducts = products.slice(0, 4);
  const popularProducts = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Hero Slider */}
            <section>
              <Carousel className="w-full">
                <CarouselContent>
                  {featuredProducts.map((product) => (
                    <CarouselItem key={product.id}>
                      <Link to={`/product/${product.id}`}>
                        <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden bg-gray-900">
                          <ImageWithFallback
                            src={product.previewImage}
                            alt={product.title}
                            className="w-full h-full object-cover opacity-70"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          
                          {/* Watermark */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-white/10 text-6xl md:text-8xl font-bold transform rotate-[-30deg] select-none">
                              PHOTOMARKET
                            </div>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                            <div className="max-w-2xl">
                              <div className="text-sm font-semibold mb-2 text-blue-400">
                                FEATURED
                              </div>
                              <h2 className="text-2xl md:text-4xl font-bold mb-3">
                                {product.title}
                              </h2>
                              <p className="text-gray-200 mb-4 line-clamp-2">
                                {product.description}
                              </p>
                              <div className="flex items-center gap-4">
                                <div>
                                  <div className="text-sm opacity-80">Starting from</div>
                                  <div className="text-2xl font-bold">₹{product.prices.HD}</div>
                                </div>
                                <Button size="lg" className="gap-2">
                                  View Details
                                  <ChevronRight className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </section>

            {/* Categories */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
                <Link to="/explore">
                  <Button variant="ghost" className="gap-2">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category.id}
                    to={`/explore?category=${category.slug}`}
                    className="group"
                  >
                    <div className="relative h-32 rounded-lg overflow-hidden bg-gray-200">
                      <ImageWithFallback
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                        <p className="text-sm opacity-90">{category.productCount} items</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Latest Uploads */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Latest Uploads</h2>
                </div>
                <Link to="/explore?sort=newest">
                  <Button variant="ghost" className="gap-2">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {latestProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>

            {/* Popular Products */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Most Popular</h2>
                </div>
                <Link to="/explore?sort=popular">
                  <Button variant="ghost" className="gap-2">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {popularProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar - Advertisements */}
          <div className="lg:col-span-1">
            <AdvertisementSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
