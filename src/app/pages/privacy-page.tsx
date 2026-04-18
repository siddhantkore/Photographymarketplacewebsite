export function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: April 16, 2026</p>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/60 p-8 sm:p-10 space-y-10 text-gray-700 leading-relaxed">

          {/* Introduction */}
          <section>
            <p>
              Like Photo Studio (<strong>"we," "us,"</strong> or <strong>"our"</strong>) is committed
              to protecting your privacy. This Privacy Policy describes how we collect, use, disclose,
              and safeguard your personal information when you visit our website
              (<strong>likephotostudio.com</strong>), use our services, or purchase digital assets
              through our platform. Please read this policy carefully. By using the Platform, you
              consent to the data practices described in this policy.
            </p>
          </section>

          {/* 1 – Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              We collect information in several ways to provide and improve our services:
            </p>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">1.1 Information You Provide Directly</h3>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account.</li>
              <li><strong>Billing Information:</strong> Billing address and payment method details provided during checkout. Payment card details are processed by our payment partner (Razorpay) and are never stored on our servers.</li>
              <li><strong>Contact Information:</strong> Details you share when submitting contact forms, service inquiries, or support requests.</li>
              <li><strong>Profile Data:</strong> Any additional information you voluntarily add to your user profile.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">1.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, products viewed, search queries, download history, and interaction patterns.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device type, screen resolution, and language preference.</li>
              <li><strong>Log Data:</strong> IP address, access times, referring URLs, and error logs.</li>
              <li><strong>Cookies &amp; Tracking Technologies:</strong> We use cookies, local storage, and similar technologies to maintain sessions, remember preferences, and analyze usage patterns.</li>
            </ul>
          </section>

          {/* 2 – How We Use Your Data */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li><strong>Order Fulfillment:</strong> Processing transactions, generating secure download links, and delivering purchased digital assets.</li>
              <li><strong>Account Management:</strong> Creating and maintaining your user account, managing authentication, and providing order history.</li>
              <li><strong>Customer Support:</strong> Responding to inquiries, troubleshooting issues, and providing assistance for services and purchases.</li>
              <li><strong>Service Improvement:</strong> Analyzing usage patterns to enhance our platform, improve product recommendations, and optimize user experience.</li>
              <li><strong>Communication:</strong> Sending order confirmations, shipping updates, service notifications, and — with your consent — promotional communications.</li>
              <li><strong>Legal Compliance:</strong> Fulfilling legal obligations including tax reporting, fraud prevention, and regulatory requirements.</li>
              <li><strong>Security:</strong> Detecting, preventing, and addressing technical issues, fraud, and unauthorized access.</li>
            </ul>
          </section>

          {/* 3 – Data Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Share Your Information</h2>
            <p className="mb-3">
              We do not sell your personal information to third parties. We may share your data in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li><strong>Payment Processors:</strong> We share necessary transaction details with Razorpay to process your payments securely.</li>
              <li><strong>Cloud Infrastructure:</strong> We use cloud services (e.g., AWS S3) for hosting, storage, and content delivery. These providers process data on our behalf under strict contractual obligations.</li>
              <li><strong>Analytics Providers:</strong> We use analytics tools to understand platform usage. Data shared with these providers is aggregated and anonymized where possible.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or government regulation, or to protect the rights, property, or safety of Like Photo Studio, our users, or the public.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction.</li>
            </ul>
          </section>

          {/* 4 – Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies &amp; Tracking Technologies</h2>
            <p className="mb-3">
              We use cookies and similar technologies for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li><strong>Essential Cookies:</strong> Required for the Platform to function, including authentication, session management, and security.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences (e.g., language, theme).</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the Platform, enabling us to improve functionality and content.</li>
              <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements (e.g., Google AdSense) and measure campaign effectiveness.</li>
            </ul>
            <p className="mt-3">
              You can manage cookie preferences through your browser settings. Please note that disabling
              certain cookies may affect the functionality of the Platform.
            </p>
          </section>

          {/* 5 – Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
            <p className="mb-3">
              We implement industry-standard security measures to protect your personal information, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li>HTTPS/TLS encryption for all data transmission.</li>
              <li>Encrypted storage of sensitive data at rest.</li>
              <li>Regular security audits and vulnerability assessments.</li>
              <li>Access controls limiting employee access to personal data on a need-to-know basis.</li>
              <li>Secure password hashing using industry-standard algorithms.</li>
            </ul>
            <p className="mt-3">
              Despite our efforts, no method of electronic transmission or storage is 100% secure.
              We cannot guarantee absolute security but are committed to promptly addressing any
              breach in accordance with applicable laws.
            </p>
          </section>

          {/* 6 – Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
            <p>
              We retain your personal data only for as long as necessary to fulfill the purposes for
              which it was collected, including legal, accounting, and reporting requirements. Account
              data is retained as long as your account is active. Transaction records are retained for
              a minimum of 7 years to comply with tax and financial regulations. You may request
              deletion of your account and associated data at any time, subject to our legal obligations.
            </p>
          </section>

          {/* 7 – Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p className="mb-3">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
              <li><strong>Right to Restrict Processing:</strong> Request that we limit how we use your data.</li>
              <li><strong>Right to Data Portability:</strong> Request your data in a structured, machine-readable format.</li>
              <li><strong>Right to Object:</strong> Object to processing of your data for direct marketing purposes.</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on your consent.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us using the details provided below.
              We will respond to your request within 30 days.
            </p>
          </section>

          {/* 8 – Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Children's Privacy</h2>
            <p>
              The Platform is not intended for use by individuals under the age of 18. We do not
              knowingly collect personal data from children. If we become aware that we have
              inadvertently collected data from a child under 18, we will take steps to delete
              such information promptly.
            </p>
          </section>

          {/* 9 – International Transfers */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. International Data Transfers</h2>
            <p>
              Your information may be processed and stored on servers located outside your country of
              residence. By using the Platform, you consent to the transfer of your data to countries
              that may have different data protection laws than your jurisdiction. We take appropriate
              measures to ensure that your data remains protected in accordance with this Privacy Policy.
            </p>
          </section>

          {/* 10 – Changes to Privacy Policy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices,
              technologies, legal requirements, or other factors. The updated policy will be posted on
              this page with a revised "Effective Date." We encourage you to review this policy
              periodically. Your continued use of the Platform after any changes constitutes your
              acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="pt-6 border-t border-gray-200/60">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our
              data practices, please reach out to us through our{' '}
              <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2">
                contact page
              </a>
              . We are committed to addressing your concerns and will respond within 48 business hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}