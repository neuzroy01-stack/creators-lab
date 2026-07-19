import { createFileRoute } from "@tanstack/react-router";
import { CoursesSection, CTABand } from "@/components/site/Sections";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — YouTube AI Creator Academy" },
      { name: "description", content: "Live mentored programs to become a professional YouTube creator using AI." },
      { property: "og:title", content: "Courses — YouTube AI Creator Academy" },
      { property: "og:description", content: "Browse all live and upcoming YouTube × AI creator programs." },
    ],
  }),
  component: CoursesIndex,
});

function CoursesIndex() {
  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <div className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-neon">
          All programs
        </div>
        <h1 className="mt-3 text-4xl md:text-6xl font-bold">
          Choose your <span className="text-gradient-brand">creator journey</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Live cohorts, lifetime community, and hands-on mentorship. New batches every month.
        </p>
      </div>
      <CoursesSection />
      <CTABand />
    </div>
  );
}
