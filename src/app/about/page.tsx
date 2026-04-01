/**
 * About Page — Cedars Sport Academy
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Cedars Sport Academy — Lebanon's premier sports academy founded in 2012. Our mission, vision, values, and story.",
};

const milestones = [
  { year: "2012", event: "Academy founded in Jounieh with 50 athletes", eventAr: "تأسست الأكاديمية في جونية مع 50 رياضياً" },
  { year: "2014", event: "Opened second location in Beirut", eventAr: "افتتاح الموقع الثاني في بيروت" },
  { year: "2016", event: "First national championship title in Football", eventAr: "أول لقب بطولة وطنية في كرة القدم" },
  { year: "2018", event: "Launched Swimming & Gymnastics programs", eventAr: "إطلاق برامج السباحة والجمباز" },
  { year: "2019", event: "Reached 500+ enrolled athletes", eventAr: "وصلنا إلى أكثر من 500 رياضي مسجل" },
  { year: "2021", event: "Opened third location in Zahle", eventAr: "افتتاح الموقع الثالث في زحلة" },
  { year: "2022", event: "10-year anniversary — 1,000+ athletes milestone", eventAr: "الذكرى العاشرة — إنجاز 1000+ رياضي" },
  { year: "2024", event: "Launched SaaS platform for multi-academy management", eventAr: "إطلاق منصة SaaS لإدارة الأكاديميات المتعددة" },
];

export default function AboutPage() {
  return (
    <div className="pt-28 min-h-screen bg-dark-900">
      {/* ── Hero ── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80"
            alt="About Cedars Sport Academy"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 to-dark-900" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            Our Story
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-3 mb-6">
            About{" "}
            <span className="gradient-text">Cedars Academy</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            CEDARS Sports Academy was founded in 2018 with the goal to find and develop the best young male and female Athletes. Also, providing Fitness courses and sports activities for the adult.
          </p>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🎯",
                title: "Our Mission",
                text: "To develop well-rounded athletes through professional coaching, discipline, and a love for sport — while building character and community.",
              },
              {
                icon: "🔭",
                title: "Our Vision",
                text: "To be the leading sports academy in the Middle East, producing champions who represent Lebanon on the world stage.",
              },
              {
                icon: "💎",
                title: "Our Values",
                text: "Excellence, Integrity, Teamwork, Respect, and Passion. These five values guide everything we do at Cedars Academy.",
              },
            ].map((item) => (
              <div key={item.title} className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="section-padding bg-dark-800/50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
                Our Journey
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mt-2 mb-6">
                From a Dream to{" "}
                <span className="gradient-text">Lebanon&apos;s #1 Academy</span>
              </h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  Cedars Sport Academy was born from a passion for sport and a deep love for Lebanon.
                  Our founder, Coach Karim Nassar, a former national football player, saw a gap in
                  quality sports education for Lebanese youth.
                </p>
                <p>
                  Starting with just 50 athletes in a rented facility in Jounieh, we grew through
                  dedication, results, and word of mouth. Today, we operate 3 state-of-the-art
                  facilities across Lebanon with over 1,200 active athletes.
                </p>
                <p>
                  Our coaches have trained athletes who went on to represent Lebanon in regional and
                  international competitions. We are proud of every single one of them.
                </p>
              </div>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
              >
                Get In Touch →
              </Link>
            </div>
            <div className="relative h-80 lg:h-full min-h-80 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&q=80"
                alt="Cedars Academy Story"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass-card p-4 text-center">
                  <div className="text-3xl font-black text-lebanon-green">2012</div>
                  <div className="text-white/60 text-sm">Founded in Jounieh, Lebanon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Our <span className="gradient-text">Milestones</span>
            </h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-lebanon-green via-white/10 to-lebanon-red hidden md:block" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  className={`flex items-center gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div className="glass-card p-5 inline-block">
                      <div className="text-lebanon-green font-black text-xl mb-1">{m.year}</div>
                      <div className="text-white/70 text-sm">{m.event}</div>
                    </div>
                  </div>
                  {/* Center dot */}
                  <div className="hidden md:flex w-4 h-4 rounded-full bg-lebanon-green border-4 border-dark-900 flex-shrink-0 z-10" />
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-padding bg-dark-800/50">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Be Part of Our <span className="gradient-text">Story</span>
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Join the Cedars family and start your athletic journey today.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-lebanon-green hover:bg-cedar-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-green-900/30"
          >
            🎯 Book Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
