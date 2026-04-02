/**
 * Contact Page — Get in touch with Cedars Sport Academy.
 * Server component: fetches locations SSR, delegates form to ContactForm client component.
 */

import type { Metadata } from "next";
import { getLocations } from "@/lib/public-api";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Cedars Sport Academy. Find our locations, phone numbers, email, and WhatsApp.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const locations = await getLocations();

  return (
    <div className="pt-28 min-h-screen bg-dark-900">
      {/* ── Header ── */}
      <section className="py-16 text-center">
        <div className="container-custom">
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-3 mb-4">
            Contact <span className="gradient-text">Us</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Have a question? Want to book a trial? We&apos;d love to hear from you.
            Reach out through any of the channels below.
          </p>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* ── Contact Form (client component) ── */}
            <ContactForm />

            {/* ── Contact Info ── */}
            <div className="space-y-8">
              {/* Quick Contact */}
              <div>
                <h2 className="text-2xl font-black text-white mb-6">Quick Contact</h2>
                <div className="space-y-4">
                  {[
                    { icon: "📞", label: "Phone", value: "+974 507 767 76", href: "tel:+974 399 539 96" },
                    { icon: "✉️", label: "Email", value: "info@cedars.com", href: "mailto:info@cedars.com" },
                    { icon: "💬", label: "WhatsApp", value: "+974 399 539 96", href: "https://wa.me/974" },39953996
                    { icon: "📍", label: "Main Campus", value: "Al Rayyan , Doha", href: "#" },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-start gap-4 glass-card p-4 hover:border-lebanon-green/30 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-lebanon-green/10 flex items-center justify-center text-xl flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-white/40 text-xs mb-0.5">{item.label}</div>
                        <div className="text-white group-hover:text-lebanon-green text-sm font-medium transition-colors">
                          {item.value}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Locations from API */}
              <div>
                <h2 className="text-xl font-black text-white mb-4">Our Locations</h2>
                <div className="space-y-3">
                  {locations.length === 0 ? (
                    <div className="glass-card p-4 text-white/40 text-sm text-center">
                      Location info loading…
                    </div>
                  ) : (
                    locations.map((loc) => (
                      <div key={loc.id} className="glass-card p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lebanon-green font-bold text-sm">{loc.name}</span>
                          {loc.isMain && (
                            <span className="text-xs bg-lebanon-green/10 text-lebanon-green px-2 py-0.5 rounded-full">
                              Main
                            </span>
                          )}
                        </div>
                        <div className="text-white/50 text-xs">{loc.address}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Social */}
              <div>
                <h2 className="text-xl font-black text-white mb-4">Follow Us</h2>
                <div className="flex gap-3">
                  {[
                    { label: "Instagram", icon: "📸", href: "https://www.instagram.com/csa_qr/" },
                    { label: "Facebook", icon: "👥", href: "https://www.facebook.com/cedarssportacademy/" },
                    
                    { label: "TikTok", icon: "🎵", href: "https://tiktok.com/@cedarsacademy" },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 glass-card p-3 hover:border-lebanon-green/30 transition-all duration-200 flex-1"
                    >
                      <span className="text-xl">{social.icon}</span>
                      <span className="text-white/40 text-xs">{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
