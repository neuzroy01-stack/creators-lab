import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { STATS, FEATURES, DEMO_VIDEOS, TESTIMONIALS, FAQS, COURSES } from "@/data/site";
import { Link } from "@tanstack/react-router";
import { Star, PlayCircle, ArrowRight, Check, ChevronDown } from "lucide-react";
import { useState } from "react";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const val = useMotionValue(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(val, to, { duration: 2, ease: "easeOut" });
    const unsub = val.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.floor(v).toLocaleString() + suffix;
    });
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, to, suffix, val]);
  return <span ref={ref}>0{suffix}</span>;
}

export function TrustSection() {
  return (
    <section className="py-20 md:py-24 relative">
      <div className="mx-auto max-w-7xl px-4">
        <div className="glass-strong rounded-3xl p-6 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-5xl font-bold text-gradient-neon">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-xs md:text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyUsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Why choose us"
          title={<>Everything a modern creator needs, <span className="text-gradient-brand">in one place</span></>}
          subtitle="Live classes, AI tools, editing, SEO, monetization — taught by working creators, not theorists."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl glass p-6 hover:bg-white/[0.08] transition"
            >
              <div className="text-3xl">{f.icon}</div>
              <div className="mt-4 font-semibold">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
              <div className="pointer-events-none absolute -right-16 -bottom-16 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition"
                style={{ background: "var(--gradient-neon)" }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CoursesSection() {
  return (
    <section id="courses" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Courses"
          title={<>Pick your <span className="text-gradient-neon">creator path</span></>}
          subtitle="Live, mentored programs designed to take you from your first upload to a full-time creator career."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative rounded-3xl p-[1.5px] transition-transform duration-500 hover:-translate-y-2"
              style={{ background: "var(--gradient-brand)" }}
            >
              <div className="relative rounded-[calc(1.5rem-1.5px)] bg-card flex flex-col overflow-hidden h-full hover-glow-gold">
                <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    loading="lazy"
                    width={1280}
                    height={800}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {c.status === "live" && (
                    <div className="absolute top-3 left-3 glass-strong rounded-full px-2.5 py-1 text-[10px] font-semibold text-white">
                      ⏱ {c.duration}
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                    {c.badge && (
                      <div className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-brand"
                        style={{ background: "var(--gradient-brand)" }}>
                        {c.badge}
                      </div>
                    )}
                    {c.status === "coming-soon" && (
                      <div className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: "var(--gradient-gold)", color: "oklch(0.16 0.02 260)" }}>
                        New Soon
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-wider text-white/95 glass rounded-full px-2.5 py-1">
                    {c.status === "coming-soon" ? "Coming Soon" : "● Live Program"}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg md:text-xl font-bold leading-tight">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground min-h-[2.5rem]">{c.tagline}</p>

                  {c.status === "live" ? (
                    <>
                      <div className="mt-4 flex items-baseline gap-2">
                        <div className="text-2xl md:text-3xl font-bold text-gradient-gold">₹{c.price.toLocaleString()}</div>
                        {c.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">₹{c.originalPrice.toLocaleString()}</div>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{c.support}</div>
                      {c.seatsLeft && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs w-fit">
                          <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                          Only {c.seatsLeft} seats left
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                        {["Live Classes", "MS Teams", "Recorded", "Certificate"].map((t) => (
                          <span key={t} className="rounded-full glass px-2 py-1 text-muted-foreground">{t}</span>
                        ))}
                      </div>
                      <div className="mt-5 flex gap-2">
                        <Link
                          to="/courses/$courseId"
                          params={{ courseId: c.id }}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold glass hover:bg-white/10 transition"
                        >
                          View Details
                        </Link>
                        <Link
                          to="/enroll/$courseId"
                          params={{ courseId: c.id }}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform hover:scale-[1.03]"
                          style={{ background: "var(--gradient-brand)" }}
                        >
                          Enroll <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="mt-auto pt-6">
                      <div className="text-sm text-muted-foreground">Notify me when it launches</div>
                      <button className="mt-3 w-full rounded-xl glass px-4 py-2.5 text-sm font-semibold opacity-70 cursor-not-allowed">
                        Coming Soon
                      </button>
                    </div>
                  )}
                </div>

                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl opacity-20 group-hover:opacity-50 transition-opacity duration-500"
                  style={{ background: c.status === "live" ? "var(--gradient-brand)" : "var(--gradient-gold)" }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


export function DemoVideosSection() {
  return (
    <section id="demos" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Demo videos"
          title={<>See the academy <span className="text-gradient-brand">in action</span></>}
          subtitle="Real class excerpts, tool walkthroughs, and student wins."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {DEMO_VIDEOS.map((v) => (
            <a
              key={v.id}
              href={`https://youtu.be/7y1n6A0A7VU?si=C5opq75ffzPincE9{v.youtubeId}`}
href={`https://youtu.be/AOtPuDqCU8M?si=yPizRfdQ6CJ7inhM{v.youtubeId}`}
              href={`https://youtu.be/er8zzms30kA?si=CJL0mVF8BTeFVHdD{v.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl overflow-hidden glass-strong hover:scale-[1.02] transition-transform"
            >
              <div className="relative aspect-video bg-black">
                <img
                  src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                  alt={v.title}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition"
                />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="h-14 w-14 rounded-full grid place-items-center backdrop-blur-md bg-black/40 border border-white/30">
                    <PlayCircle className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="font-semibold">{v.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{v.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section id="reviews" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Student reviews"
          title={<>Loved by <span className="text-gradient-neon">creators across India</span></>}
          subtitle="Real students, real channels, real growth."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="rounded-2xl glass p-6"
            >
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" style={{ color: "oklch(0.83 0.15 85)" }} />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full grid place-items-center text-white font-bold"
                  style={{ background: "var(--gradient-brand)" }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeader
          eyebrow="FAQ"
          title="Everything you're wondering"
          subtitle="Still have questions? Chat with us on WhatsApp — we typically reply in a few minutes."
        />
        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-2xl glass overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm md:text-base font-medium">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CTABand() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-8 md:p-14 text-center">
          <div className="absolute inset-0 opacity-40"
            style={{ background: "var(--gradient-hero)" }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs">
              <Check className="h-3.5 w-3.5 text-success" /> New batch reserving seats
            </div>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold">
              Ready to build a <span className="text-gradient-brand">YouTube career</span>?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Join thousands of creators learning YouTube & AI the practical way.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white shadow-brand"
                style={{ background: "var(--gradient-brand)" }}
              >
                Enroll Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/help"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold glass hover:bg-white/10 transition"
              >
                Talk to support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow, title, subtitle,
}: { eyebrow?: string; title: React.ReactNode; subtitle?: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      {eyebrow && (
        <div className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-neon">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-3 text-3xl md:text-5xl font-bold leading-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
