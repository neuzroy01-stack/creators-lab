import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { SITE } from "@/data/site";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/#demos", label: "Demos" },
  { to: "/#reviews", label: "Reviews" },
  { to: "/help", label: "Support" },
  { to: "/dashboard", label: "Dashboard" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 md:px-6 py-3 transition-all ${
            scrolled ? "glass-strong shadow-card" : "glass"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <span className="relative grid place-items-center h-9 w-9 rounded-xl shrink-0"
              style={{ background: "var(--gradient-brand)" }}>
              <Sparkles className="h-4 w-4 text-white" />
              <span className="absolute inset-0 rounded-xl blur-lg opacity-60"
                style={{ background: "var(--gradient-brand)" }} />
            </span>
            <div className="min-w-0">
              <div className="text-sm md:text-base font-semibold truncate">
                {SITE.short}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground truncate">
                YouTube · AI · Growth
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/courses"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-brand transition-transform hover:scale-[1.03]"
              style={{ background: "var(--gradient-brand)" }}
            >
              Enroll Now
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden grid place-items-center h-10 w-10 rounded-xl glass"
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="lg:hidden mt-2 rounded-2xl glass-strong p-2"
            >
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="block px-4 py-3 text-sm rounded-xl hover:bg-white/5"
                >
                  {n.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
