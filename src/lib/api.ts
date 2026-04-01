/**
 * API Integration Layer — Cedars Sport Academy
 *
 * This file provides a centralized API client for all backend communication.
 * Currently uses mock/demo data. Replace BASE_URL and enable real fetches
 * when the SaaS backend is ready.
 *
 * Architecture: Multi-tenant SaaS ready.
 * Each request includes a tenant identifier (X-Tenant-ID header).
 */

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  sport?: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: "SUPER_ADMIN" | "ADMIN" | "COACH" | "PARENT" | "STUDENT";
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface TrialBookingData {
  parentName: string;
  childName: string;
  childAge: number;
  sport: string;
  location: string;
  preferredDate: string;
  phone: string;
  email: string;
}

// ─── HTTP Client ──────────────────────────────────────────────────────────────

/**
 * Base fetch wrapper with tenant headers and error handling.
 * All API calls go through this function.
 */
// Auth endpoints that should NOT send a stale token
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register"];

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Tenant-ID": TENANT_ID, // Multi-tenant SaaS header
    ...options.headers,
  };

  // Add auth token if available — skip for login/register to avoid stale token issues
  const isAuthEndpoint = AUTH_ENDPOINTS.some((e) => endpoint.startsWith(e));
  if (!isAuthEndpoint && typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      // Try to parse error body for a better message
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errBody = await response.json();
        if (errBody?.message) errorMessage = errBody.message;
      } catch {
        // ignore parse error
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    // Detect network-level failures (API server down) and surface a friendly message
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      const networkErr = new Error(
        "Unable to connect to the server. Please check your connection or try again later."
      );
      console.warn(`[API] ${endpoint} — server unreachable`);
      throw networkErr;
    }
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[API] ${endpoint} error: ${msg}`);
    throw error;
  }
}

// ─── Programs API ─────────────────────────────────────────────────────────────

export const programsApi = {
  /** Fetch all programs for this tenant */
  getAll: () => apiClient<unknown[]>("/programs"),

  /** Fetch a single program by slug */
  getBySlug: (slug: string) => apiClient<unknown>(`/programs/${slug}`),
};

// ─── Coaches API ──────────────────────────────────────────────────────────────

export const coachesApi = {
  getAll: () => apiClient<unknown[]>("/coaches"),
  getById: (id: string) => apiClient<unknown>(`/coaches/${id}`),
};

// ─── News API ─────────────────────────────────────────────────────────────────

export const newsApi = {
  getAll: () => apiClient<unknown[]>("/news"),
  getBySlug: (slug: string) => apiClient<unknown>(`/news/${slug}`),
  getFeatured: () => apiClient<unknown[]>("/news?featured=true"),
};

// ─── Gallery API ──────────────────────────────────────────────────────────────

export const galleryApi = {
  getAll: () => apiClient<unknown[]>("/gallery"),
  getByCategory: (category: string) =>
    apiClient<unknown[]>(`/gallery?category=${category}`),
};

// ─── Locations API ────────────────────────────────────────────────────────────

export const locationsApi = {
  getAll: () => apiClient<unknown[]>("/locations"),
  getById: (id: string) => apiClient<unknown>(`/locations/${id}`),
};

// ─── Contact API ──────────────────────────────────────────────────────────────

export const contactApi = {
  /** Submit contact form */
  submit: (data: ContactFormData) =>
    apiClient<{ ticketId: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  /** Register a new parent/athlete account */
  register: (data: RegisterFormData) =>
    apiClient<{ token: string; user: unknown }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Login with email and password */
  login: (data: LoginFormData) =>
    apiClient<{ token: string; user: unknown }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Logout and invalidate token */
  logout: () =>
    apiClient<void>("/auth/logout", { method: "POST" }),
};

// ─── Trial Booking API ────────────────────────────────────────────────────────

export const bookingApi = {
  /** Book a free trial session */
  bookTrial: (data: TrialBookingData) =>
    apiClient<{ bookingId: string; confirmationCode: string }>("/bookings/trial", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Schedules API ────────────────────────────────────────────────────────────

export const schedulesApi = {
  /** Coach: get my schedules (filtered by logged-in coach's programs) */
  getMyCoach: () => apiClient<unknown[]>("/schedules/my-coach"),
  /** Student: get my schedules (filtered by active enrollments) */
  getMyStudent: () => apiClient<unknown[]>("/schedules/my-student"),
  /** Parent: get schedules for all my children, grouped by child */
  getMyChildren: () => apiClient<unknown>("/schedules/my-children"),
  /** Admin: get all schedules for tenant */
  getAll: () => apiClient<unknown[]>("/schedules"),
  create: (data: unknown) =>
    apiClient<unknown>("/schedules", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: unknown) =>
    apiClient<unknown>(`/schedules/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) =>
    apiClient<unknown>(`/schedules/${id}`, { method: "DELETE" }),
};

