import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { Save, Settings } from 'lucide-react';
import { getToken } from '../../lib/auth';

interface SiteConfig {
  phoneNumber: string;
  email: string;
  address?: string;
  signedUrlDuration: number;
  watermarkText: string;
  watermarkOpacity: number;
  previewQuality: number;
}

export function AdminSiteConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SiteConfig>({
    phoneNumber: '+91 98765 43210',
    email: 'info@photomarket.com',
    address: '',
    signedUrlDuration: 3600,
    watermarkText: 'PHOTOMARKET',
    watermarkOpacity: 30,
    previewQuality: 60,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/site-config/full`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (error) {
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/site-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Configuration updated successfully');
      } else {
        toast.error(data.message || 'Failed to update configuration');
      }
    } catch (error) {
      toast.error('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Configuration</h1>
          <p className="text-gray-600 mt-1">Manage site-wide settings and watermark configuration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={config.phoneNumber}
                onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })}
                required
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                required
                placeholder="info@photomarket.com"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              rows={2}
              value={config.address || ''}
              onChange={(e) => setConfig({ ...config, address: e.target.value })}
              placeholder="Enter business address (optional)"
            />
          </div>
        </Card>

        {/* Watermark Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Watermark Settings</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="watermarkText">Watermark Text *</Label>
              <Input
                id="watermarkText"
                value={config.watermarkText}
                onChange={(e) => setConfig({ ...config, watermarkText: e.target.value })}
                required
                placeholder="PHOTOMARKET"
              />
              <p className="text-sm text-gray-500 mt-1">
                Text that will appear as watermark on preview images
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="watermarkOpacity">
                  Watermark Opacity: {config.watermarkOpacity}%
                </Label>
                <Input
                  id="watermarkOpacity"
                  type="range"
                  min="0"
                  max="100"
                  value={config.watermarkOpacity}
                  onChange={(e) =>
                    setConfig({ ...config, watermarkOpacity: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  0 = invisible, 100 = fully visible
                </p>
              </div>

              <div>
                <Label htmlFor="previewQuality">
                  Preview Quality: {config.previewQuality}%
                </Label>
                <Input
                  id="previewQuality"
                  type="range"
                  min="30"
                  max="90"
                  value={config.previewQuality}
                  onChange={(e) =>
                    setConfig({ ...config, previewQuality: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  JPEG quality for preview images (lower = smaller file, lower quality)
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Download Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Download Settings</h2>
          <div>
            <Label htmlFor="signedUrlDuration">Signed URL Duration (seconds)</Label>
            <Input
              id="signedUrlDuration"
              type="number"
              min="300"
              max="86400"
              value={config.signedUrlDuration}
              onChange={(e) =>
                setConfig({ ...config, signedUrlDuration: parseInt(e.target.value) || 3600 })
              }
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              How long download links remain valid after purchase
              <br />
              • 3600 = 1 hour (recommended)
              • 86400 = 24 hours
              • 300 = 5 minutes (minimum)
            </p>
          </div>
        </Card>

        {/* Preview */}
        <Card className="p-6 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            <div
              className="text-white font-bold transform rotate-[-30deg] select-none"
              style={{
                opacity: config.watermarkOpacity / 100,
                fontSize: '48px',
              }}
            >
              {config.watermarkText}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Preview of how the watermark will appear on images
          </p>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={fetchConfig}
            disabled={saving}
          >
            Reset
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
}
