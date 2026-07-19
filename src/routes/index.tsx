import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { BannerCarousel } from "@/components/site/BannerCarousel";
import {
  TrustSection, WhyUsSection, CoursesSection,
  DemoVideosSection, TestimonialsSection, FAQSection, CTABand,
} from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <BannerCarousel />
      <TrustSection />
      <WhyUsSection />
      <CoursesSection />
      <DemoVideosSection />
      <TestimonialsSection />
      <FAQSection />
      <CTABand />
    </>
  );
}
