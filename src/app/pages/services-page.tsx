import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { servicesApi, siteConfigApi, contactApi } from '../services/api';
import {
  Camera,
  Heart,
  Users,
  Building,
  Palette,
  Package,
  Sparkles,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price?: string;
  features: string[];
  image?: string;
}

interface SiteConfig {
  phoneNumber: string;
  email: string;
  address?: string;
}

const iconMap: Record<string, any> = {
  camera: Camera,
  heart: Heart,
  users: Users,
  building: Building,
  palette: Palette,
  package: Package,
  sparkles: Sparkles,
};

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchSiteConfig();
  }, []);

  const fetchServices = async () => {
    try {
      const response: any = await servicesApi.getAll();
      if (response.success) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteConfig = async () => {
    try {
      const response: any = await siteConfigApi.getPublic();
      if (response.success) {
        setSiteConfig(response.data);
      }
    } catch (error) {
      console.error('Error fetching site config:', error);
    }
  };

  const handleInquiry = (service?: Service) => {
    setSelectedService(service || null);
    if (service) {
      setFormData((prev) => ({
        ...prev,
        subject: `Inquiry about ${service.title}`,
      }));
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response: any = await contactApi.submit({
        ...formData,
        inquiryType: 'service',
        serviceId: selectedService?.id,
      });
      if (response.success) {
        toast.success('Inquiry submitted successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setIsDialogOpen(false);
      } else {
        toast.error(response.message || 'Failed to submit inquiry');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const getServiceIcon = (iconName: string) => {
    const Icon = iconMap[iconName.toLowerCase()] || Camera;
    return Icon;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Professional Photography Services
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Capturing your precious moments with creativity and expertise
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleInquiry()}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Get a Quote
              </Button>
              {siteConfig?.phoneNumber && (
                <a href={`tel:${siteConfig.phoneNumber}`}>
                  <Button size="lg" variant="outline" className="border-white text-zinc-600 hover:bg-white/10">
                    <Phone className="w-4 h-4 mr-2" />
                    {siteConfig.phoneNumber}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From weddings to commercial shoots, we offer a wide range of photography services
            tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = getServiceIcon(service.icon);
            return (
              <Card key={service.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                {service.image && (
                  <div className="h-48 overflow-hidden">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                  </div>

                  <p className="text-gray-600 mb-4">{service.description}</p>

                  {service.features && service.features.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {service.price && (
                    <p className="text-lg font-semibold text-blue-600 mb-4">{service.price}</p>
                  )}

                  <Button
                    onClick={() => handleInquiry(service)}
                    className="w-full"
                    variant="outline"
                  >
                    Inquire Now
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Contact Section */}
      {siteConfig && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
              <p className="text-lg text-gray-600">
                Have questions? We're here to help!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {siteConfig.phoneNumber && (
                <div className="text-center">
                  <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Phone className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                  <a
                    href={`tel:${siteConfig.phoneNumber}`}
                    className="text-blue-600 hover:underline"
                  >
                    {siteConfig.phoneNumber}
                  </a>
                </div>
              )}

              {siteConfig.email && (
                <div className="text-center">
                  <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {siteConfig.email}
                  </a>
                </div>
              )}

              {siteConfig.address && (
                <div className="text-center">
                  <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-600">{siteConfig.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedService ? `Inquiry about ${selectedService.title}` : 'General Inquiry'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Inquiry'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
