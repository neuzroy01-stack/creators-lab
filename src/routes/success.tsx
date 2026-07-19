import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, Home, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { SITE } from "@/data/site";
import { useState } from "react";
import { z } from "zod";

const searchSchema = z.object({
  code: z.string().optional(),
  course: z.string().optional(),
  name: z.string().optional(),
});

export const Route = createFileRoute("/success")({
  validateSearch: (s) => searchSchema.parse(s),
  component: Success,
});

function Success() {
  const { code, course, name } = Route.useSearch();
  const [copied, setCopied] = useState(false);
  const waHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
    `Hi, my purchase code is ${code}. Please confirm my admission.`
  )}`;

  return (
    <div className="pt-32 md:pt-40 pb-16">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto grid place-items-center h-20 w-20 rounded-full shadow-brand"
          style={{ background: "var(--gradient-brand)" }}
        >
          <CheckCircle2 className="h-10 w-10 text-white" />
        </motion.div>

        <h1 className="mt-6 text-4xl md:text-5xl font-bold">🎉 Congratulations{name ? `, ${name.split(" ")[0]}` : ""}!</h1>
        <p className="mt-3 text-muted-foreground">
          Your purchase has been submitted successfully. Our team will verify your payment shortly.
        </p>

        <div className="mt-8 rounded-3xl glass-strong p-6 md:p-8 text-left">
          <div className="text-xs uppercase tracking-widest text-neon">Your purchase code</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="text-2xl md:text-3xl font-bold font-mono">{code ?? "YT-2026-00001"}</div>
            <button
              onClick={() => { if (code) navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="rounded-lg glass px-3 py-2 text-xs inline-flex items-center gap-1"
            >
              <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="mt-6 grid gap-2 text-sm">
            <Row label="Course">{course ?? "—"}</Row>
            <Row label="Course start">Admin will confirm on WhatsApp</Row>
            <Row label="Status"><span className="text-gold">Awaiting verification</span></Row>
          </div>

          <div className="mt-6 rounded-2xl glass p-4 text-sm text-muted-foreground">
            You will receive a confirmation on <span className="text-foreground">WhatsApp</span> and{" "}
            <span className="text-foreground">Email</span> once payment is verified. Microsoft Teams class links will be shared before the first class.
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
          >
            <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
          </a>
          <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-xl glass px-5 py-3 text-sm font-semibold">
            <Home className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
