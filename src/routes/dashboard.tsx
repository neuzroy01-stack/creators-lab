import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Play, Users, FileText, Award, MessageSquare, Bell, TrendingUp, Download, Video,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — YT AI Academy" }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="pt-32 md:pt-40 pb-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest text-neon">Welcome back</div>
            <h1 className="mt-1 truncate text-3xl md:text-4xl font-bold">Rahul Sharma</h1>
            <div className="mt-1 text-sm text-muted-foreground">Purchase code: YT-2026-00042 · Batch: January 2026</div>
          </div>
          <div className="shrink-0 hidden sm:flex items-center gap-3">
            <button className="grid place-items-center h-10 w-10 rounded-xl glass">
              <Bell className="h-4 w-4" />
            </button>
            <div className="h-11 w-11 rounded-full grid place-items-center text-white font-bold shrink-0"
              style={{ background: "var(--gradient-brand)" }}>R</div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Progress", value: "62%", icon: TrendingUp },
            { label: "Classes attended", value: "18 / 30", icon: Video },
            { label: "Assignments", value: "7 / 12", icon: FileText },
            { label: "Certificates", value: "0", icon: Award },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl glass-strong p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center h-10 w-10 rounded-xl" style={{ background: "var(--gradient-neon)" }}>
                    <Icon className="h-4 w-4 text-black" />
                  </div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
                <div className="mt-3 text-2xl font-bold">{s.value}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Main grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Live class */}
            <div className="rounded-3xl glass-strong p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-hero)" }} />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
                  <span className="h-2 w-2 rounded-full bg-brand animate-pulse" /> Next live class in 3h 42m
                </div>
                <h2 className="mt-4 text-2xl font-bold">AI Thumbnails that get 15%+ CTR</h2>
                <p className="mt-2 text-sm text-muted-foreground">Wednesday · 8:00 PM IST · Microsoft Teams</p>
                <button className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-brand"
                  style={{ background: "var(--gradient-brand)" }}>
                  <Video className="h-4 w-4" /> Join on Teams
                </button>
              </div>
            </div>

            {/* Recorded classes */}
            <SectionCard title="Recorded classes" cta="View all">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Week 3 · Storytelling frameworks",
                  "Week 3 · Hook writing with AI",
                  "Week 2 · Niche selection",
                  "Week 2 · Studio setup on a budget",
                ].map((t) => (
                  <button key={t} className="text-left rounded-2xl glass p-4 hover:bg-white/[0.08] transition flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--gradient-brand)" }}>
                      <Play className="h-4 w-4 text-white fill-current" />
                    </div>
                    <div className="text-sm truncate">{t}</div>
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Assignments */}
            <SectionCard title="Assignments" cta="Submit new">
              <div className="space-y-2">
                {[
                  { t: "Week 4 · Write 3 AI-scripted hooks", due: "Due tomorrow", status: "pending" },
                  { t: "Week 3 · Publish first Short", due: "Submitted", status: "done" },
                  { t: "Week 3 · Niche one-pager", due: "Submitted", status: "done" },
                ].map((a) => (
                  <div key={a.t} className="flex items-center justify-between rounded-xl glass p-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{a.t}</div>
                      <div className="text-xs text-muted-foreground">{a.due}</div>
                    </div>
                    <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      a.status === "done" ? "text-success bg-success/10" : "text-gold bg-gold/10"
                    }`}>
                      {a.status === "done" ? "Submitted" : "Pending"}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl glass-strong p-6">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-xl" style={{ background: "var(--gradient-brand)" }}>
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="font-semibold">Refer & earn</div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Get ₹1,000 for every friend who enrolls with your code.</p>
              <div className="mt-4 rounded-xl glass p-3 font-mono text-sm truncate">RAHUL-YT-2026</div>
              <button className="mt-3 w-full rounded-xl glass px-4 py-2.5 text-sm font-semibold hover:bg-white/10">
                Copy link
              </button>
            </div>

            <div className="rounded-3xl glass-strong p-6">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-xl" style={{ background: "var(--gradient-neon)" }}>
                  <Download className="h-4 w-4 text-black" />
                </div>
                <div className="font-semibold">Downloads</div>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center justify-between"><span>AI Prompt Pack v3</span><span className="text-neon">PDF</span></li>
                <li className="flex items-center justify-between"><span>Thumbnail templates</span><span className="text-neon">PSD</span></li>
                <li className="flex items-center justify-between"><span>Editing shortcuts</span><span className="text-neon">PDF</span></li>
              </ul>
            </div>

            <Link to="/help" className="block rounded-3xl glass-strong p-6 text-center hover:bg-white/[0.08] transition">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-neon" />
              <div className="font-semibold">Need help?</div>
              <div className="text-xs text-muted-foreground mt-1">Chat with your mentor</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, cta, children }: { title: string; cta?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl glass-strong p-6">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{title}</div>
        {cta && <button className="text-xs text-neon">{cta} →</button>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
