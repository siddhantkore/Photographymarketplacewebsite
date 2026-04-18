export function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: April 2026</p>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/60 p-8 sm:p-10 space-y-10 text-gray-700 leading-relaxed">

          {/* 1 – Acceptance */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Like Photo Studio website (<strong>likephotostudio.com</strong>),
              purchasing any product, or engaging any service offered through this platform, you
              acknowledge that you have read, understood, and agree to be legally bound by these Terms
              &amp; Conditions and all applicable laws and regulations. If you do not agree with any
              of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          {/* 2 – Definitions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Definitions</h2>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li><strong>"Platform"</strong> refers to the Like Photo Studio website, its sub-domains, mobile applications, and any related services.</li>
              <li><strong>"User," "You," or "Client"</strong> refers to any individual or entity that accesses or uses the Platform.</li>
              <li><strong>"Digital Assets"</strong> refers to photographs, photo bundles, posters, banners, typography designs, and any other downloadable content available on the Platform.</li>
              <li><strong>"Professional Services"</strong> refers to photography sessions, web development, app development, consulting, and any other service engagements offered by Like Photo Studio.</li>
              <li><strong>"Content"</strong> refers to all text, images, graphics, logos, audio, video, and other materials displayed on the Platform.</li>
            </ul>
          </section>

          {/* 3 – Account Registration */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Registration</h2>
            <p className="mb-3">
              Certain features of the Platform require account registration. When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li>Provide accurate, current, and complete information during the registration process.</li>
              <li>Maintain the security of your password and account credentials.</li>
              <li>Accept responsibility for all activities that occur under your account.</li>
              <li>Notify us immediately of any unauthorized use of your account.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these terms or engage in
              fraudulent activity without prior notice.
            </p>
          </section>

          {/* 4 – Digital Assets & Licensing */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Digital Assets &amp; Licensing</h2>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li><strong>Ownership:</strong> Unless otherwise stated, all photographs, posters, banners, typography designs, and digital bundles remain the intellectual property of Like Photo Studio and/or the original creator.</li>
              <li><strong>License Grant:</strong> Upon successful purchase, you are granted a non-exclusive, non-transferable, revocable license to use the purchased assets for personal or commercial purposes as specified at checkout.</li>
              <li><strong>Permitted Uses:</strong> You may use purchased assets in personal projects, commercial designs, marketing materials, websites, and social media posts, subject to the license type selected.</li>
              <li><strong>Prohibited Uses:</strong> You may not resell, redistribute, sublicense, or claim authorship of raw digital files. Assets may not be used in a manner that is defamatory, obscene, or otherwise unlawful.</li>
              <li><strong>Multiple Resolutions:</strong> Assets are available in HD, Full HD, and 4K resolutions. Each resolution constitutes a separate purchase unless bundled together.</li>
            </ul>
          </section>

          {/* 5 – Service Agreements */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Professional Service Agreements</h2>
            <p className="mb-3">
              For professional services including photography sessions, web development, app development,
              and consulting, the following conditions apply:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li>Specific deliverables, timelines, payment milestones, and revision cycles will be outlined in an individual Project Service Agreement (PSA) that supersedes these general terms where applicable.</li>
              <li>The PSA must be signed by both parties before work begins.</li>
              <li>Any scope changes after project commencement may result in revised timelines and additional charges.</li>
              <li>Upon final delivery and acceptance, the client receives a license to the deliverables as outlined in the PSA.</li>
            </ul>
          </section>

          {/* 6 – Pricing & Payments */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Pricing &amp; Payments</h2>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li>All prices on the Platform are listed in Indian Rupees (₹) unless otherwise stated.</li>
              <li>Prices are subject to change without prior notice; however, changes will not affect orders that have already been confirmed.</li>
              <li>Payments are processed securely through Razorpay. We do not store or have access to your full payment card details.</li>
              <li>Applicable taxes (GST) will be calculated and displayed at checkout.</li>
            </ul>
          </section>

          {/* 7 – Refund Policy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Refund &amp; Cancellation Policy</h2>
            <p className="mb-3">
              Due to the nature of digital products:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li><strong>Digital Assets:</strong> All sales of digital assets are final once the download link has been generated or accessed. Refunds will not be issued for downloaded products.</li>
              <li><strong>Professional Services:</strong> Deposits are non-refundable once work has commenced. Cancellations before work begins may be eligible for a partial refund minus administrative fees.</li>
              <li><strong>Defective Products:</strong> If a digital asset is corrupted or does not match the description, please contact support within 48 hours of purchase for a replacement or refund.</li>
            </ul>
          </section>

          {/* 8 – Prohibited Conduct */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Prohibited Conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li>Use the Platform for any unlawful purpose or in violation of any applicable law.</li>
              <li>Attempt to gain unauthorized access to any portion of the Platform, other user accounts, or systems connected to the Platform.</li>
              <li>Interfere with or disrupt the operation of the Platform or servers.</li>
              <li>Use automated scripts, bots, or scrapers to collect data from the Platform.</li>
              <li>Upload or transmit viruses, malware, or other harmful code.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation.</li>
            </ul>
          </section>

          {/* 9 – Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Intellectual Property</h2>
            <p>
              All content on the Platform — including but not limited to logos, text, graphics, images,
              software, and design elements — is the property of Like Photo Studio or its licensors and
              is protected by Indian and international copyright, trademark, and intellectual property
              laws. Unauthorized reproduction, distribution, or modification of any content is strictly
              prohibited.
            </p>
          </section>

          {/* 10 – Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
            <p className="mb-3">
              To the fullest extent permitted by applicable law:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[0.9375rem]">
              <li>Like Photo Studio shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Platform or its products and services.</li>
              <li>Our total liability for any claim arising from these Terms shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.</li>
              <li>We do not warrant that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components.</li>
            </ul>
          </section>

          {/* 11 – Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Like Photo Studio, its directors,
              officers, employees, and agents from and against any and all claims, liabilities, damages,
              losses, costs, and expenses (including reasonable legal fees) arising from your use of the
              Platform, violation of these Terms, or infringement of any third-party rights.
            </p>
          </section>

          {/* 12 – Third-Party Links */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Third-Party Links</h2>
            <p>
              The Platform may contain links to third-party websites or services. These links are provided
              for your convenience only. We do not endorse, control, or assume responsibility for the
              content, privacy policies, or practices of any third-party sites. Accessing third-party
              links is at your own risk.
            </p>
          </section>

          {/* 13 – Modification of Terms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Modification of Terms</h2>
            <p>
              We reserve the right to modify these Terms &amp; Conditions at any time. Changes will be
              effective immediately upon posting on the Platform with an updated "Last Updated" date.
              Your continued use of the Platform after any changes constitutes your acceptance of the
              revised terms. We encourage you to review these Terms periodically.
            </p>
          </section>

          {/* 14 – Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Governing Law &amp; Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any
              disputes arising out of or relating to these Terms shall be subject to the exclusive
              jurisdiction of the courts located in India. Both parties agree to attempt to resolve
              disputes through good-faith negotiation before pursuing formal legal proceedings.
            </p>
          </section>

          {/* 15 – Contact */}
          <section className="pt-6 border-t border-gray-200/60">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Contact Information</h2>
            <p>
              If you have any questions or concerns regarding these Terms &amp; Conditions, please
              contact us through our{' '}
              <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2">
                contact page
              </a>
              . We will respond to all inquiries within 48 business hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}