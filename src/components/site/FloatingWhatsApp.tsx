import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  MessageCircle, X, HelpCircle, PlayCircle, Calendar, CreditCard, Ticket, Phone,
} from "lucide-react";
import { SITE } from "@/data/site";

const waHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

const OPTIONS = [
  { icon: MessageCircle, label: "Chat on WhatsApp", href: waHref, external: true },
  { icon: HelpCircle, label: "FAQs", to: "/help" },
  { icon: PlayCircle, label: "Demo Videos", to: "/#demos" },
  { icon: Calendar, label: "Upcoming Batches", to: "/courses" },
  { icon: CreditCard, label: "Payment Help", to: "/help" },
  { icon: Ticket, label: "Coupon Help", to: "/help" },
  { icon: Phone, label: "Request a Callback", href: waHref, external: true },
];

export function FloatingWhatsApp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 md:right-6 bottom-24 md:bottom-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="glass-strong rounded-2xl p-2 w-64 shadow-card"
          >
            <div className="px-3 py-2 border-b border-white/10 mb-1">
              <div className="text-sm font-semibold">Need Help?</div>
              <div className="text-xs text-muted-foreground">Replies in a few minutes</div>
            </div>
            {OPTIONS.map((o) => {
              const Icon = o.icon;
              const inner = (
                <>
                  <Icon className="h-4 w-4 shrink-0 text-neon" />
                  <span className="truncate">{o.label}</span>
                </>
              );
              return o.external ? (
                <a
                  key={o.label}
                  href={o.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 transition"
                >
                  {inner}
                </a>
              ) : (
                <Link
                  key={o.label}
                  to={o.to!}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 transition"
                >
                  {inner}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Support"
        className="relative grid place-items-center h-14 w-14 rounded-full text-white shadow-2xl animate-pulse-ring"
        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
