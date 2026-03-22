import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { productsApi } from '../../services/api';

type ProductType = 'photo' | 'bundle' | 'typography' | 'poster' | 'banner';
type OrientationType = 'portrait' | 'landscape' | 'square';

interface ProductFormState {
  title: string;
  description: string;
  type: ProductType;
  orientation: OrientationType;
  categories: string;
  tags: string;
  priceHD: string;
  priceFullHD: string;
  price4K: string;
  status: 'active' | 'inactive';
  watermarkType: 'text' | 'image';
  watermarkText: string;
  watermarkOpacity: string;
  watermarkPosition:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top_left'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_right';
}

const initialFormState: ProductFormState = {
  title: '',
  description: '',
  type: 'photo',
  orientation: 'landscape',
  categories: '',
  tags: '',
  priceHD: '',
  priceFullHD: '',
  price4K: '',
  status: 'active',
  watermarkType: 'text',
  watermarkText: '',
  watermarkOpacity: '',
  watermarkPosition: 'center',
};

export function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [files, setFiles] = useState<File[]>([]);
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  const acceptTypes = useMemo(() => '.jpg,.jpeg,.png,.webp', []);

  useEffect(() => {
    if (!isEditMode || !id) return;

    const loadProduct = async () => {
      setLoading(true);
      try {
        const response: any = await productsApi.getById(id);
        if (response?.success && response?.data) {
          const product = response.data;
          setForm({
            title: product.title || '',
            description: product.description || '',
            type: (product.type || 'photo') as ProductType,
            orientation: (product.orientation || 'landscape') as OrientationType,
            categories: (product.categories || []).join(', '),
            tags: (product.tags || []).join(', '),
            priceHD: String(product.prices?.HD ?? ''),
            priceFullHD: String(product.prices?.['Full HD'] ?? ''),
            price4K: String(product.prices?.['4K'] ?? ''),
            status: (product.status || 'active') as 'active' | 'inactive',
            watermarkType: 'text',
            watermarkText: '',
            watermarkOpacity: '',
            watermarkPosition: 'center',
          });
        } else {
          toast.error('Failed to load product details');
        }
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, isEditMode]);

  const handleChange = (key: keyof ProductFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    setFiles(incoming);
  };

  const handleWatermarkImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    setWatermarkImage(incoming[0] || null);
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.description.trim()) return 'Description is required';
    if (!form.priceHD || !form.priceFullHD || !form.price4K) {
      return 'Pricing for HD, Full HD, and 4K is required';
    }

    if (!isEditMode) {
      if (files.length === 0) return 'Please upload at least one image';
      if (form.type !== 'bundle' && files.length > 1) {
        return 'Only one image is allowed for non-bundle product types';
      }
      if (form.type === 'bundle' && files.length < 2) {
        return 'Bundle products require at least 2 images';
      }
      if (form.watermarkType === 'image' && !watermarkImage) {
        return 'Please upload a watermark image when watermark type is set to image';
      }
    }

    return null;
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      if (isEditMode && id) {
        const payload = {
          title: form.title.trim(),
          description: form.description.trim(),
          type: form.type,
          orientation: form.orientation,
          categories: form.categories,
          tags: form.tags,
          prices: {
            HD: Number(form.priceHD),
            'Full HD': Number(form.priceFullHD),
            '4K': Number(form.price4K),
          },
          status: form.status,
        };

        const response: any = await productsApi.update(id, payload);
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to update product');
        }
        toast.success('Product updated successfully');
      } else {
        const formData = new FormData();
        formData.append('title', form.title.trim());
        formData.append('description', form.description.trim());
        formData.append('type', form.type);
        formData.append('orientation', form.orientation);
        formData.append('categories', form.categories);
        formData.append('tags', form.tags);
        formData.append('priceHD', form.priceHD);
        formData.append('priceFullHD', form.priceFullHD);
        formData.append('price4K', form.price4K);
        formData.append('status', form.status);
        formData.append('watermarkType', form.watermarkType);
        if (form.watermarkText.trim()) formData.append('watermarkText', form.watermarkText.trim());
        if (form.watermarkOpacity.trim()) formData.append('watermarkOpacity', form.watermarkOpacity.trim());
        formData.append('watermarkPosition', form.watermarkPosition);

        files.forEach((file) => {
          formData.append('files', file);
        });
        if (watermarkImage) {
          formData.append('watermarkImage', watermarkImage);
        }

        const response: any = await productsApi.createWithFiles(formData);
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to create product');
        }
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {isEditMode ? 'Edit Product' : 'Add New Product'}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Product title"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Product description"
              rows={4}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) => handleChange('type', value as ProductType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="bundle">Bundle</SelectItem>
                  <SelectItem value="typography">Typography</SelectItem>
                  <SelectItem value="poster">Poster</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Orientation</Label>
              <Select
                value={form.orientation}
                onValueChange={(value) => handleChange('orientation', value as OrientationType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categories">Categories (comma separated)</Label>
              <Input
                id="categories"
                placeholder="nature, wildlife"
                value={form.categories}
                onChange={(e) => handleChange('categories', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="sunset, mountain"
                value={form.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priceHD">HD Price (₹)</Label>
              <Input
                id="priceHD"
                type="number"
                min="0"
                step="0.01"
                placeholder="299"
                value={form.priceHD}
                onChange={(e) => handleChange('priceHD', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="priceFullHD">Full HD Price (₹)</Label>
              <Input
                id="priceFullHD"
                type="number"
                min="0"
                step="0.01"
                placeholder="599"
                value={form.priceFullHD}
                onChange={(e) => handleChange('priceFullHD', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="price4K">4K Price (₹)</Label>
              <Input
                id="price4K"
                type="number"
                min="0"
                step="0.01"
                placeholder="999"
                value={form.price4K}
                onChange={(e) => handleChange('price4K', e.target.value)}
                required
              />
            </div>
          </div>

          {!isEditMode && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="files">
                  Upload {form.type === 'bundle' ? 'Bundle Images' : 'Image'}
                </Label>
                <Input
                  id="files"
                  type="file"
                  multiple={form.type === 'bundle'}
                  accept={acceptTypes}
                  onChange={handleFileChange}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: jpg, jpeg, png, webp
                </p>
                {files.length > 0 && (
                  <p className="text-sm text-gray-700 mt-2">{files.length} file(s) selected</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Watermark Type (override)</Label>
                  <Select
                    value={form.watermarkType}
                    onValueChange={(value) => handleChange('watermarkType', value as 'text' | 'image')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Watermark Position (override)</Label>
                  <Select
                    value={form.watermarkPosition}
                    onValueChange={(value) => handleChange('watermarkPosition', value as ProductFormState['watermarkPosition'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="top_left">Top Left</SelectItem>
                      <SelectItem value="top_right">Top Right</SelectItem>
                      <SelectItem value="bottom_left">Bottom Left</SelectItem>
                      <SelectItem value="bottom_right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="watermarkText">Watermark Text (optional override)</Label>
                  <Input
                    id="watermarkText"
                    placeholder="Leave empty to use Site Config"
                    value={form.watermarkText}
                    onChange={(e) => handleChange('watermarkText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="watermarkOpacity">Watermark Opacity % (optional override)</Label>
                  <Input
                    id="watermarkOpacity"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Leave empty to use Site Config"
                    value={form.watermarkOpacity}
                    onChange={(e) => handleChange('watermarkOpacity', e.target.value)}
                  />
                </div>
              </div>

              {form.watermarkType === 'image' && (
                <div>
                  <Label htmlFor="watermarkImage">Watermark Image</Label>
                  <Input
                    id="watermarkImage"
                    type="file"
                    accept={acceptTypes}
                    onChange={handleWatermarkImageChange}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Back to Products
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
