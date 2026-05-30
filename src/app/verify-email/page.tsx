"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API    = process.env.NEXT_PUBLIC_API_URL   || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "";

type Status = "loading" | "success" | "error";

function getDashboardRoute(role: string) {
  switch (role) {
    case "ADMIN":
    case "SUPER_ADMIN": return "/dashboard/admin";
    case "COACH":       return "/dashboard/coach";
    default:            return "/dashboard";
  }
}

// ── Inner component — uses useSearchParams ─────────────────────────────────
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token");

  const [status,  setStatus]  = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please use the link from your email.");
      return;
    }

    fetch(`${API}/auth/verify-email?token=${encodeURIComponent(token)}`, {
      headers: { "X-Tenant-ID": TENANT },
    })
      .then(async (res) => {
        const body = await res.json();
        if (res.ok && body.data?.token) {
          // Auto-login: store session exactly as the login flow does
          const jwt  = body.data.token;
          const user = body.data.user;

          localStorage.setItem("auth_token", jwt);
          localStorage.setItem("auth_user",  JSON.stringify(user));
          document.cookie = `auth_token=${jwt}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

          setStatus("success");
          setMessage(`Welcome, ${user.firstName}! Your email is verified.`);

          // Redirect to dashboard after a brief moment
          setTimeout(() => {
            router.push(getDashboardRoute(user.role));
          }, 1800);
        } else {
          setStatus("error");
          setMessage(body.message || "Invalid or expired verification link.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, [token, router]);

  return (
    <div className="glass-card p-8 text-center">
      {status === "loading" && (
        <>
          <div className="w-12 h-12 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Verifying your email…</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-black text-white mb-3">Email Verified!</h1>
          <p className="text-white/60 text-sm mb-2 leading-relaxed">{message}</p>
          <p className="text-lebanon-green text-xs">Taking you to your dashboard…</p>
          <div className="mt-4 w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin mx-auto" />
        </>
      )}

      {status === "error" && (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-black text-white mb-3">Verification Failed</h1>
          <p className="text-white/60 text-sm mb-6 leading-relaxed">{message}</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Register Again
            </Link>
            <Link href="/login" className="text-white/40 hover:text-white text-sm transition-colors">
              Already verified? Log in →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// ── Page: Suspense wrapper required for useSearchParams ────────────────────
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-lebanon-green/5 via-transparent to-lebanon-red/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="inline-flex flex-col items-center gap-2 mb-8 w-full">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lebanon-green to-cedar-700 flex items-center justify-center text-3xl shadow-xl">
            🌲
          </div>
          <div className="text-white font-bold text-xl">Cedars Sport Academy</div>
        </Link>

        <Suspense
          fallback={
            <div className="glass-card p-8 text-center">
              <div className="w-12 h-12 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60">Loading…</p>
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
