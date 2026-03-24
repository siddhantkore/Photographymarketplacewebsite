import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { categoriesApi } from '../../services/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  status: 'active' | 'inactive';
}

type SortOption = 'name-asc' | 'name-desc' | 'products-desc' | 'products-asc';

const initialForm = {
  name: '',
  slug: '',
  image: '',
  status: 'active' as 'active' | 'inactive',
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response: any = await categoriesApi.getAll();
      if (response?.success && Array.isArray(response?.data)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = categories.filter((category) => {
      if (statusFilter !== 'all' && category.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        category.name.toLowerCase().includes(normalizedSearch) ||
        category.slug.toLowerCase().includes(normalizedSearch)
      );
    });

    const sorted = [...filtered];
    if (sortBy === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'name-desc') sorted.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === 'products-desc') sorted.sort((a, b) => b.productCount - a.productCount);
    if (sortBy === 'products-asc') sorted.sort((a, b) => a.productCount - b.productCount);
    return sorted;
  }, [categories, search, statusFilter, sortBy]);

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setForm(initialForm);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      image: category.image || '',
      status: category.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const response: any = await categoriesApi.delete(id);
      if (response?.success) {
        toast.success('Category deleted');
        await loadCategories();
      } else {
        toast.error(response?.message || 'Failed to delete category');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete category');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      image: form.image.trim(),
      status: form.status,
    };

    try {
      if (editingCategory) {
        const response: any = await categoriesApi.update(editingCategory.id, payload);
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to update category');
        }
        toast.success('Category updated');
      } else {
        const response: any = await categoriesApi.create(payload);
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to create category');
        }
        toast.success('Category created');
      }
      await loadCategories();
      resetDialog();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Create and organize storefront categories</p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or slug"
          />
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="products-desc">Most products</SelectItem>
              <SelectItem value="products-asc">Least products</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
        <table className="w-full min-w-[720px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                  Loading categories...
                </td>
              </tr>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900">{category.name}</td>
                  <td className="px-4 py-4 text-gray-600">{category.slug}</td>
                  <td className="px-4 py-4 text-gray-900">{category.productCount}</td>
                  <td className="px-4 py-4">
                    <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                      {category.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : resetDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(e) => {
                  const nextName = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name: nextName,
                    slug: editingCategory ? prev.slug : slugify(nextName),
                  }));
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="category-image">Image URL</Label>
              <Input
                id="category-image"
                value={form.image}
                onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="Optional category image URL"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value: 'active' | 'inactive') =>
                  setForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={resetDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
