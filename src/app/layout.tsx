import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { TenantProvider } from "@/context/TenantContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsTicker from "@/components/layout/NewsTicker";

export const metadata: Metadata = {
  title: {
    default: "Cedars Sport Academy — Shaping Champions Since 2018",
    template: "%s | Cedars Sport Academy",
  },
  description:
    "Qatar's premier sports academy offering professional training in Football, Basketball, Swimming, Martial Arts, Tennis, and Gymnastics. Join us and become a champion.",
  keywords: [
    "sports academy Qatar",
    "football training Qatar",
    "basketball academy Doha",
    "swimming lessons Qatar",
    "gymnastics Qatar",
    "Cedars Sport Academy",
    "أكاديمية رياضية قطر",
  ],
  authors: [{ name: "Cedars Sport Academy" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cedarsacademy.lb",
    siteName: "Cedars Sport Academy",
    title: "Cedars Sport Academy — Shaping Champions Since 2018",
    description:
      "Qatar's premier sports academy. Professional coaching in 6 sports disciplines across 3 locations.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Cedars Sport Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cedars Sport Academy",
    description: "Qatar's premier sports academy — Shaping Champions Since 2018",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark-900 text-white antialiased">
        {/* Multi-tenant SaaS provider — wraps entire app */}
        <TenantProvider>
          {/* Auth provider — JWT session management */}
          <AuthProvider>
            {/* Language provider — AR/EN switching */}
            <LanguageProvider>
              {/* Breaking news ticker at the very top */}
              <NewsTicker />
              {/* Main navigation */}
              <Navbar />
              {/* Page content */}
              <main>{children}</main>
              {/* Footer */}
              <Footer />
            </LanguageProvider>
          </AuthProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
