"use client";

export const dynamic = "force-dynamic";

/**
 * Login Page — Cedars Sport Academy member login.
 * Wired to live NestJS API via AuthContext.
 */

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email || !password) {
      setFormError("Please enter your email and password.");
      return;
    }

    try {
      await login(email, password);
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setFormError(msg);
    }
  }

  const displayError = formError || error;

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
          <h1 className="text-2xl font-black text-white mb-2">Welcome Back</h1>
          <p className="text-white/50 text-sm mb-8">
            Sign in to access your training dashboard, schedule, and progress.
          </p>

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-lebanon-green/20 border border-lebanon-green/40 text-lebanon-green text-sm">
              ✅ Login successful! Redirecting…
            </div>
          )}

          {/* Error message */}
          {displayError && !success && (
            <div className="mb-4 p-3 rounded-xl bg-lebanon-red/20 border border-lebanon-red/40 text-red-400 text-sm">
              ⚠️ {displayError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-white/60 text-sm mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="ahmad@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-white/60 text-sm">Password</label>
                <Link href="/forgot-password" className="text-lebanon-green text-xs hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full bg-lebanon-green hover:bg-cedar-600 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-900/30 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social Login Placeholders */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 text-white/60 hover:text-white text-sm py-3 rounded-xl transition-all duration-200"
            >
              <span>🔵</span> Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 text-white/60 hover:text-white text-sm py-3 rounded-xl transition-all duration-200"
            >
              <span>📘</span> Facebook
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center text-white/40 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-lebanon-green hover:underline font-medium">
              Register here
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
