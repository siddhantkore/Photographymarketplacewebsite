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
import { advertisementsApi } from '../../services/api';

interface Advertisement {
  id: string;
  image: string;
  url: string;
  status: 'active' | 'inactive';
  position: string;
  priority: number;
  gridIndex: number | null;
}

const initialForm = {
  image: '',
  url: '',
  status: 'active' as 'active' | 'inactive',
  position: 'home-sidebar',
  priority: 0,
  gridIndex: '',
};

export function AdminAds() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadAds = async () => {
    setLoading(true);
    try {
      const response: any = await advertisementsApi.getAll({
        status: 'all',
      });
      if (response?.success && Array.isArray(response.data)) {
        setAds(response.data);
      } else {
        setAds([]);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load advertisements');
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      if (positionFilter !== 'all' && ad.position !== positionFilter) return false;
      if (statusFilter !== 'all' && ad.status !== statusFilter) return false;
      return true;
    });
  }, [ads, positionFilter, statusFilter]);

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditingAd(null);
    setForm(initialForm);
  };

  const handleCreate = () => {
    setEditingAd(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setForm({
      image: ad.image,
      url: ad.url,
      status: ad.status,
      position: ad.position,
      priority: ad.priority,
      gridIndex: ad.gridIndex === null ? '' : String(ad.gridIndex),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this advertisement?')) return;
    try {
      const response: any = await advertisementsApi.delete(id);
      if (response?.success) {
        toast.success('Advertisement deleted');
        await loadAds();
      } else {
        toast.error(response?.message || 'Failed to delete advertisement');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete advertisement');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      image: form.image.trim(),
      url: form.url.trim(),
      status: form.status,
      position: form.position,
      priority: Number(form.priority) || 0,
      gridIndex: form.gridIndex === '' ? null : Number(form.gridIndex),
    };

    try {
      if (editingAd) {
        const response: any = await advertisementsApi.update(editingAd.id, payload);
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to update advertisement');
        }
        toast.success('Advertisement updated');
      } else {
        const response: any = await advertisementsApi.create(payload);
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to create advertisement');
        }
        toast.success('Advertisement created');
      }

      await loadAds();
      resetDialog();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save advertisement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advertisements</h1>
          <p className="text-gray-600 mt-1">Manage ad placements rendered in the storefront</p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Add Advertisement
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-3">
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by placement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All placements</SelectItem>
            <SelectItem value="home-sidebar">Home sidebar</SelectItem>
            <SelectItem value="product-grid">Product grid</SelectItem>
            <SelectItem value="explore">Explore</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="side-rail">Side rail</SelectItem>
            <SelectItem value="anchor">Anchor</SelectItem>
            <SelectItem value="vignette">Vignette</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
        <table className="w-full min-w-[920px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placement</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grid Index</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target URL</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={7}>
                  Loading advertisements...
                </td>
              </tr>
            ) : filteredAds.length > 0 ? (
              filteredAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <img
                      src={ad.image}
                      alt="Advertisement"
                      className="w-20 h-12 object-cover rounded border border-gray-200"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline">{ad.position}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                      {ad.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{ad.priority}</td>
                  <td className="px-4 py-4 text-gray-700">{ad.gridIndex ?? '-'}</td>
                  <td className="px-4 py-4 text-gray-600 max-w-xs truncate">{ad.url}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(ad)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={7}>
                  No advertisements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : resetDialog())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAd ? 'Edit Advertisement' : 'Add Advertisement'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="ad-image">Image URL</Label>
              <Input
                id="ad-image"
                value={form.image}
                onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="ad-url">Target URL</Label>
              <Input
                id="ad-url"
                value={form.url}
                onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Placement</Label>
                <Select
                  value={form.position}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, position: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home-sidebar">Home sidebar</SelectItem>
                    <SelectItem value="product-grid">Product grid</SelectItem>
                    <SelectItem value="explore">Explore</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="side-rail">Side rail</SelectItem>
                    <SelectItem value="anchor">Anchor</SelectItem>
                    <SelectItem value="vignette">Vignette</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ad-priority">Priority</Label>
                <Input
                  id="ad-priority"
                  type="number"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, priority: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="ad-grid-index">Grid Index (product-grid only)</Label>
                <Input
                  id="ad-grid-index"
                  type="number"
                  value={form.gridIndex}
                  onChange={(e) => setForm((prev) => ({ ...prev, gridIndex: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={resetDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingAd ? 'Update Advertisement' : 'Create Advertisement'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
