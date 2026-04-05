"use client";

/**
 * Testimonials Section — Parent and athlete reviews.
 */

import Image from "next/image";
import { featuredTestimonials } from "@/data/testimonials";
import { useLanguage } from "@/context/LanguageContext";

export default function Testimonials() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-dark-900">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-lebanon-green text-sm font-semibold uppercase tracking-widest">
            {t("What They Say", "ماذا يقولون")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2">
            {t("Success", "قصص")}
            <span className="gradient-text"> {t("Stories", "النجاح")}</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="glass-card p-6 flex flex-col gap-4 card-hover"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-white/70 text-sm leading-relaxed flex-1 italic">
                &ldquo;{t(testimonial.quote, testimonial.quoteAr)}&rdquo;
              </p>

              {/* Sport tag */}
              <div className="inline-flex">
                <span className="bg-lebanon-green/10 border border-lebanon-green/20 text-lebanon-green text-xs px-2.5 py-1 rounded-full">
                  {testimonial.sport}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">
                    {t(testimonial.name, testimonial.nameAr)}
                  </div>
                  <div className="text-white/40 text-xs">
                    {t(testimonial.role, testimonial.roleAr)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
