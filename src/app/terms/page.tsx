/**
 * Terms of Service — Cedars Sport Academy
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Terms of Service for Cedars Sport Academy. Understand your rights and responsibilities as a member of our academy.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By registering or using the Cedars Sport Academy member portal, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.",
  },
  {
    title: "2. Membership & Registration",
    content:
      "You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.",
  },
  {
    title: "3. Program Enrollment",
    content:
      "Enrollment in programs is subject to availability and payment. Sessions are allocated upon successful payment. Cedars Sport Academy reserves the right to modify program schedules, coaches, or locations with reasonable notice.",
  },
  {
    title: "4. Payments & Fees",
    content:
      "All fees are payable in advance as specified at enrollment. Fees are non-refundable except in cases of program cancellation by the Academy. Payment plans may be available upon request.",
  },
  {
    title: "5. Attendance & Cancellations",
    content:
      "Members are expected to attend scheduled sessions. Missed sessions are not automatically rescheduled or refunded. Please contact us in advance if you are unable to attend.",
  },
  {
    title: "6. Code of Conduct",
    content:
      "All members, parents, and guardians are expected to behave respectfully toward coaches, staff, and fellow members. The Academy reserves the right to suspend or terminate membership for misconduct.",
  },
  {
    title: "7. Health & Safety",
    content:
      "Members participate in physical activities at their own risk. You must inform the Academy of any medical conditions or injuries that may affect participation. The Academy is not liable for injuries sustained during normal training activities.",
  },
  {
    title: "8. Privacy",
    content:
      "Your personal data is handled in accordance with our Privacy Policy. By using our services, you consent to the collection and use of information as described therein.",
  },
  {
    title: "9. Intellectual Property",
    content:
      "All content on the Cedars Sport Academy platform, including logos, images, and text, is the property of Cedars Sport Academy and may not be reproduced without written permission.",
  },
  {
    title: "10. Changes to Terms",
    content:
      "We reserve the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the revised Terms. We will notify members of material changes via email.",
  },
  {
    title: "11. Contact",
    content:
      "For questions about these Terms, please contact us at info@cedarssports.com or visit our Contact page.",
  },
];

export default function TermsPage() {
  return (
    <div className="pt-28 min-h-screen bg-dark-900">
      {/* ── Hero ── */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lebanon-green/5 via-transparent to-lebanon-red/5 pointer-events-none" />
        <div className="container-custom relative z-10 text-center">
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="text-white/50 text-sm">
            Last updated: January 1, 2026
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="glass-card p-8 md:p-12 space-y-8">
            <p className="text-white/60 leading-relaxed">
              Welcome to Cedars Sport Academy. These Terms of Service govern your use of our member
              portal and services. Please read them carefully before using our platform.
            </p>

            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-white font-bold text-lg mb-2">
                  {section.title}
                </h2>
                <p className="text-white/60 leading-relaxed text-sm">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Back links */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            <Link
              href="/privacy"
              className="text-lebanon-green hover:underline font-medium"
            >
              Privacy Policy →
            </Link>
            <span className="text-white/20 hidden sm:block">|</span>
            <Link
              href="/contact"
              className="text-white/50 hover:text-white transition-colors"
            >
              Contact Us
            </Link>
            <span className="text-white/20 hidden sm:block">|</span>
            <Link
              href="/"
              className="text-white/50 hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
