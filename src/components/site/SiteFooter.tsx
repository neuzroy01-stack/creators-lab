import { Link } from "@tanstack/react-router";
import { Youtube, Instagram, Twitter, Mail, Sparkles } from "lucide-react";
import { SITE } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid place-items-center h-9 w-9 rounded-xl"
                style={{ background: "var(--gradient-brand)" }}>
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <div className="font-semibold">{SITE.short}</div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              India's premium academy for YouTube creators powered by generative AI.
            </p>
            <div className="mt-5 flex gap-3">
              {[Youtube, Instagram, Twitter, Mail].map((Icon, i) => (
                <a key={i} href="#" className="grid place-items-center h-10 w-10 rounded-xl glass hover:bg-white/10 transition">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Academy" links={[
            { to: "/courses", label: "All Courses" },
            { to: "/help", label: "Help & Support" },
            { to: "/dashboard", label: "Student Dashboard" },
            { to: "/login", label: "Login" },
          ]} />
          <FooterCol title="Resources" links={[
            { to: "/#demos", label: "Demo Videos" },
            { to: "/#faq", label: "FAQs" },
            { to: "/#reviews", label: "Reviews" },
          ]} />
          <FooterCol title="Legal" links={[
            { to: "/help", label: "Privacy Policy" },
            { to: "/help", label: "Refund Policy" },
            { to: "/help", label: "Terms & Conditions" },
          ]} />
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</div>
          <div>Made with ❤️ for creators in India</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-4">{title}</div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
