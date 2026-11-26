import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { 
  FileText, 
  ShieldCheck, 
  Truck, 
  Clock, 
  RotateCcw, 
  AlertCircle, 
  CreditCard, 
  HelpCircle,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | NEEL'S DESIGNER STUDIO",
  description:
    "Read the official Terms & Conditions for Neel's Designer Studio covering orders, payments, shipping, cancellations, exchanges, and customer policies.",
};

export default function TermsPage() {
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
            <span className="text-[#191919] font-medium">Terms &amp; Conditions</span>
          </nav>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-2">
            LEGAL &amp; POLICIES
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#191919] font-normal mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#77716D]">
            Last Updated: 22 November 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-14 py-12 sm:py-16">
        {/* Welcome Notice Box */}
        <div className="p-6 bg-[#F5F3F0] border border-[#EAE5DF] mb-12">
          <p className="font-sans text-xs sm:text-sm text-[#191919] leading-relaxed">
            Welcome to <strong>Neel&apos;s Designer Studio</strong>. By accessing our website, browsing our collections, or placing an order, you agree to the following Terms &amp; Conditions. Please read them carefully before making a purchase.
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
                  About Our Business
                </h2>
                <div className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <p>
                    Neel&apos;s Designer Studio is an individually owned clothing and accessories business based in Moodbidri, Karnataka, India. We offer selected fashion products, clothing, and accessories through our website and other official communication channels.
                  </p>
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
                  Orders and Order Confirmation
                </h2>
                <ul className="list-disc pl-5 space-y-2.5 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <li>Customers can place orders through our website, WhatsApp, or Instagram.</li>
                  <li>An order is considered accepted after confirmation from Neel&apos;s Designer Studio.</li>
                  <li>Customers must provide accurate contact, delivery, and order information.</li>
                  <li>We reserve the right to contact customers to verify order details.</li>
                  <li>Orders may be cancelled if product availability, payment confirmation, or delivery details cannot be verified.</li>
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
                  Product Information
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed mb-3">
                  We make reasonable efforts to display accurate product descriptions, images, colours, sizes, and other details.
                </p>
                <p className="font-sans text-xs sm:text-sm text-[#191919] font-medium mb-2">
                  However:
                </p>
                <ul className="list-disc pl-5 space-y-2 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <li>Actual product colours may vary slightly due to screen settings and lighting.</li>
                  <li>Minor variations in fabric, finish, or appearance may occur.</li>
                  <li>Product availability may change without prior notice.</li>
                  <li>Product images are intended to represent the actual products as accurately as possible.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">4.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal flex items-center gap-2">
                  <span>Pricing and Payments (Direct UPI &amp; No COD)</span>
                </h2>
                <ul className="list-disc pl-5 space-y-2.5 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <li>All displayed prices are in Indian Rupees (INR) and represent direct atelier pricing.</li>
                  <li>Applicable DTDC courier shipping charges are calculated and displayed transparently before order placement.</li>
                  <li>
                    <strong className="text-[#191919]">Direct UPI Payment Method:</strong> Payments are processed directly via Unified Payments Interface (UPI). Patrons can pay seamlessly via dynamic QR code or direct UPI intent through Google Pay, PhonePe, Paytm, BHIM, CRED, or any authorized banking UPI application directly into our bank account.
                  </li>
                  <li>
                    <strong className="text-[#191919]">Zero Transaction Fee:</strong> We do not levy any gateway convenience charges or intermediary transaction fees. 100% of your payment is credited directly toward your order.
                  </li>
                  <li>
                    <strong className="text-[#191919]">Strict No Cash on Delivery (COD) Policy:</strong> Cash on Delivery is strictly unavailable across our entire catalog. Because each bespoke piece is individually prepared, hand-finished, or tailored upon order placement, all purchases are accepted strictly on a prepaid basis.
                  </li>
                  <li>
                    <strong className="text-[#191919]">Order Confirmation &amp; Verification:</strong> Order placement records an initial status of <em>Payment Pending</em>. Orders proceed to tailoring, cutting, and packaging once our accounts desk verifies and reconciles the UPI transaction reference (UTR) against our bank statement.
                  </li>
                  <li>
                    <strong className="text-[#191919]">Direct UPI Refunds:</strong> Any approved cancellations (within the 24-hour placement window) or eligible return refunds are remitted directly to the patron&apos;s originating bank account or source UPI ID within 3–5 business days.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">5.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Shipping and Delivery
                </h2>
                <div className="space-y-4 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <div className="p-4 bg-[#F5F3F0] border border-[#EAE5DF] space-y-2">
                    <p>
                      <strong className="text-[#191919]">Delivery coverage:</strong> We currently offer delivery across India.
                    </p>
                    <p>
                      <strong className="text-[#191919]">Shipping charges:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Orders below ₹8,000:</strong> Standard DTDC courier charges apply based on delivery destination (Karnataka: ₹80, South India: ₹120, Rest of India: ₹180, Remote / Special regions: ₹250).
                      </li>
                      <li><strong>Orders of ₹8,000 or above:</strong> Complimentary free shipping across India.</li>
                    </ul>
                    <p>
                      <strong className="text-[#191919]">Courier partner:</strong> DTDC or another suitable courier partner, depending on service availability.
                    </p>
                  </div>

                  <p className="font-medium text-[#191919]">Estimated delivery:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Standard locations:</strong> Approximately 5–7 business days.</li>
                    <li><strong>Remote locations:</strong> Approximately 7–10 business days.</li>
                    <li>Order processing generally takes 1–3 business days before dispatch.</li>
                  </ul>

                  <p>
                    Delivery estimates are indicative and may vary due to courier delays, weather conditions, operational disruptions, or circumstances beyond our control.
                  </p>
                  <p>
                    Customers must provide a complete and accurate delivery address and reachable contact number.
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
                  Order Cancellation
                </h2>
                <ul className="list-disc pl-5 space-y-2.5 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed mb-4">
                  <li>Customers who wish to cancel an order must contact Neel&apos;s Designer Studio directly through WhatsApp or Instagram.</li>
                  <li>Cancellation requests must be submitted within 24 hours of placing the order.</li>
                  <li>Approved cancellations within this period are eligible for a full refund, including shipping charges paid.</li>
                  <li>Requests submitted after 24 hours may not be accepted, particularly if the order has already been processed or dispatched.</li>
                  <li>Cancellation is subject to confirmation by the shop owner.</li>
                </ul>

                <div className="p-4 bg-[#F5F3F0] border border-[#EAE5DF] text-xs font-sans text-[#191919] space-y-1.5">
                  <strong className="block text-[11px] uppercase tracking-wider text-[#7B5644]">
                    Contact for Cancellation and Refunds:
                  </strong>
                  <p><strong>WhatsApp:</strong> <a href="https://wa.me/918123200215" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#7B5644]">+91 8123200215</a></p>
                  <p><strong>Instagram:</strong> <a href="https://www.instagram.com/neels_designer_studio?obrf=aDk1emZ3aHVicDZl" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#7B5644]">Neel&apos;s Designer Studio official Instagram account</a></p>
                  <p><strong>Email:</strong> <a href="mailto:neels9589@gmail.com" className="underline hover:text-[#7B5644]">neels9589@gmail.com</a></p>
                  <p className="text-[#77716D] pt-1">
                    Please provide your order ID and registered contact number when contacting us.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">7.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Exchanges and Damaged Products
                </h2>
                <div className="space-y-4 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <p className="font-medium text-[#191919]">
                    We accept exchange requests only in the following circumstances:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>The product received is damaged.</li>
                    <li>The product is defective.</li>
                    <li>The wrong product has been delivered.</li>
                  </ul>

                  <div className="p-4 bg-[#F5F3F0] border border-[#EAE5DF] space-y-2 mt-4">
                    <p className="font-medium text-[#191919]">Exchange conditions:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Contact us within <strong>2–3 days</strong> of receiving the order.</li>
                      <li>
                        <strong className="text-[#191919]">A continuous, uninterrupted unpacking video must be provided as evidence.</strong>
                      </li>
                      <li>The product must be unused and unworn.</li>
                      <li>Original tags and packaging must remain intact.</li>
                      <li>Products must not be washed, altered, damaged, or tampered with.</li>
                      <li>Exchanges are subject to product availability and approval after inspection.</li>
                    </ul>
                  </div>

                  <p className="text-[#77716D]">
                    Change-of-mind returns, size preferences after delivery, or dissatisfaction unrelated to a defect or incorrect delivery are not eligible under this policy.
                  </p>
                  <p className="text-[#191919] font-medium">
                    For approved exchanges, the customer is responsible for both-way shipping charges.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">8.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Refund Policy
                </h2>
                <ul className="list-disc pl-5 space-y-2.5 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed mb-4">
                  <li>For refund-related enquiries, customers must contact Neel&apos;s Designer Studio directly through WhatsApp or Instagram.</li>
                  <li>Approved cancellations within 24 hours qualify for a 100% refund, including shipping charges.</li>
                  <li>Refund requests relating to damaged, defective, or incorrect products will be reviewed individually.</li>
                  <li>Refund eligibility is subject to the applicable exchange and cancellation conditions.</li>
                  <li>Once approved, refunds will be arranged through the applicable payment method.</li>
                  <li>Processing time may depend on the payment provider or financial institution.</li>
                </ul>

                <div className="p-4 bg-[#F5F3F0] border border-[#EAE5DF] text-xs font-sans text-[#191919] space-y-1.5">
                  <strong className="block text-[11px] uppercase tracking-wider text-[#7B5644]">
                    Contact for Cancellation and Refunds:
                  </strong>
                  <p><strong>WhatsApp:</strong> <a href="https://wa.me/918123200215" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#7B5644]">+91 8123200215</a></p>
                  <p><strong>Instagram:</strong> <a href="https://www.instagram.com/neels_designer_studio?obrf=aDk1emZ3aHVicDZl" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#7B5644]">Neel&apos;s Designer Studio official Instagram account</a></p>
                  <p><strong>Email:</strong> <a href="mailto:neels9589@gmail.com" className="underline hover:text-[#7B5644]">neels9589@gmail.com</a></p>
                  <p className="text-[#77716D] pt-1">
                    Please provide your order ID and registered contact number when contacting us.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">9.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Customer Responsibilities
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed mb-3">
                  Customers are responsible for:
                </p>
                <ul className="list-disc pl-5 space-y-2 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <li>Providing correct delivery and contact details.</li>
                  <li>Reviewing product information before ordering.</li>
                  <li>Keeping order confirmations and payment records.</li>
                  <li>Following the cancellation and exchange procedures.</li>
                  <li>Providing genuine evidence when reporting damaged, defective, or incorrect products.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 10 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">10.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Limitation of Liability
                </h2>
                <ul className="list-disc pl-5 space-y-2 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  <li>Neel&apos;s Designer Studio shall not be responsible for delays caused by courier partners, natural events, technical interruptions, or circumstances outside our reasonable control.</li>
                  <li>Nothing in these Terms &amp; Conditions limits any consumer rights that cannot legally be excluded under applicable Indian law.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 11 */}
          <section className="border-b border-[#EAE5DF] pb-10">
            <div className="flex items-start gap-4">
              <span className="font-serif text-xl sm:text-2xl text-[#7B5644] font-medium">11.</span>
              <div className="flex-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-4 font-normal">
                  Changes to These Terms
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
                  We may update these Terms &amp; Conditions when business policies, services, or applicable requirements change. Updated terms will be published on this page.
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
                  Contact Information
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed mb-4">
                  For order assistance, cancellations, exchanges, or policy-related questions:
                </p>
                <div className="bg-[#F5F3F0] border border-[#EAE5DF] p-6 space-y-3 font-sans text-xs sm:text-sm">
                  <p><strong>Business:</strong> Neel&apos;s Designer Studio</p>
                  <p><strong>Owner &amp; Grievance Officer:</strong> Nilofer</p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:neels9589@gmail.com" className="text-[#191919] underline hover:text-[#7B5644]">
                      neels9589@gmail.com
                    </a>
                  </p>
                  <p>
                    <strong>WhatsApp / Primary Contact:</strong>{" "}
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
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
