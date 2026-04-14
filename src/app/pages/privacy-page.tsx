export function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed">
              We collect information you provide when creating an account, making purchases, and using our services.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information is used to process orders, improve our services, and communicate with you about your account.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures to protect your personal information.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