// ─── Students API ─────────────────────────────────────────────────────────────

export const attendanceApi = {
  /** Coach/Admin: list attendance records (supports query params) */
  getAll: (params?: { coachId?: string; studentId?: string; scheduleId?: string }) => {
    const q = new URLSearchParams();
    if (params?.coachId) q.set("coachId", params.coachId);
    if (params?.studentId) q.set("studentId", params.studentId);
    if (params?.scheduleId) q.set("scheduleId", params.scheduleId);
    return apiClient<unknown[]>(`/attendance${q.toString() ? `?${q.toString()}` : ""}`);
  },
};

export const studentsApi = {
  /** Parent: list all my children with enrollments + attendance + schedules */
  getMyChildren: () => apiClient<unknown>("/students/my-children"),

  /** Parent: add a child (parentId auto-set from JWT on the server) */
  addChild: (data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    photo?: string;
    nationality?: string;
    bloodType?: string;
    medicalNotes?: string;
    school?: string;
    medicalCardNumber?: string;
    medicalCardPhoto?: string;
  }) =>
    apiClient<unknown>("/students/add-child", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Parent: update their own child's details */
  updateMyChild: (id: string, data: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    photo?: string;
    nationality?: string;
    bloodType?: string;
    medicalNotes?: string;
    school?: string;
    medicalCardNumber?: string;
    medicalCardPhoto?: string;
  }) =>
    apiClient<unknown>(`/students/my-children/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /** Parent: enroll their child in a program */
  enrollMyChild: (childId: string, programId: string) =>
    apiClient<unknown>(`/students/my-children/${childId}/enroll`, {
      method: "POST",
      body: JSON.stringify({ programId }),
    }),

  /** Parent: unenroll their child from a program */
  unenrollMyChild: (childId: string, enrollmentId: string) =>
    apiClient<unknown>(`/students/my-children/${childId}/enrollments/${enrollmentId}`, {
      method: "DELETE",
    }),

  /** Admin: get students with sessionsRemaining <= 2 (expiring soon) */
  getExpiring: () => apiClient<unknown[]>("/students/expiring"),

  /** Admin: list all students */
  getAll: (programId?: string) =>
    apiClient<unknown[]>(`/students${programId ? `?programId=${programId}` : ""}`),
  /** Admin: create student */
  create: (data: unknown) =>
    apiClient<unknown>("/students", { method: "POST", body: JSON.stringify(data) }),
  /** Admin: update student */
  update: (id: string, data: unknown) =>
    apiClient<unknown>(`/students/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  /** Admin: delete student */
  remove: (id: string) =>
    apiClient<unknown>(`/students/${id}`, { method: "DELETE" }),

  /** Coach: set a persistent note on a student */
  updateCoachNote: (studentId: string, note: string) =>
    apiClient<unknown>(`/students/${studentId}/coach-note`, {
      method: "PATCH",
      body: JSON.stringify({ note }),
    }),
};

// ─── Admin Locations API ──────────────────────────────────────────────────────

