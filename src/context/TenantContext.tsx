 "use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
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

const defaultTenantConfig: TenantConfig = {
  id: 'tenant_cedars_001',
  slug: 'cedars-sport-academy',
  name: 'Cedars Sport Academy',
  nameAr: 'أكاديمية سيدرز الرياضية',
  tagline: 'Shaping Champions Since 2018',
  taglineAr: 'نصنع الأبطال منذ 2018',
  logo: '/images/logo.png', // Your real logo - confirmed
  primaryColor: '#00A651',
  secondaryColor: '#EE161F',
  domain: 'cedars.com',
  phone: '+97439953996',
  email: 'info@cedars.com',
  whatsapp: '+97439953996',
  socialLinks: {
    instagram: 'https://www.instagram.com/csa_qr/',
    facebook: 'https://www.facebook.com/cedarssportacademy/',

    tiktok: 'https://tiktok.com/@cedarsacademy',
  },
  foundedYear: 2018,
  isActive: true,
};

interface TenantContextType {
  tenant: TenantConfig;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig>(defaultTenantConfig);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

