import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  Youtube, Sparkles, Play, ArrowRight, Mic, Camera, Laptop,
  Smartphone, Wand2, Film, Brain, Rocket,
} from "lucide-react";

const FLOATERS = [
  { Icon: Youtube, x: "8%", y: "18%", size: 64, tone: "brand", delay: 0 },
  { Icon: Brain, x: "82%", y: "12%", size: 60, tone: "neon", delay: 0.4 },
  { Icon: Laptop, x: "6%", y: "70%", size: 56, tone: "cyan", delay: 0.8 },
  { Icon: Smartphone, x: "88%", y: "62%", size: 52, tone: "purple", delay: 1.2 },
  { Icon: Camera, x: "18%", y: "44%", size: 44, tone: "gold", delay: 0.2 },
  { Icon: Mic, x: "76%", y: "38%", size: 44, tone: "brand", delay: 0.6 },
  { Icon: Film, x: "50%", y: "82%", size: 48, tone: "neon", delay: 1 },
  { Icon: Wand2, x: "38%", y: "12%", size: 40, tone: "purple", delay: 1.4 },
];

const TONE: Record<string, string> = {
  brand: "linear-gradient(135deg, oklch(0.62 0.25 27), oklch(0.72 0.2 30))",
  neon: "linear-gradient(135deg, oklch(0.78 0.19 195), oklch(0.65 0.22 210))",
  cyan: "linear-gradient(135deg, oklch(0.72 0.19 210), oklch(0.55 0.2 250))",
  purple: "linear-gradient(135deg, oklch(0.65 0.22 275), oklch(0.55 0.25 310))",
  gold: "linear-gradient(135deg, oklch(0.83 0.15 85), oklch(0.72 0.18 50))",
};

export function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <section
      ref={wrapRef}
      className="relative overflow-hidden pt-32 md:pt-40 pb-20 md:pb-32"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Grid noise */}
      <div className="absolute inset-0 grid-noise opacity-40 pointer-events-none" />
      {/* Glow orbs */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl opacity-40"
        style={{ background: "var(--gradient-brand)" }} />
      <div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-30"
        style={{ background: "var(--gradient-neon)" }} />

      {/* Floating icons — parallax + float */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        {FLOATERS.map((f, i) => {
          const depth = ((i % 4) + 1) * 8;
          return (
            <Floater key={i} f={f} depth={depth} mx={smx} my={smy} />
          );
        })}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs md:text-sm text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-neon" />
          India's #1 YouTube × AI Creator Academy
          <span className="hidden sm:inline text-white/40">•</span>
          <span className="hidden sm:inline">New batch starts soon</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05]"
        >
          Learn YouTube &{" "}
          <span className="text-gradient-brand animate-gradient-x">Generative AI</span>
          <br />
          <span className="text-white/90">From Beginner</span>{" "}
          <span className="text-gradient-neon animate-gradient-x">To Professional</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground"
        >
          Master YouTube, AI content creation, video editing, branding, SEO and monetization
          with <span className="text-foreground font-medium">live mentorship</span> and hands-on training.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            to="/courses"
            className="group inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm md:text-base font-semibold text-white shadow-brand transition-transform hover:scale-[1.03]"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Rocket className="h-4 w-4" /> Enroll Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-xl glass-strong px-6 py-3.5 text-sm md:text-base font-semibold hover:bg-white/10 transition"
          >
            View Courses
          </Link>
          <a
            href="#demos"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm md:text-base font-semibold text-neon hover:text-foreground transition"
          >
            <Play className="h-4 w-4 fill-current" /> Watch Demo
          </a>
        </motion.div>

        {/* Trust chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-2 md:gap-3 text-xs"
        >
          {["10,000+ Students", "Live Mentorship", "MS Teams Classes", "Certificate", "24×7 Support"].map((t) => (
            <span key={t} className="glass rounded-full px-3 py-1.5 text-muted-foreground">
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Floater({
  f,
  depth,
  mx,
  my,
}: {
  f: (typeof FLOATERS)[number];
  depth: number;
  mx: ReturnType<typeof useSpring>;
  my: ReturnType<typeof useSpring>;
}) {
  const tx = useTransform(mx, (v) => v * depth);
  const ty = useTransform(my, (v) => v * depth);
  const Icon = f.Icon;
  return (
    <motion.div
      style={{ left: f.x, top: f.y, x: tx, y: ty }}
      className="absolute"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: f.delay, duration: 0.8 }}
    >
      <div className="animate-float" style={{ animationDelay: `${f.delay}s` }}>
        <div
          className="grid place-items-center rounded-2xl shadow-2xl border border-white/20"
          style={{
            width: f.size,
            height: f.size,
            background: TONE[f.tone],
            boxShadow: "0 20px 40px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <Icon className="text-white" style={{ width: f.size * 0.45, height: f.size * 0.45 }} />
        </div>
      </div>
    </motion.div>
  );
}