export const adminLocationsApi = {
  getAll: () => apiClient<unknown[]>("/locations"),
  create: (data: unknown) =>
    apiClient<unknown>("/locations", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: unknown) =>
    apiClient<unknown>(`/locations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) =>
    apiClient<unknown>(`/locations/${id}`, { method: "DELETE" }),
};

// ─── Achievements API ─────────────────────────────────────────────────────────

export const achievementsApi = {
  getAll: () => apiClient<unknown[]>("/achievements"),
};

// ─── Coach Sessions API ───────────────────────────────────────────────────────

export const coachSessionsApi = {
  /** COACH: start a new class session */
  startSession: (dto: { scheduleId: string; date: string; notes?: string; className: string }) =>
    apiClient<unknown>("/coach-sessions", { method: "POST", body: JSON.stringify(dto) }),

  /** COACH: list my sessions (most recent first, excludes completed) */
  getMy: () => apiClient<unknown[]>("/coach-sessions/my"),

  /** COACH: mark a session as completed — removes it from the active list */
  completeSession: (sessionId: string) =>
    apiClient<unknown>(`/coach-sessions/${sessionId}/complete`, { method: "PATCH" }),

  /** COACH: get all students enrolled in my programs */
  getMyStudents: () => apiClient<unknown[]>("/coach-sessions/my-students"),

  /** COACH: get full profile + attendance history for a specific student */
  getStudentDetail: (studentId: string) =>
    apiClient<unknown>(`/coach-sessions/my-students/${studentId}`),

  /** COACH: get session roster with existing attendance values */
  getRoster: (sessionId: string) =>
    apiClient<unknown>(`/coach-sessions/${sessionId}/roster`),

  /** COACH: submit bulk attendance for a session */
  submitAttendance: (
    sessionId: string,
    records: Array<{
      studentId: string;
      status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
      performanceRating?: number;
      notes?: string;
      isInjured?: boolean;
      injuryNote?: string;
    }>
  ) =>
    apiClient<unknown>(`/coach-sessions/${sessionId}/attendance`, {
      method: "POST",
      body: JSON.stringify({ records }),
    }),
};

// ─── Tenant Config API ────────────────────────────────────────────────────────

export const tenantApi = {
  /** Fetch tenant-specific branding and config */
  getConfig: () =>
    apiClient<{
      name: string;
      logo: string;
      primaryColor: string;
      secondaryColor: string;
      domain: string;
    }>("/tenant/config"),
};

// ─── Payments API ─────────────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: () => apiClient<unknown[]>("/notifications"),
  getUnreadCount: () => apiClient<{ count: number }>("/notifications/unread-count"),
  markRead: (id: string) =>
    apiClient<unknown>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    apiClient<unknown>("/notifications/mark-all-read", { method: "PATCH" }),
};

// ─── Payments API ─────────────────────────────────────────────────────────────

export const paymentsApi = {
  /** ADMIN/SUPER_ADMIN: list payments */
  getAll: (filter?: string, studentId?: string, method?: string) => {
    const q = new URLSearchParams();
    if (filter && filter !== "ALL") q.set("filter", filter.toLowerCase());
    if (studentId) q.set("studentId", studentId);
    if (method && method !== "ALL") q.set("method", method);
    return apiClient<unknown[]>(`/payments${q.toString() ? `?${q.toString()}` : ""}`);
  },

  /** ADMIN/SUPER_ADMIN: mark payment paid */
  markPaid: (id: string) =>
    apiClient<unknown>(`/payments/${id}/mark-paid`, { method: "PATCH" }),

  /** PARENT: pay for a single child (CASH or CARD) */
  payForChild: (dto: { studentId: string; method: "CASH" | "CARD"; programId?: string }) =>
    apiClient<{
      success: boolean;
      paymentId: string;
      status: string;
      method: string;
      transactionId: string;
      amount: number;
      currency: string;
      message: string;
    }>("/payments/pay-child", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** PARENT: pay for all enrolled children at once */
  payForAllChildren: (dto: { method: "CASH" | "CARD" }) =>
    apiClient<{
      success: boolean;
      childrenPaid: number;
      totalAmount: number;
      currency: string;
      method: string;
      results: Array<{
        success: boolean;
        paymentId: string;
        status: string;
        method: string;
        transactionId: string;
        amount: number;
        currency: string;
        message: string;
      }>;
    }>("/payments/pay-all", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** PARENT: get children subscription status */
  getMySubscriptions: () =>
    apiClient<{
      children: Array<{
        studentId: string;
        firstName: string;
        lastName: string;
        enrollments: Array<{
          enrollmentId: string;
          programId: string;
          programName: string;
          totalSessions: number;
          sessionsRemaining: number;
        }>;
        latestPayment: {
          paymentId: string;
          status: string;
          method: string;
          amount: number;
          paidAt: string | null;
          createdAt: string;
        } | null;
        subscriptionStatus: string;
      }>;
      pricing: {
        activeChildrenCount: number;
        singleChildRate: number;
        multiChildRate: number;
        pricePerChild: number;
        totalAmount: number;
        currency: string;
      };
    }>("/payments/my-subscriptions"),

  /** PARENT: sandbox pay (legacy) */
  sandboxPay: (dto: { studentId: string; programId?: string; simulateFailure?: boolean }) =>
    apiClient<unknown>("/payments/sandbox-pay", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** PARENT: my payment history */
  getMyPayments: () => apiClient<unknown[]>("/payments/my"),

  /** PARENT: get subscription pricing (based on active enrolled children count) */
  getMyPricing: () =>
    apiClient<{
      activeChildrenCount: number;
      singleChildRate: number;
      multiChildRate: number;
      pricePerChild: number;
      totalAmount: number;
      currency: string;
    }>("/payments/my-pricing"),

  /** ADMIN/SUPER_ADMIN: pricing rules */
  getPricingRules: () =>
    apiClient<{ singleChildQar: number; multiChildQar: number }>("/payments/pricing-rules"),

  /** ADMIN/SUPER_ADMIN: update pricing rules */
  updatePricingRules: (dto: { singleChildQar: number; multiChildQar: number }) =>
    apiClient<{ singleChildQar: number; multiChildQar: number }>("/payments/pricing-rules", {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
};
