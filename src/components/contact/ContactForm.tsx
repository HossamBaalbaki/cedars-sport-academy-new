"use client";

import { useState } from "react";
import { contactApi } from "@/lib/api";

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.subject || !form.message) {
      setErrorMsg("Please fill in all required fields.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      await contactApi.submit({
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject,
        message: form.message,
      });
      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
      setErrorMsg("Failed to send message. Please try again or contact us directly.");
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-6">Send Us a Message</h2>

      {status === "success" && (
        <div className="mb-6 p-4 rounded-xl bg-lebanon-green/10 border border-lebanon-green/30 text-lebanon-green text-sm font-medium">
          ✅ Message sent successfully! We&apos;ll get back to you within 24 hours.
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-1.5">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Ahmad"
              required
              className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1.5">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Khalil"
              className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-1.5">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="ahmad@example.com"
            required
            className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-1.5">Phone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+961 70 123 456"
            className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-1.5">
            Subject <span className="text-red-400">*</span>
          </label>
          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
            className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lebanon-green/50 transition-colors"
          >
            <option value="">Select a subject</option>
            <option value="Book a Free Trial">Book a Free Trial</option>
            <option value="Program Information">Program Information</option>
            <option value="Pricing & Fees">Pricing &amp; Fees</option>
            <option value="Coach Application">Coach Application</option>
            <option value="Partnership Inquiry">Partnership Inquiry</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-1.5">
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={5}
            required
            placeholder="Tell us how we can help you..."
            className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-lebanon-green hover:bg-cedar-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-900/30"
        >
          {status === "loading" ? "Sending…" : "Send Message →"}
        </button>
      </form>
    </div>
  );
}
