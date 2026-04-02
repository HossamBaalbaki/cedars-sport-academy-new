"use client";

export const dynamic = "force-dynamic";

/**
 * Register Page — New member registration for Cedars Sport Academy.
 * Wired to live NestJS API via AuthContext.
 */

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [role, setRole] = useState<"PARENT" | "STUDENT">("PARENT");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!firstName || !lastName || !email || !password) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (!termsAccepted) {
      setFormError("You must accept the Terms of Service to continue.");
      return;
    }

    try {
      await register(firstName, lastName, email, password, phone || undefined, role);
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      setFormError(msg);
    }
  }

  const displayError = formError || error;

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-lebanon-green/5 via-transparent to-lebanon-red/5 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-lebanon-red/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lebanon-green to-cedar-700 flex items-center justify-center text-3xl shadow-xl">
              🌲
            </div>
            <div className="text-white font-bold text-xl">Cedars Sport Academy</div>
            <div className="text-lebanon-green text-sm">Free Trial Registration</div>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h1 className="text-2xl font-black text-white mb-2">Start Your Journey</h1>
          <p className="text-white/50 text-sm mb-8">
            Register for a free trial session. No commitment required — just come and experience
            the Cedars difference.
          </p>

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-lebanon-green/20 border border-lebanon-green/40 text-lebanon-green text-sm">
              ✅ Registration successful! Redirecting to your dashboard…
            </div>
          )}

          {/* Error message */}
          {displayError && !success && (
            <div className="mb-4 p-3 rounded-xl bg-lebanon-red/20 border border-lebanon-red/40 text-red-400 text-sm">
              ⚠️ {displayError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-1.5">First Name *</label>
                <input
                  type="text"
                  placeholder="name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1.5">Last Name *</label>
                <input
                  type="text"
                  placeholder="Surname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-white/60 text-sm mb-1.5">Email Address *</label>
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

            {/* Phone */}
            <div>
              <label className="block text-white/60 text-sm mb-1.5">Phone Number</label>
              <input
                type="tel"
                placeholder="+974 00 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors disabled:opacity-50"
              />
            </div>

            {/* Sport & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-1.5">Interested Sport</label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lebanon-green/50 transition-colors disabled:opacity-50"
                >
                  <option value="">Select sport</option>
                  <option>Football</option>
                  <option>Basketball</option>
                  <option>Swimming</option>
                  <option>Gymnastics</option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1.5">Preferred Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lebanon-green/50 transition-colors disabled:opacity-50"
                >
                  <option value="">Select location</option>
                  <option>Al Rayyan  (Main Campus)</option>
                  <option>Um Slal</option>
                  <option>Al Markheya</option>
                </select>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-white/60 text-sm mb-1.5">Experience Level</label>
              <div className="grid grid-cols-3 gap-2">
                {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                  <label
                    key={lvl}
                    className={`flex items-center justify-center gap-2 border rounded-xl py-2.5 cursor-pointer transition-all duration-200 text-sm ${
                      level === lvl
                        ? "border-lebanon-green/60 text-white bg-lebanon-green/10"
                        : "border-white/10 hover:border-lebanon-green/40 text-white/60 hover:text-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="level"
                      value={lvl}
                      checked={level === lvl}
                      onChange={() => setLevel(lvl)}
                      className="accent-lebanon-green"
                    />
                    {lvl}
                  </label>
                ))}
              </div>
            </div>

            {/* Account Role */}
            <div>
              <label className="block text-white/60 text-sm mb-1.5">Account Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "PARENT", label: "Parent" },
                  { value: "STUDENT", label: "Student" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className={`flex items-center justify-center gap-2 border rounded-xl py-2.5 cursor-pointer transition-all duration-200 text-sm ${
                      role === item.value
                        ? "border-lebanon-green/60 text-white bg-lebanon-green/10"
                        : "border-white/10 hover:border-lebanon-green/40 text-white/60 hover:text-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={item.value}
                      checked={role === item.value}
                      onChange={() => setRole(item.value as "PARENT" | "STUDENT")}
                      className="accent-lebanon-green"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-white/40 mt-2">
                Parents can manage children and sessions. Students get their personal dashboard.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/60 text-sm mb-1.5">Create Password *</label>
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

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
                className="w-4 h-4 mt-0.5 rounded border-white/20 bg-dark-800 accent-lebanon-green flex-shrink-0"
              />
              <label htmlFor="terms" className="text-white/50 text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-lebanon-green hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-lebanon-green hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full bg-lebanon-green hover:bg-cedar-600 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-900/30 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering…
                </>
              ) : (
                "🎯 Register for Free Trial"
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{" "}
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
