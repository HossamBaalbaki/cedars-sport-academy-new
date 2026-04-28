/**
 * Public API helpers (server-safe) for public pages.
 * Uses tenant header and graceful fallbacks for SSR pages.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT_ID =
  process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface WrappedResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

async function fetchPublic<T>(endpoint: string): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": TENANT_ID,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed ${endpoint}: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as WrappedResponse<T>;
    return json.data;
  } catch (error) {
    // Use console.warn (not console.error) — Next.js dev overlay intercepts
    // console.error from server components and shows it as an error overlay,
    // even when the error is gracefully handled with a fallback return value.
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[Public API] ${endpoint} unavailable: ${msg}`);
    throw error;
  }
}

export type PublicProgram = {
  id: string;
  slug: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  icon?: string | null;
  image?: string | null;
  level?: string | null;
  price?: number | null;
  maxStudents?: number | null;
  isActive?: boolean;
  ageGroup?: { name?: string | null } | null;
  schedules?: Array<{ dayOfWeek: number; startTime: string; endTime: string }> | null;
  _count?: { enrollments?: number };
};

export type PublicCoach = {
  id: string;
  bio?: string | null;
  bioAr?: string | null;
  experience?: number | null;
  certifications?: string[] | null;
  featured?: boolean;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  } | null;
};

export type PublicGalleryItem = {
  id: string;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  imageUrl: string;
  category: string;
  isFeatured?: boolean;
  sortOrder?: number;
  createdAt?: string;
};

export type PublicNewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  image?: string | null;
  category?: string | null;
  author?: string | null;
  isFeatured?: boolean;
  publishedAt?: string | null;
};

export type PublicAchievement = {
  id: string;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  icon?: string | null;
  category?: string | null;
  year?: number | null;
  isFeatured?: boolean;
};

export type PublicLocation = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  image?: string | null;
  isMain?: boolean;
  isActive?: boolean;
  // Extended fields (may not be in API, used as optional UI extras)
  sports?: string[];
  facilities?: string[];
  schedule?: Array<{ day: string; hours: string }>;
};

export async function getPrograms(): Promise<PublicProgram[]> {
  try {
    return await fetchPublic<PublicProgram[]>("/programs");
  } catch {
    return [];
  }
}

export async function getCoaches(): Promise<PublicCoach[]> {
  try {
    return await fetchPublic<PublicCoach[]>("/coaches");
  } catch {
    return [];
  }
}

export async function getGallery(): Promise<PublicGalleryItem[]> {
  try {
    return await fetchPublic<PublicGalleryItem[]>("/gallery");
  } catch {
    return [];
  }
}

export async function getNews(): Promise<PublicNewsItem[]> {
  try {
    return await fetchPublic<PublicNewsItem[]>("/news");
  } catch {
    return [];
  }
}

export async function getNewsBySlug(slug: string): Promise<PublicNewsItem | null> {
  try {
    return await fetchPublic<PublicNewsItem>(`/news/slug/${slug}`);
  } catch {
    return null;
  }
}

export async function getAchievements(): Promise<PublicAchievement[]> {
  try {
    return await fetchPublic<PublicAchievement[]>("/achievements");
  } catch {
    return [];
  }
}

export async function getLocations(): Promise<PublicLocation[]> {
  try {
    return await fetchPublic<PublicLocation[]>("/locations");
  } catch {
    return [];
  }
}
