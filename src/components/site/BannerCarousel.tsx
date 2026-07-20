import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { BANNERS, type Banner } from "@/data/site";

const AUTO_MS = 5000;

export function BannerCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const total = BANNERS.length;

  const go = useCallback((n: number) => setIdx((p) => (p + n + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIdx((p) => (p + 1) % total), AUTO_MS);
    return () => clearInterval(id);
  }, [paused, total]);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const current = BANNERS[idx];

  return (
    <section className="py-8 md:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-neon">Featured</div>
            <h2 className="mt-2 text-2xl md:text-4xl font-bold">
              Top programs at <span className="text-gradient-brand">Creator Lab</span>
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => go(-1)} aria-label="Previous"
              className="grid place-items-center h-11 w-11 rounded-xl glass-strong hover:bg-white/10 transition">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(1)} aria-label="Next"
              className="grid place-items-center h-11 w-11 rounded-xl glass-strong hover:bg-white/10 transition">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative rounded-3xl overflow-hidden glass-strong shadow-2xl"
        >
          {/* Use 16/9 on desktop, shorter on mobile for better fit */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <BannerSlide banner={current} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile arrows overlaid */}
          <button onClick={() => go(-1)} aria-label="Previous"
            className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center h-9 w-9 rounded-full bg-black/50 backdrop-blur border border-white/20">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => go(1)} aria-label="Next"
            className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-9 w-9 rounded-full bg-black/50 backdrop-blur border border-white/20">
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BannerSlide({ banner }: { banner: Banner }) {
  const isComingSoon = banner.price === "Coming Soon";
  return (
    <div className="relative h-full w-full">
      <img
        src={banner.image}
        alt={banner.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Gradient overlay — stronger at bottom for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10" />

      {/* Content anchored to bottom with proper padding */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full p-6 md:p-10 lg:p-14 max-w-2xl pb-10 md:pb-12">
          {banner.seatsBadge && (
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-white mb-4 shadow-lg"
              style={{ background: "var(--gradient-brand)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              {banner.seatsBadge}
            </div>
          )}

          {isComingSoon && (
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 shadow-lg"
              style={{ background: "var(--gradient-gold)", color: "oklch(0.16 0.02 260)" }}
            >
              Coming Soon
            </div>
          )}

          <h3 className="text-xl md:text-3xl lg:text-4xl font-bold leading-tight text-white drop-shadow-lg">
            {banner.title}
          </h3>
          <p className="mt-2 md:mt-3 text-xs md:text-base text-white/85 max-w-lg drop-shadow-md">
            {banner.description}
          </p>

          <div className="mt-5 md:mt-7 flex items-center gap-3 md:gap-5">
            {banner.price && !isComingSoon && (
              <div className="text-lg md:text-3xl font-bold text-gradient-gold drop-shadow-lg">
                {banner.price}
              </div>
            )}
            {banner.courseId && !isComingSoon ? (
              <Link
                to="/courses/$courseId"
                params={{ courseId: banner.courseId }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 md:px-5 md:py-3 text-xs md:text-sm font-semibold text-white shadow-brand transition-transform hover:scale-[1.03]"
                style={{ background: "var(--gradient-brand)" }}
              >
                {banner.ctaLabel} <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Link>
            ) : isComingSoon ? (
              <span className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 md:px-5 md:py-3 text-xs md:text-sm font-semibold glass-strong text-white/90 border border-white/20">
                {banner.ctaLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
