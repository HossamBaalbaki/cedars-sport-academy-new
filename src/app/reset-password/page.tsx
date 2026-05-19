"use client";

export const dynamic = "force-dynamic";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";

function strength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair",   color: "bg-orange-400" };
  if (score <= 3) return { score, label: "Good",   color: "bg-yellow-400" };
  if (score <= 4) return { score, label: "Strong", color: "bg-lebanon-green" };
  return { score, label: "Very Strong", color: "bg-emerald-400" };
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw]               = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [formError, setFormError]         = useState<string | null>(null);
  const [success, setSuccess]             = useState(false);

  const pw = strength(password);

  const rules = [
    { ok: password.length >= 8,       text: "At least 8 characters" },
    { ok: /[A-Z]/.test(password),     text: "One uppercase letter" },
    { ok: /[0-9]/.test(password),     text: "One number" },
    { ok: /[^A-Za-z0-9]/.test(password), text: "One special character (!@#…)" },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!token) { setFormError("Invalid reset link. Please request a new one."); return; }
    if (!password || !confirmPassword) { setFormError("Please fill in both password fields."); return; }
    if (password.length < 8) { setFormError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setFormError("Passwords do not match."); return; }

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
      <p className="text-white/50 text-sm mb-6">Choose a strong password to keep your account secure.</p>

      {success && (
        <div className="mb-4 p-4 rounded-xl bg-lebanon-green/20 border border-lebanon-green/40 text-lebanon-green text-sm flex items-center gap-2">
          <span className="text-lg">✅</span>
          <span>Password reset successful! Redirecting to login…</span>
        </div>
      )}

      {formError && !success && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span>{formError}</span>
        </div>
      )}

      {!success && (
        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* New password */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors disabled:opacity-50"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                <EyeIcon open={showPw} />
              </button>
            </div>

            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pw.score ? pw.color : "bg-white/10"}`} />
                  ))}
                </div>
                <p className="text-xs text-white/40">{pw.label}</p>
              </div>
            )}

            {/* Rules checklist */}
            {password.length > 0 && (
              <ul className="mt-3 space-y-1">
                {rules.map(r => (
                  <li key={r.text} className={`flex items-center gap-2 text-xs transition-colors ${r.ok ? "text-lebanon-green" : "text-white/30"}`}>
                    <span>{r.ok ? "✓" : "○"}</span>
                    {r.text}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className={`w-full bg-dark-800 border rounded-xl px-4 py-3 pr-11 text-white placeholder-white/30 focus:outline-none transition-colors disabled:opacity-50 ${
                  confirmPassword.length > 0
                    ? password === confirmPassword
                      ? "border-lebanon-green/50"
                      : "border-red-500/50"
                    : "border-white/10 focus:border-lebanon-green/50"
                }`}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-lebanon-green hover:bg-lebanon-green/90 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-900/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting…</>
            ) : "Reset Password →"}
          </button>
        </form>
      )}

      <p className="text-center text-white/40 text-sm mt-6">
        <Link href="/login" className="text-lebanon-green hover:underline font-medium">← Back to Login</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-lebanon-green/5 via-transparent to-lebanon-red/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-lebanon-green/5 blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lebanon-green to-cedar-700 flex items-center justify-center text-3xl shadow-xl">🌲</div>
            <div className="text-white font-bold text-xl">Cedars Sport Academy</div>
            <div className="text-lebanon-green text-sm">Member Portal</div>
          </Link>
        </div>
        <Suspense fallback={
          <div className="glass-card p-8 flex items-center justify-center">
            <span className="w-6 h-6 border-2 border-lebanon-green border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
        <div className="text-center mt-6">
          <Link href="/" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
