import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { productsApi, categoriesApi } from '../services/api';
import { ProductCard } from '../components/product-card';
import { InlineAdCard } from '../components/inline-ad-card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Filter, X, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { SideRailAd } from '../components/google-ads';

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedOrientations, setSelectedOrientations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response: any = await categoriesApi.getAll({ status: 'active' });
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: currentPage,
          limit: 12,
        };

        // Search
        const searchQuery = searchParams.get('search');
        if (searchQuery) params.search = searchQuery;

        // Category
        const categoryParam = searchParams.get('category');
        const activeCategories = categoryParam ? [categoryParam] : selectedCategories;
        if (activeCategories.length > 0) {
          params.category = activeCategories[0]; // Backend supports single category for now
        }

        // Type
        if (selectedTypes.length > 0) {
          params.type = selectedTypes[0];
        }

        // Orientation
        if (selectedOrientations.length > 0) {
          params.orientation = selectedOrientations[0];
        }

        // Sort
        const sortMapping: Record<string, { sort: string; order: string }> = {
          newest: { sort: 'uploadDate', order: 'desc' },
          oldest: { sort: 'uploadDate', order: 'asc' },
          popular: { sort: 'popularity', order: 'desc' },
          'price-low': { sort: 'priceHD', order: 'asc' },
          'price-high': { sort: 'price4K', order: 'desc' },
        };

        const sortConfig = sortMapping[sortBy] || sortMapping.newest;
        params.sort = sortConfig.sort;
        params.order = sortConfig.order;

        const response: any = await productsApi.getAll(params);
        
        if (response.success && response.data) {
          setProducts(response.data.products);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchParams, selectedCategories, selectedTypes, selectedOrientations, sortBy, currentPage]);

  // Filter products by price (client-side for now)
  const filteredProducts = products.filter((product) => {
    const minPrice = Math.min(product.prices.HD, product.prices['Full HD'], product.prices['4K']);
    const maxPrice = Math.max(product.prices.HD, product.prices['Full HD'], product.prices['4K']);
    return minPrice >= priceRange[0] && maxPrice <= priceRange[1];
  });

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
    setCurrentPage(1);
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const handleOrientationToggle = (orientation: string) => {
    setSelectedOrientations((prev) =>
      prev.includes(orientation) ? prev.filter((o) => o !== orientation) : [...prev, orientation]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedOrientations([]);
    setPriceRange([0, 5000]);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedTypes.length > 0 ||
    selectedOrientations.length > 0 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 5000;

  const renderFilters = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => handleCategoryToggle(category.slug)}
              />
              <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                {category.name} ({category.productCount})
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Product Type */}
      <div>
        <h3 className="font-semibold mb-3">Type</h3>
        <div className="space-y-2">
          {['photo', 'bundle', 'typography', 'poster', 'banner'].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => handleTypeToggle(type)}
              />
              <Label htmlFor={`type-${type}`} className="cursor-pointer capitalize">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Orientation */}
      <div>
        <h3 className="font-semibold mb-3">Orientation</h3>
        <div className="space-y-2">
          {['portrait', 'landscape', 'square'].map((orientation) => (
            <div key={orientation} className="flex items-center space-x-2">
              <Checkbox
                id={`orientation-${orientation}`}
                checked={selectedOrientations.includes(orientation)}
                onCheckedChange={() => handleOrientationToggle(orientation)}
              />
              <Label htmlFor={`orientation-${orientation}`} className="cursor-pointer capitalize">
                {orientation}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">
          Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
        </h3>
        <Slider
          min={0}
          max={5000}
          step={100}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          className="mt-2"
        />
      </div>
    </div>
  );

  // Insert ads into product grid every 6 products
  const renderProductGrid = () => {
    const items: JSX.Element[] = [];
    
    filteredProducts.forEach((product, index) => {
      // Add inline ad after every 6th product
      if (index > 0 && index % 6 === 0) {
        items.push(
          <InlineAdCard key={`ad-${index}`} position={index} />
        );
      }

      items.push(
        <ProductCard key={product.id} product={product} layout="square" />
      );
    });

    return items;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Products</h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Loading...' : `${filteredProducts.length} products found`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">{renderFilters()}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Filters</h2>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                {renderFilters()}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {renderProductGrid()}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">No products found</p>
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear all filters
                </Button>
              </div>
            )}
          </main>

          {/* Google Side Rail Ad */}
          <aside className="hidden xl:block w-40 flex-shrink-0">
            <SideRailAd />
          </aside>
        </div>
      </div>
    </div>
  );
}
