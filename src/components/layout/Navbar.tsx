"use client";

/**
 * Navbar — Main navigation for Cedars Sport Academy.
 * Features: sticky scroll, mobile hamburger menu, AR/EN language toggle,
 * active link highlighting, and CTA button.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";

// Navigation links definition
const navLinks = [
  { href: "/",            label: "Home",         labelAr: "الرئيسية" },
  { href: "/about",       label: "About",        labelAr: "عن الأكاديمية" },
  { href: "/programs",    label: "Programs",     labelAr: "البرامج" },
  { href: "/coaches",     label: "Coaches",      labelAr: "المدربون" },
  { href: "/locations",   label: "Locations",    labelAr: "المواقع" },
  { href: "/achievements",label: "Achievements", labelAr: "الإنجازات" },
  { href: "/gallery",     label: "Gallery",      labelAr: "المعرض" },
  { href: "/news",        label: "News",         labelAr: "الأخبار" },
  { href: "/contact",     label: "Contact",      labelAr: "اتصل بنا" },
];

// Helper: get role-based dashboard route
function getDashboardRoute(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/dashboard/admin";
    case "COACH":
      return "/dashboard/coach";
    case "STUDENT":
      return "/dashboard/student";
    default:
      return "/dashboard";
  }
}

export default function Navbar() {
  const [isScrolled, setIsScrolled]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname  = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { tenant } = useTenant();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Detect scroll to apply background blur
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-dark-900/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-white/5"
          : "bg-transparent"
      }`}
      // Offset for the news ticker above
      style={{ top: "44px" }}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src={tenant.logo}
              alt={tenant.name}
              className="h-40 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* ── Desktop Navigation ── */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-lebanon-green bg-lebanon-green/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t(link.label, link.labelAr)}
                </Link>
              );
            })}
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm font-medium transition-all duration-200"
              aria-label="Toggle language"
            >
              <span className="text-base">{language === "en" ? "🇱🇧" : "🇬🇧"}</span>
              <span>{language === "en" ? "عربي" : "EN"}</span>
            </button>

            {/* Auth Buttons — show based on auth state */}
            {!isLoading && (
              isAuthenticated && user ? (
                /* ── Logged-in user menu ── */
                <div className="hidden md:flex items-center gap-2 relative">
                  {/* Dashboard shortcut */}
                  <Link
                    href={getDashboardRoute(user.role)}
                    className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                  >
                    <span>🏠</span>
                    {t("Dashboard", "لوحة التحكم")}
                  </Link>

                  {/* User avatar + dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 bg-lebanon-green/10 border border-lebanon-green/30 hover:border-lebanon-green/60 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                    >
                      <div className="w-6 h-6 rounded-full bg-lebanon-green flex items-center justify-center text-xs font-bold text-white">
                        {user.firstName.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[100px] truncate">{user.firstName}</span>
                      <span className="text-white/40 text-xs">{userMenuOpen ? "▲" : "▼"}</span>
                    </button>

                    {/* Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-white text-sm font-semibold">{user.firstName} {user.lastName}</p>
                          <p className="text-white/40 text-xs truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-xs bg-lebanon-green/20 text-lebanon-green px-2 py-0.5 rounded-full">
                            {user.role}
                          </span>
                        </div>
                        <Link
                          href={getDashboardRoute(user.role)}
                          className="flex items-center gap-2 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
                        >
                          <span>📊</span> {t("Dashboard", "لوحة التحكم")}
                        </Link>
                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-lebanon-red hover:bg-lebanon-red/10 text-sm transition-colors"
                        >
                          <span>🚪</span> {t("Logout", "تسجيل الخروج")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ── Guest buttons ── */
                <>
                  <Link
                    href="/register"
                    className="hidden md:inline-flex items-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-900/30"
                  >
                    {t("Join Now", "انضم الآن")}
                  </Link>
                  <Link
                    href="/login"
                    className="hidden md:inline-flex items-center text-white/60 hover:text-white text-sm font-medium transition-colors"
                  >
                    {t("Login", "تسجيل الدخول")}
                  </Link>
                </>
              )
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMobileOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMobileOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileOpen ? "max-h-screen pb-6" : "max-h-0"
          }`}
        >
          <div className="bg-dark-800/95 backdrop-blur-md rounded-2xl mt-2 p-4 border border-white/10">
            {/* Mobile nav links */}
            <div className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-lebanon-green bg-lebanon-green/10"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {t(link.label, link.labelAr)}
                  </Link>
                );
              })}
            </div>

            {/* Mobile actions */}
            <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
              {!isLoading && (
                isAuthenticated && user ? (
                  <>
                    {/* Logged-in mobile: user info + dashboard + logout */}
                    <div className="px-4 py-3 bg-white/5 rounded-xl mb-1">
                      <p className="text-white text-sm font-semibold">{user.firstName} {user.lastName}</p>
                      <p className="text-white/40 text-xs">{user.email}</p>
                      <span className="inline-block mt-1 text-xs bg-lebanon-green/20 text-lebanon-green px-2 py-0.5 rounded-full">
                        {user.role}
                      </span>
                    </div>
                    <Link
                      href={getDashboardRoute(user.role)}
                      className="w-full text-center bg-lebanon-green hover:bg-cedar-600 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all duration-200"
                    >
                      📊 {t("Dashboard", "لوحة التحكم")}
                    </Link>
                    <button
                      onClick={() => { setIsMobileOpen(false); logout(); }}
                      className="w-full text-center border border-lebanon-red/40 text-lebanon-red hover:bg-lebanon-red/10 text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200"
                    >
                      🚪 {t("Logout", "تسجيل الخروج")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="w-full text-center bg-lebanon-green hover:bg-cedar-600 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all duration-200"
                    >
                      {t("Join Now — Free Trial", "انضم الآن — تجربة مجانية")}
                    </Link>
                    <Link
                      href="/login"
                      className="w-full text-center border border-white/20 text-white/70 hover:text-white text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200"
                    >
                      {t("Login", "تسجيل الدخول")}
                    </Link>
                  </>
                )
              )}
              {/* Language toggle mobile */}
              <button
                onClick={toggleLanguage}
                className="w-full text-center border border-white/20 text-white/70 hover:text-white text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200"
              >
                {language === "en" ? "🇱🇧 عربي" : "🇬🇧 English"}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
