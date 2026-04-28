/**
 * Privacy Policy — Cedars Sport Academy
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Privacy Policy for Cedars Sport Academy. Learn how we collect, use, and protect your personal information.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information you provide directly, such as your name, email address, phone number, and your children's details when you register an account or enroll in programs. We also collect usage data such as login times and pages visited to improve our services.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use your information to manage your account, process enrollments, send program updates and notifications, communicate important academy news, and improve our services. We do not sell your personal data to third parties.",
  },
  {
    title: "3. Email Communications",
    content:
      "By registering, you consent to receiving transactional emails such as enrollment confirmations, session reminders, and password reset links. You may contact us to opt out of non-essential communications.",
  },
  {
    title: "4. Children's Privacy",
    content:
      "We collect information about enrolled children solely for the purpose of managing their participation in academy programs. This data is linked to the parent's account and is not shared with third parties except as required by law.",
  },
  {
    title: "5. Data Storage & Security",
    content:
      "Your data is stored on secure servers. We use industry-standard encryption (HTTPS, bcrypt password hashing) and access controls to protect your information. However, no method of transmission over the internet is 100% secure.",
  },
  {
    title: "6. Cookies",
    content:
      "Our platform uses session cookies to maintain your login state. These are essential cookies and cannot be disabled if you wish to use the member portal. We do not use third-party tracking cookies.",
  },
  {
    title: "7. Data Sharing",
    content:
      "We do not sell, trade, or rent your personal information. We may share data with service providers who assist us in operating our platform (e.g., email delivery), bound by confidentiality agreements.",
  },
  {
    title: "8. Your Rights",
    content:
      "You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at info@cedarssports.com. We will respond within 30 days.",
  },
  {
    title: "9. Data Retention",
    content:
      "We retain your data for as long as your account is active or as needed to provide services. If you close your account, we will delete your personal data within 90 days, except where retention is required by law.",
  },
  {
    title: "10. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify you of significant changes via email. Continued use of the platform after changes constitutes acceptance of the updated policy.",
  },
  {
    title: "11. Contact Us",
    content:
      "If you have any questions or concerns about this Privacy Policy, please contact us at info@cedarssports.com or through our Contact page.",
  },
];

export default function PrivacyPage() {
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
            Privacy <span className="gradient-text">Policy</span>
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
              At Cedars Sport Academy, we are committed to protecting your privacy. This policy
              explains what information we collect, how we use it, and your rights regarding your
              personal data.
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
              href="/terms"
              className="text-lebanon-green hover:underline font-medium"
            >
              Terms of Service →
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
