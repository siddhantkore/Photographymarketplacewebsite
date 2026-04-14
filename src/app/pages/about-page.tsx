import { CheckCircle, Shield, Download, Zap, Award, Users } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Like Photo Studio</h1>
        <p className="text-lg text-gray-600 mb-10 max-w-3xl">
          We are a digital photography marketplace that makes high-quality visual content accessible,
          licensable, and ready to use for creative professionals and brands.
        </p>

        {/* Mission */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <p className="text-gray-700 leading-relaxed">
              Like Photo Studio bridges the gap between talented photographers and the people who need
              exceptional visual content. We provide a curated marketplace where every asset — from single
              photos to complete design bundles — is reviewed for quality, properly licensed, and delivered
              in multiple resolutions for immediate use.
            </p>
          </div>
        </section>

        {/* What We Offer */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Digital Photography Assets</h3>
              <p className="text-gray-600 text-sm">
                Single photos, curated bundles, typography designs, posters, and banners — all available
                for instant download in HD, Full HD, and 4K resolutions.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Photography Services</h3>
              <p className="text-gray-600 text-sm">
                Beyond digital assets, we offer professional photography services including weddings,
                portraits, commercial shoots, and creative direction.
              </p>
            </div>
          </div>
        </section>

        {/* Trust & Quality */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Trust Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Shield className="w-10 h-10 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-1">Secure Payments</h3>
              <p className="text-gray-600 text-sm">
                All transactions are processed securely through Razorpay, a trusted payment gateway.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Award className="w-10 h-10 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-1">Curated Quality</h3>
              <p className="text-gray-600 text-sm">
                Every asset is reviewed for quality before being listed on the marketplace.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Download className="w-10 h-10 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-1">Instant Delivery</h3>
              <p className="text-gray-600 text-sm">
                Time-limited download links are generated immediately after purchase.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Zap className="w-10 h-10 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-1">Multiple Resolutions</h3>
              <p className="text-gray-600 text-sm">
                Choose the resolution that fits your project — from HD to 4K.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-1">Creator Support</h3>
              <p className="text-gray-600 text-sm">
                Our team is available to help with licensing questions and purchase support.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-1">Clear Licensing</h3>
              <p className="text-gray-600 text-sm">
                Every purchase includes a clear license for personal and commercial use.
              </p>
            </div>
          </div>
        </section>

        {/* Support & Policies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Support &amp; Policies</h2>
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Customer Support</h3>
              <p className="text-gray-600 text-sm">
                For any questions about purchases, licensing, or downloads, please reach out through our{' '}
                <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                  contact page
                </a>
                . We respond to all inquiries within 24 hours.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Refund Policy</h3>
              <p className="text-gray-600 text-sm">
                Due to the digital nature of our products, all sales are final once a download link has been
                used. If you experience issues with a purchase, our support team will work to resolve them.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Privacy</h3>
              <p className="text-gray-600 text-sm">
                We take your privacy seriously. Read our{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                  Privacy Policy
                </a>{' '}
                for details on how we handle your data.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
