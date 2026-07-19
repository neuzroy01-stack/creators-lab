import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { COURSES } from "@/data/site";
import { Check, Clock, Users, Calendar, Play, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FAQSection, TestimonialsSection } from "@/components/site/Sections";

export const Route = createFileRoute("/courses/$courseId")({
  loader: ({ params }) => {
    const course = COURSES.find((c) => c.id === params.courseId);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.course.title} — YT AI Academy` : "Course" },
      { name: "description", content: loaderData?.course.tagline ?? "Course details" },
      { property: "og:title", content: loaderData?.course.title ?? "Course" },
      { property: "og:description", content: loaderData?.course.overview ?? "" },
    ],
  }),
  component: CourseDetail,
  notFoundComponent: () => (
    <div className="pt-40 pb-24 text-center">
      <div className="text-2xl font-bold">Course not found</div>
      <Link to="/courses" className="mt-4 inline-block text-neon">← Back to courses</Link>
    </div>
  ),
});

function CourseDetail() {
  const { course } = Route.useLoaderData();

  if (course.status === "coming-soon") {
    return (
      <div className="pt-40 pb-24 text-center px-4">
        <div className="text-xs uppercase tracking-widest text-neon">Coming Soon</div>
        <h1 className="mt-3 text-4xl md:text-6xl font-bold">{course.title}</h1>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
          This program is launching soon. Join the waitlist on WhatsApp.
        </p>
      </div>
    );
  }

  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <div className="pt-32 md:pt-40">
      {/* Hero */}
      <section className="relative overflow-hidden pb-16">
        <div className="absolute inset-0 opacity-50" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative mx-auto max-w-7xl px-4 grid lg:grid-cols-[1fr_400px] gap-10 items-start">
          <div>
            {course.badge && (
              <div className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ background: "var(--gradient-brand)" }}>
                {course.badge}
              </div>
            )}
            <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight">
              {course.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{course.overview}</p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <Chip icon={<Clock className="h-4 w-4" />}>{course.duration}</Chip>
              <Chip icon={<Users className="h-4 w-4" />}>Live cohort</Chip>
              <Chip icon={<Calendar className="h-4 w-4" />}>{course.batchStart}</Chip>
              <Chip icon={<Sparkles className="h-4 w-4" />}>{course.support}</Chip>
            </div>
          </div>

          {/* Sticky purchase card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:sticky lg:top-28 rounded-3xl glass-strong p-6 shadow-card"
          >
            <div className="aspect-video rounded-2xl overflow-hidden mb-5 relative">
              <img src={course.thumbnail} alt={course.title} width={1280} height={720}
                className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/30 grid place-items-center">
                <Play className="h-12 w-12 text-white fill-current drop-shadow-lg" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold">₹{course.price.toLocaleString()}</div>
              {course.originalPrice && (
                <>
                  <div className="text-muted-foreground line-through">₹{course.originalPrice.toLocaleString()}</div>
                  <div className="text-xs font-bold text-success">{discount}% OFF</div>
                </>
              )}
            </div>
            {course.seatsLeft && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                Only {course.seatsLeft} seats left
              </div>
            )}
            <Link
              to="/enroll/$courseId"
              params={{ courseId: course.id }}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-brand"
              style={{ background: "var(--gradient-brand)" }}
            >
              Purchase Now <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {[
                "Live Microsoft Teams classes",
                "Lifetime recording access",
                "Certificate on completion",
                "24×7 WhatsApp support",
                "7-day money-back guarantee",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" /> {t}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold">What you'll learn</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {course.outcomes.map((o: string) => (
              <div key={o} className="flex items-start gap-3 rounded-2xl glass p-5">
                <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full"
                  style={{ background: "var(--gradient-neon)" }}>
                  <Check className="h-3.5 w-3.5 text-black" />
                </div>
                <div className="text-sm">{o}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-bold">Tools covered</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {course.tools.map((t: string) => (
              <span key={t} className="rounded-full glass-strong px-4 py-2 text-sm">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Syllabus */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold">Complete syllabus</h2>
          <div className="mt-8 space-y-3">
            {course.syllabus.map((s: {week: string; topics: string[]}, i: number) => (
              <div key={s.week} className="rounded-2xl glass-strong p-6 flex gap-5">
                <div className="hidden md:grid place-items-center h-12 w-12 rounded-xl text-white font-bold shrink-0"
                  style={{ background: "var(--gradient-brand)" }}>
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold text-neon">{s.week}</div>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {s.topics.map((t: string) => (
                      <li key={t} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-neon" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <FAQSection />
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2">
      <span className="text-neon">{icon}</span> {children}
    </span>
  );
}
