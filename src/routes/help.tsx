import { createFileRoute } from "@tanstack/react-router";
import { FAQSection } from "@/components/site/Sections";
import { SITE } from "@/data/site";
import { MessageCircle, Mail, Phone, HelpCircle, PlayCircle, BookOpen } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — YT AI Academy" },
      { name: "description", content: "Get help with courses, payments, coupons, batches and more." },
    ],
  }),
  component: HelpPage,
});

const CARDS = [
  { icon: MessageCircle, title: "WhatsApp Support", desc: "Fastest replies. Chat with us now.", cta: "Open WhatsApp", href: `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}` },
  { icon: Mail, title: "Email Support", desc: SITE.supportEmail, cta: "Send email", href: `mailto:${SITE.supportEmail}` },
  { icon: Phone, title: "Phone Support", desc: SITE.supportPhone, cta: "Call now", href: `tel:${SITE.supportPhone.replace(/\s/g, "")}` },
  { icon: HelpCircle, title: "Help Center", desc: "Browse frequently asked questions.", cta: "See FAQs", href: "#faq" },
  { icon: PlayCircle, title: "Demo Videos", desc: "Preview live classes and workflows.", cta: "Watch demos", href: "/#demos" },
  { icon: BookOpen, title: "Student Guide", desc: "Everything you need after enrolling.", cta: "Read guide", href: "#faq" },
];

function HelpPage() {
  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <div className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-neon">Help & Support</div>
        <h1 className="mt-3 text-4xl md:text-6xl font-bold">We're here to help</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Chat with our team, browse FAQs, or explore our student guide.
        </p>
      </div>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.title}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group rounded-2xl glass-strong p-6 hover:bg-white/[0.08] transition"
              >
                <div className="grid place-items-center h-12 w-12 rounded-xl mb-4"
                  style={{ background: "var(--gradient-neon)" }}>
                  <Icon className="h-5 w-5 text-black" />
                </div>
                <div className="font-semibold">{c.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.desc}</div>
                <div className="mt-4 text-sm text-neon">{c.cta} →</div>
              </a>
            );
          })}
        </div>
      </section>

      <FAQSection />

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-3xl glass-strong p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-4xl font-bold">Still have questions?</h2>
            <p className="mt-3 text-muted-foreground">Our support team is here to help.</p>
            <a
              href={`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
