import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { productsApi } from '../../services/api';
import { toast } from 'sonner';

interface AdminProductRow {
  id: string;
  title: string;
  type: string;
  prices: {
    HD: number;
    'Full HD': number;
    '4K': number;
  };
  displayPrices?: {
    HD?: number | null;
    'Full HD'?: number | null;
    '4K'?: number | null;
  };
  status: string;
  uploadDate: string;
  previewImage?: string;
  featured?: boolean;
}

export function AdminProducts() {
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingFeaturedId, setUpdatingFeaturedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response: any = await productsApi.getAll({
        page: 1,
        limit: 200,
        status: statusFilter === 'all' ? undefined : statusFilter,
        featured: featuredFilter === 'all' ? undefined : featuredFilter === 'featured',
      } as any);

      if (response?.success) {
        setProducts(response.data.products || []);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [statusFilter, featuredFilter]);

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      product.title.toLowerCase().includes(normalized) ||
      product.type.toLowerCase().includes(normalized)
    );
  }, [products, search]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;

    setDeletingId(id);
    try {
      const response: any = await productsApi.delete(id);
      if (response?.success) {
        toast.success('Product deleted');
        await loadProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFeatured = async (product: AdminProductRow) => {
    setUpdatingFeaturedId(product.id);
    try {
      const response: any = await productsApi.update(product.id, {
        featured: !product.featured,
      });
      if (response?.success) {
        toast.success(product.featured ? 'Removed from featured' : 'Marked as featured');
        await loadProducts();
      } else {
        toast.error('Failed to update featured status');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update featured status');
    } finally {
      setUpdatingFeaturedId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage product catalog and featured visibility</p>
        </div>
        <Link to="/admin/products/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or type"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Featured filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            <SelectItem value="featured">Featured only</SelectItem>
            <SelectItem value="regular">Non-featured only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
        <table className="w-full min-w-[1080px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HD Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={8}>
                  Loading products...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={8}>
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {product.previewImage ? (
                        <img
                          src={product.previewImage}
                          alt={product.title}
                          className="w-12 h-12 rounded object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 border" />
                      )}
                      <div className="font-medium text-gray-900">{product.title}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline" className="capitalize">
                      {product.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-gray-900">₹{product.prices?.HD ?? 0}</td>
                  <td className="px-4 py-4 text-gray-700">
                    {product.displayPrices?.HD ? `₹${product.displayPrices.HD}` : '-'}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {product.uploadDate ? new Date(product.uploadDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Button
                      variant={product.featured ? 'default' : 'outline'}
                      size="sm"
                      className="gap-1"
                      onClick={() => handleToggleFeatured(product)}
                      disabled={updatingFeaturedId === product.id}
                    >
                      <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} />
                      {product.featured ? 'Featured' : 'Mark'}
                    </Button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Link to={`/admin/products/edit/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
