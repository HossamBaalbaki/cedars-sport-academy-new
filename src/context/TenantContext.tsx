"use client";

/**
 * Tenant Context — Cedars Sport Academy (SaaS Multi-Tenant)
 *
 * Provides tenant-specific configuration (branding, colors, name, logo)
 * to the entire app. When the SaaS backend is ready, this will fetch
 * config from the API using the tenant slug from the domain/subdomain.
 *
 * Each academy (tenant) gets its own branding while sharing the same codebase.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  logo: string;
  primaryColor: string;   // e.g. "#00A651" (Lebanon green)
  secondaryColor: string; // e.g. "#EE161F" (Lebanon red)
  domain: string;
  phone: string;
  email: string;
  whatsapp: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  foundedYear: number;
  isActive: boolean;
}

// ─── Default Tenant Config (Cedars Sport Academy) ─────────────────────────────
const defaultTenantConfig: TenantConfig = {
  id: "tenant_cedars_001",
  slug: "cedars-sport-academy",
  name: "Cedars Sport Academy",
  nameAr: "أكاديمية سيدرز الرياضية",
  tagline: "Shaping Champions Since 2012",
  taglineAr: "نصنع الأبطال منذ 2012",
  logo: "/images/logo.png",
  primaryColor: "#00A651",   // Lebanon Cedar Green
  secondaryColor: "#EE161F", // Lebanon Flag Red
  domain: "cedarsacademy.lb",
  phone: "+961 9 123 456",
  email: "info@cedarsacademy.lb",
  whatsapp: "+96170123456",
  socialLinks: {
    instagram: "https://instagram.com/cedarsacademy",
    facebook: "https://facebook.com/cedarsacademy",
    twitter: "https://twitter.com/cedarsacademy",
    youtube: "https://youtube.com/@cedarsacademy",
    tiktok: "https://tiktok.com/@cedarsacademy",
  },
  foundedYear: 2012,
  isActive: true,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface TenantContextType {
  tenant: TenantConfig;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tenant, setTenant] = useState<TenantConfig>(defaultTenantConfig);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    /**
     * TODO (Backend Phase):
     * Detect tenant from subdomain or domain, then fetch config from API:
     *
     * const slug = window.location.hostname.split('.')[0];
     * const config = await tenantApi.getConfig(slug);
     * setTenant(config.data);
     *
     * For now, we use the default config above.
     */
    setIsLoading(false);
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

/** Hook to access tenant config in any component */
export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
