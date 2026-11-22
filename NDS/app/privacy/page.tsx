import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, Bell, Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | NEEL'S DESIGNER STUDIO",
  description:
    "Read the Privacy Policy of Neel's Designer Studio to understand how your personal information, order data, and privacy rights are protected.",
};

export default function PrivacyPage() {
  return (
    <div className="w-full bg-[#FDFBF8] text-[#191919] min-h-screen">
      {/* Editorial Header */}
      <section className="w-full border-b border-[#EAE5DF] bg-[#F5F3F0]/60 py-12 sm:py-16 px-6 sm:px-10 lg:px-14">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-[#77716D] mb-4">
            <Link href="/" className="hover:text-[#191919] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#191919] font-medium">Privacy Policy</span>
          </nav>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-2">
            DATA PROTECTION &amp; TRANSPARENCY
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#191919] font-normal mb-3">
            Privacy Policy
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#77716D]">
            Last Updated: 22 November 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-14 py-12 sm:py-16">
        {/* Intro Box */}
        <div className="p-6 bg-[#F5F3F0] border border-[#EAE5DF] mb-12">
          <p className="font-sans text-xs sm:text-sm text-[#191919] leading-relaxed">
            At <strong>Neel&apos;s Designer Studio</strong>, we respect your privacy and are committed to handling your personal information responsibly. This Privacy Policy explains what information we collect, how we use it, and the choices available to you when you interact with our website and services.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-12">
          {/* Section 1 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">1.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Information We Collect
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed mb-4">
                  Depending on how you interact with us, we may collect:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F5F3F0] border border-[#EAE5DF]">
                    <h3 className="font-medium text-xs sm:text-sm text-[#191919] mb-2 uppercase tracking-wider text-[11px]">
                      Personal information
                    </h3>
                    <ul className="list-disc pl-4 space-y-1 font-sans text-xs text-[#77716D]">
                      <li>Full name</li>
                      <li>Mobile number</li>
                      <li>Email address</li>
                      <li>Billing and delivery address</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#F5F3F0] border border-[#EAE5DF]">
                    <h3 className="font-medium text-xs sm:text-sm text-[#191919] mb-2 uppercase tracking-wider text-[11px]">
                      Order information
                    </h3>
                    <ul className="list-disc pl-4 space-y-1 font-sans text-xs text-[#77716D]">
                      <li>Products purchased</li>
                      <li>Order details and order history</li>
                      <li>Payment confirmation and transaction references</li>
                      <li>Shipping and delivery information</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#F5F3F0] border border-[#EAE5DF]">
                    <h3 className="font-medium text-xs sm:text-sm text-[#191919] mb-2 uppercase tracking-wider text-[11px]">
                      Technical information
                    </h3>
                    <ul className="list-disc pl-4 space-y-1 font-sans text-xs text-[#77716D]">
                      <li>IP address</li>
                      <li>Browser and device information</li>
                      <li>Website usage and interaction data</li>
                      <li>Cookies or similar technologies, where enabled</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#F5F3F0] border border-[#EAE5DF]">
                    <h3 className="font-medium text-xs sm:text-sm text-[#191919] mb-2 uppercase tracking-wider text-[11px]">
                      Communication information
                    </h3>
                    <ul className="list-disc pl-4 space-y-1 font-sans text-xs text-[#77716D]">
                      <li>Messages sent through WhatsApp, Instagram, email, or website support</li>
                      <li>Information supplied when requesting cancellations, exchanges, or customer assistance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">2.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  How We Use Your Information
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed mb-3">
                  We use collected information for legitimate business purposes, including:
                </p>
                <ul className="list-disc pl-5 space-y-2 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <li>Processing and managing orders.</li>
                  <li>Confirming payments.</li>
                  <li>Arranging shipping and delivery.</li>
                  <li>Providing order updates.</li>
                  <li>Responding to customer enquiries.</li>
                  <li>Processing eligible cancellations and refunds.</li>
                  <li>Handling damaged, defective, or incorrect-product complaints.</li>
                  <li>Improving website functionality and customer experience.</li>
                  <li>Preventing fraudulent or unauthorized activity.</li>
                  <li>Meeting applicable legal and regulatory obligations.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">3.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Payment Information
                </h2>
                <div className="p-4 bg-[#F5F3F0] border border-[#EAE5DF] space-y-2.5 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <p>
                    <strong className="text-[#191919]">Neel&apos;s Designer Studio does not intend to collect or store customers&apos; complete card numbers, CVV codes, UPI PINs, or banking passwords on its website.</strong>
                  </p>
                  <p>
                    Payment-related information may include transaction references and payment confirmation details required to manage orders.
                  </p>
                  <p>
                    Payment gateway services, if introduced, will be governed by the relevant provider&apos;s security and privacy practices. Razorpay integration is not currently implemented.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">4.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Sharing of Information
                </h2>
                <div className="space-y-3 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <p className="font-medium text-[#191919]">
                    We do not sell customers&apos; personal information.
                  </p>
                  <p>
                    We may share necessary information with trusted service providers when required to operate our business, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Courier and delivery partners such as DTDC.</li>
                    <li>Website hosting and infrastructure providers.</li>
                    <li>Payment service providers, where applicable.</li>
                    <li>Technical service providers supporting website operations.</li>
                    <li>Government authorities or legal bodies where disclosure is required by law.</li>
                  </ul>
                  <p>
                    Information shared will be limited to what is reasonably necessary for the relevant purpose.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">5.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Cookies and Website Technologies
                </h2>
                <div className="space-y-3 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <p>Our website may use cookies or similar technologies to:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Maintain essential website functionality.</li>
                    <li>Remember user preferences.</li>
                    <li>Support authentication and shopping-related features.</li>
                    <li>Understand website performance.</li>
                    <li>Improve user experience.</li>
                  </ul>
                  <p>
                    You can manage cookies through your browser settings. Disabling certain cookies may affect some website features.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">6.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Data Security
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  We take reasonable technical and organizational measures to protect personal information against unauthorized access, alteration, disclosure, or loss. However, no internet transmission or electronic storage system can be guaranteed to be completely secure.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">7.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Data Retention
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  We retain personal information only for as long as reasonably necessary to fulfil the purposes described in this policy, maintain business records, resolve disputes, and comply with applicable legal obligations.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">8.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Your Privacy Rights
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed mb-3">
                  Subject to applicable law, you may request to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <li>Access personal information associated with you.</li>
                  <li>Correct inaccurate or incomplete information.</li>
                  <li>Request deletion of information where legally permissible.</li>
                  <li>Withdraw consent where processing is based on consent.</li>
                  <li>Raise concerns regarding the handling of your personal information.</li>
                </ul>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed mt-3">
                  Some information may need to be retained to fulfil legal, accounting, security, or legitimate business obligations.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">9.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Third-Party Services
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  Our website or communications may contain links to external services, including courier tracking pages and social media platforms. We are not responsible for the privacy practices of third-party websites. Customers should review the privacy policies of those services separately.
                </p>
              </div>
            </div>
          </section>

          {/* Section 10 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">10.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Children&apos;s Privacy
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  Our website and services are not intentionally designed to collect personal information from children without appropriate authorization or consent where required by applicable law.
                </p>
              </div>
            </div>
          </section>

          {/* Section 11 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">11.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Changes to This Privacy Policy
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  We may update this Privacy Policy to reflect changes in our business practices, website features, or legal requirements. The latest version will be published on this page.
                </p>
              </div>
            </div>
          </section>

          {/* Section 12 */}
          <section>
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">12.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Privacy Questions and Grievances
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed mb-4">
                  For privacy-related requests, complaints, or questions, contact:
                </p>
                <div className="bg-[#F5F3F0] border border-[#EAE5DF] p-6 space-y-3 font-sans text-xs sm:text-sm">
                  <p><strong>Owner &amp; Grievance Officer:</strong> Nilofer</p>
                  <p><strong>Business:</strong> Neel&apos;s Designer Studio</p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:neels9589@gmail.com" className="text-[#191919] underline hover:text-[#7B5644]">
                      neels9589@gmail.com
                    </a>
                  </p>
                  <p>
                    <strong>WhatsApp:</strong>{" "}
                    <a href="https://wa.me/918123200215" target="_blank" rel="noopener noreferrer" className="text-[#191919] underline hover:text-[#7B5644]">
                      +91 8123200215
                    </a>
                  </p>
                  <p>
                    <strong>Secondary Contact:</strong>{" "}
                    <a href="tel:+919740259215" className="text-[#191919] underline hover:text-[#7B5644]">
                      +91 9740259215
                    </a>
                  </p>
                  <p><strong>Location:</strong> Moodbidri, Karnataka – 574227, India</p>
                  <p><strong>Support Hours:</strong> Daily, 9:00 AM – 8:00 PM</p>
                </div>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed mt-4 italic">
                  We will review and respond to requests within a reasonable period and in accordance with applicable law.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
