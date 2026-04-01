/**
 * Locations Page — All Cedars Sport Academy locations.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLocations } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Locations",
  description:
    "Find Cedars Sport Academy near you. 3 locations across Doha — al Rayyan ,Um salal, and al Sad.",
};

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <div className="pt-28 min-h-screen bg-dark-900">
      {/* ── Header ── */}
      <section className="py-16 text-center">
        <div className="container-custom">
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            Find Us
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-3 mb-4">
            Our <span className="gradient-text">Locations</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            3 state-of-the-art facilities across Lebanon. Find the one closest to you and
            start your athletic journey today.
          </p>
        </div>
      </section>

      {/* ── Locations List ── */}
      <section className="section-padding">
        <div className="container-custom space-y-12">
          {locations.length === 0 && (
            <div className="glass-card p-8 text-center text-white/60">
              No locations available right now. Please check back soon.
            </div>
          )}
          {locations.map((location, index) => (
            <div
              key={location.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-start ${
                index % 2 !== 0 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image */}
              <div className={`relative h-72 rounded-2xl overflow-hidden ${index % 2 !== 0 ? "lg:order-2" : ""}`}>
                <Image
                  src={location.image || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"}
                  alt={location.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
                {location.isMain && (
                  <div className="absolute top-4 left-4 bg-lebanon-green text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    🏠 Main Campus
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={index % 2 !== 0 ? "lg:order-1" : ""}>
                <h2 className="text-3xl font-black text-white mb-2">{location.name}</h2>
                <p className="text-lebanon-green font-medium mb-1">{location.city}</p>
                <p className="text-white/50 text-sm mb-6">{location.address}</p>

                {/* Sports Available */}
                {location.sports && location.sports.length > 0 && (
                  <div className="mb-6">
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
                      Sports Available
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {location.sports.map((sport: string) => (
                        <span
                          key={sport}
                          className="bg-lebanon-green/10 border border-lebanon-green/20 text-lebanon-green text-xs px-3 py-1 rounded-full"
                        >
                          {sport}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facilities */}
                {location.facilities && location.facilities.length > 0 && (
                  <div className="mb-6">
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
                      Facilities
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {location.facilities.map((facility: string) => (
                        <div
                          key={facility}
                          className="flex items-center gap-2 text-white/60 text-xs"
                        >
                          <span className="text-lebanon-green">✓</span> {facility}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Schedule */}
                {location.schedule && location.schedule.length > 0 && (
                  <div className="mb-6">
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
                      Opening Hours
                    </div>
                    <div className="space-y-1">
                      {location.schedule.map((s: { day: string; hours: string }) => (
                        <div key={s.day} className="flex justify-between text-sm">
                          <span className="text-white/60">{s.day}</span>
                          <span className="text-white font-medium">{s.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200"
                >
                  🎯 Book Trial at This Location
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
