"use client";

export const dynamic = "force-dynamic";

/**
 * Forgot Password Page — Cedars Sport Academy.
 * Sends a password reset email via the NestJS API.
 */

import { useState, FormEvent } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!email) {
      setFormError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

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

        {/* Card */}
        <div className="glass-card p-8">
          <h1 className="text-2xl font-black text-white mb-2">Forgot Password?</h1>
          <p className="text-white/50 text-sm mb-8">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-lebanon-green/20 border border-lebanon-green/40 text-lebanon-green text-sm">
              ✅ If your email is registered, you will receive a reset link shortly.
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
                <label className="block text-white/60 text-sm mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Sending…
                  </>
                ) : (
                  "Send Reset Link →"
                )}
              </button>
            </form>
          )}

          {/* Back to login */}
          <p className="text-center text-white/40 text-sm mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-lebanon-green hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>

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
