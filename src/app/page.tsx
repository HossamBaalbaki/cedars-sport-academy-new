/**
 * Home Page — Cedars Sport Academy
 * Async server component: fetches programs + coaches SSR, passes to client components.
 */

import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import FeaturedPrograms from "@/components/home/FeaturedPrograms";
import WhyUs from "@/components/home/WhyUs";
import CoachesSpotlight from "@/components/home/CoachesSpotlight";
import AchievementsStrip from "@/components/home/AchievementsStrip";
import Testimonials from "@/components/home/Testimonials";
import CTABanner from "@/components/home/CTABanner";
import { getPrograms, getCoaches, getAchievements } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [programs, coaches, achievements] = await Promise.all([
    getPrograms(),
    getCoaches(),
    getAchievements(),
  ]);

  return (
    <>
      <Hero />
      <Stats />
      <FeaturedPrograms programs={programs} />
      <WhyUs />
      <CoachesSpotlight coaches={coaches} />
      <AchievementsStrip achievements={achievements} />
      <Testimonials />
      <CTABanner />
    </>
  );
}
