import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Student Login — YT AI Academy" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"mobile" | "email">("mobile");
  const [step, setStep] = useState<"identity" | "otp">("identity");
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState("");

  const submit = () => {
    if (step === "identity") {
      if (value.length < 4) return;
      setStep("otp");
      return;
    }
    if (otp.length !== 6) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen pt-32 md:pt-40 pb-16">
      <div className="mx-auto max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl glass-strong p-8">
          <div className="grid place-items-center h-14 w-14 rounded-2xl mx-auto" style={{ background: "var(--gradient-brand)" }}>
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-center">Student login</h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">Sign in with OTP to access your dashboard.</p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl glass p-1">
            {(["mobile", "email"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setStep("identity"); }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  tab === t ? "text-white shadow-brand" : "text-muted-foreground"
                }`}
                style={tab === t ? { background: "var(--gradient-brand)" } : undefined}
              >
                {t === "mobile" ? "Mobile OTP" : "Email OTP"}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {step === "identity" ? (
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">
                  {tab === "mobile" ? "Mobile number" : "Email address"}
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {tab === "mobile" ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </div>
                  <input
                    className="w-full rounded-xl glass pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neon/60"
                    placeholder={tab === "mobile" ? "+91 …" : "you@email.com"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    type={tab === "mobile" ? "tel" : "email"}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">Enter the 6-digit OTP</div>
                <input
                  className="w-full rounded-xl glass px-4 py-3 text-lg tracking-[0.5em] text-center outline-none focus:ring-2 focus:ring-neon/60"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                />
                <div className="mt-2 text-xs text-muted-foreground text-center">Sent to {value}. Demo: any 6 digits work.</div>
              </div>
            )}
          </div>

          <button
            onClick={submit}
            className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-brand"
            style={{ background: "var(--gradient-brand)" }}
          >
            {step === "identity" ? "Send OTP" : "Verify & continue"}
          </button>

          <div className="mt-4 text-xs text-center text-muted-foreground">
            By continuing you agree to our Terms & Privacy Policy.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
