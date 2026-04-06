/**
 * Programs Page — All sports programs at Cedars Sport Academy.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPrograms } from "@/lib/public-api";
import ProgramScheduleModal from "@/components/programs/ProgramScheduleModal";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore all sports programs at Cedars Sport Academy — Football, Basketball, Swimming, and Gymnastics for all ages.",
};

export const dynamic = "force-dynamic";

const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <div className="pt-28 min-h-screen bg-dark-900">
      {/* ── Page Header ── */}
      <section className="py-16 text-center">
        <div className="container-custom">
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            What We Offer
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-3 mb-4">
            Our Sports <span className="gradient-text">Programs</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Professional training programs for all ages and skill levels. From beginners to
            competitive athletes — we have a program for you.
          </p>
        </div>
      </section>

      {/* ── Programs List ── */}
      <section className="section-padding">
        <div className="container-custom space-y-16">
          {programs.length === 0 && (
            <div className="glass-card p-8 text-center text-white/60">
              No programs available right now. Please check back soon.
            </div>
          )}
          {programs.map((program, index) => (
            <div
              key={program.id}
              id={program.slug}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${
                index % 2 !== 0 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image */}
              <div className={`relative h-72 lg:h-96 rounded-2xl overflow-hidden ${index % 2 !== 0 ? "lg:order-2" : ""}`}>
                <Image
                  src={program.image || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80"}
                  alt={program.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
                <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-dark-900/80 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/10">
                  {program.icon || "🏅"}
                </div>
                <div className="absolute bottom-4 right-4 bg-lebanon-green text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                  {program.price ?? 0} QAR/mo
                </div>
              </div>

              {/* Content */}
              <div className={index % 2 !== 0 ? "lg:order-1" : ""}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-lebanon-green/10 border border-lebanon-green/20 text-lebanon-green text-xs font-semibold px-3 py-1 rounded-full">
                    {program.ageGroup?.name || "All Ages"}
                  </span>
                  <span className="text-white/30 text-xs">{program.level || "All Levels"}</span>
                </div>
                <h2 className="text-3xl font-black text-white mb-3">{program.name}</h2>
                <p className="text-white/60 leading-relaxed mb-6">
                  {program.description || "Professional coaching and structured training."}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Age Group", value: program.ageGroup?.name || "All Ages", icon: "👥" },
                    { label: "Duration", value: "60-90 min", icon: "⏱" },
                    {
                      label: "Schedule",
                      value: (
                        <ProgramScheduleModal
                          programName={program.name}
                          schedules={program.schedules || []}
                        />
                      ),
                      icon: "📅",
                    },
                    { label: "Coach", value: "Assigned by Academy", icon: "🏅" },
                  ].map((detail) => (
                    <div key={detail.label} className="glass-card p-3 flex items-center gap-2">
                      <span className="text-lg">{detail.icon}</span>
                      <div>
                        <div className="text-white/40 text-xs">{detail.label}</div>
                        <div className="text-white text-sm font-medium">{detail.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="mb-6">
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
                    What&apos;s Included
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {[
                      "Certified coaches",
                      "Performance tracking",
                      "Safe training environment",
                      "Competition-ready curriculum",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-white/70">
                        <span className="text-lebanon-green text-xs">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enrollment */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span>
                      Enrollment ({program._count?.enrollments ?? 0}/{program.maxStudents ?? 20} spots)
                    </span>
                    <span>
                      {Math.round(
                        (((program._count?.enrollments ?? 0) / Math.max(program.maxStudents ?? 20, 1)) * 100)
                      )}
                      % full
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-lebanon-green to-cedar-400 rounded-full"
                      style={{
                        width: `${
                          (((program._count?.enrollments ?? 0) / Math.max(program.maxStudents ?? 20, 1)) * 100)
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-900/30"
                >
                  🎯 Enroll Now — Free Trial
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-padding bg-dark-800/50">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Not Sure Which Program? <span className="gradient-text">Talk to Us</span>
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Our coaches will assess your child&apos;s interests and abilities and recommend the
            perfect program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200"
            >
              📞 Contact Us
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 border-2 border-white/20 hover:border-white/40 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200"
            >
              🎯 Book Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
