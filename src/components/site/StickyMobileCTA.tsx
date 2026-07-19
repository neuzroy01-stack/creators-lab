import { Link } from "@tanstack/react-router";
import { MessageCircle, GraduationCap } from "lucide-react";
import { SITE } from "@/data/site";

export function StickyMobileCTA() {
  const waHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 p-3 pointer-events-none">
      <div className="pointer-events-auto glass-strong rounded-2xl p-2 grid grid-cols-2 gap-2 shadow-card">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <Link
          to="/courses"
          className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          <GraduationCap className="h-4 w-4" /> Enroll Now
        </Link>
      </div>
    </div>
  );
}
