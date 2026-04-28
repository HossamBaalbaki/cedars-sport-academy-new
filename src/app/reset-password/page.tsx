"use client";

export const dynamic = "force-dynamic";

/**
 * Reset Password Page — Cedars Sport Academy.
 * Reads token from URL query params and resets the user's password.
 */

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!token) {
      setFormError("Invalid reset link. Please request a new one.");
      return;
    }
    if (!password || !confirmPassword) {
      setFormError("Please fill in both password fields.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setFormError("Invalid or expired reset link. Please request a new one.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="glass-card p-8">
      <h1 className="text-2xl font-black text-white mb-2">Set New Password</h1>
      <p className="text-white/50 text-sm mb-8">
        Enter your new password below. Make sure it&apos;s at least 8 characters.
      </p>

      {/* Success message */}
      {success && (
        <div className="mb-4 p-3 rounded-xl bg-lebanon-green/20 border border-lebanon-green/40 text-lebanon-green text-sm">
          ✅ Password reset successful! Redirecting to login…
        </div>
      )}

      {/* Error message */}
      {formError && !success && (
        <div className="mb-4 p-3 rounded-xl bg-lebanon-red/20 border border-lebanon-red/40 text-red-400 text-sm">
          ⚠️ {formError}
        </div>
      )}

      {!success && (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-white/60 text-sm mb-1.5">New Password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1.5">Confirm New Password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-lebanon-green hover:bg-cedar-600 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-900/30 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Resetting…
              </>
            ) : (
              "Reset Password →"
            )}
          </button>
        </form>
      )}

      {/* Back to login */}
      <p className="text-center text-white/40 text-sm mt-6">
        <Link href="/login" className="text-lebanon-green hover:underline font-medium">
          ← Back to Login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-lebanon-green/5 via-transparent to-lebanon-red/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-lebanon-green/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lebanon-green to-cedar-700 flex items-center justify-center text-3xl shadow-xl">
              🌲
            </div>
            <div className="text-white font-bold text-xl">Cedars Sport Academy</div>
            <div className="text-lebanon-green text-sm">Member Portal</div>
          </Link>
        </div>

        {/* Suspense required for useSearchParams() in Next.js App Router */}
        <Suspense fallback={
          <div className="glass-card p-8 flex items-center justify-center">
            <span className="w-6 h-6 border-2 border-lebanon-green border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
