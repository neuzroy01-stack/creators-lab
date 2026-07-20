import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { COURSES, SITE } from "@/data/site";
import { supabase } from "@/integrations/supabase/client";
import { submitRegistration } from "@/lib/registrations.functions";
import {
  ArrowLeft, ArrowRight, Check, Copy, Upload, User, GraduationCap,
  BookOpen, ClipboardCheck, CreditCard, Loader2,
} from "lucide-react";

export const Route = createFileRoute("/enroll/$courseId")({
  loader: ({ params }) => {
    const course = COURSES.find((c) => c.id === params.courseId && c.status === "live");
    if (!course) throw notFound();
    return { course };
  },
  component: EnrollPage,
  notFoundComponent: () => (
    <div className="pt-40 text-center">
      <div className="text-2xl font-bold">This course isn't open for enrollment yet.</div>
      <Link to="/courses" className="mt-4 inline-block text-neon">← Back to courses</Link>
    </div>
  ),
});

type FormState = {
  fullName: string; fatherName: string; motherName: string;
  age: string; gender: string; mobile: string; whatsapp: string;
  email: string; address: string; city: string; state: string; country: string;
  qualification: string; profession: string;
  laptop: string; mobileAvail: string; internet: string;
  hearAbout: string; referralName: string; couponCode: string; comments: string;
  transactionId: string;
};

const INIT: FormState = {
  fullName: "", fatherName: "", motherName: "",
  age: "", gender: "", mobile: "", whatsapp: "",
  email: "", address: "", city: "", state: "", country: "India",
  qualification: "", profession: "",
  laptop: "Yes", mobileAvail: "Yes", internet: "Yes",
  hearAbout: "", referralName: "", couponCode: "", comments: "",
  transactionId: "",
};

const STEPS = [
  { icon: User, label: "Personal" },
  { icon: GraduationCap, label: "Education" },
  { icon: BookOpen, label: "Course" },
  { icon: ClipboardCheck, label: "Review" },
  { icon: CreditCard, label: "Payment" },
];

// Mock coupon codes → discount %
const COUPONS: Record<string, number> = {
  LAUNCH20: 20,
  YT10: 10,
  EARLYBIRD: 15,
};

function EnrollPage() {
  const { course } = Route.useLoaderData();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INIT);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submit = useServerFn(submitRegistration);

  const discount = COUPONS[form.couponCode.toUpperCase()] ?? 0;
  const discountAmt = Math.round((course.price * discount) / 100);
  const finalAmt = course.price - discountAmt;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.fullName && form.mobile && form.email && form.city;
    if (step === 1) return form.qualification;
    if (step === 2) return true;
    if (step === 3) return true;
    if (step === 4) return form.transactionId.length >= 6;
    return true;
  };

  const onSubmit = async () => {
    if (submitting) return;
    if (form.transactionId.trim().length < 6) {
      toast.error("Please enter a valid transaction ID (UTR).");
      return;
    }
    setSubmitting(true);
    try {
      let screenshotPath: string | null = null;
      if (screenshotFile) {
        const ext = screenshotFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const safeMobile = form.mobile.replace(/\D/g, "").slice(-10) || "anon";
        const path = `${new Date().getFullYear()}/${course.id}/${safeMobile}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("payment-proofs")
          .upload(path, screenshotFile, { upsert: false, contentType: screenshotFile.type });
        if (upErr) {
          toast.error("Could not upload screenshot. Please try again.");
          setSubmitting(false);
          return;
        }
        screenshotPath = path;
      }

      const result = await submit({
        data: {
          fullName: form.fullName.trim(),
          mobile: form.mobile.trim(),
          email: form.email.trim(),
          courseId: course.id,
          courseTitle: course.title,
          amount: finalAmt,
          utr: form.transactionId.trim(),
          screenshotPath,
          remarks: form.comments?.trim() || null,
        },
      });

      if (!result.ok) {
        toast.error(result.message ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      toast.success("Registration submitted!");
      navigate({
        to: "/success",
        search: { code: result.code, course: course.title, name: form.fullName },
      });
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 md:pt-40 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <Link to="/courses/$courseId" params={{ courseId: course.id }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>

        <h1 className="mt-4 text-3xl md:text-5xl font-bold">Enrollment</h1>
        <p className="mt-2 text-muted-foreground">{course.title}</p>

        {/* Stepper */}
        <div className="mt-8 rounded-2xl glass-strong p-4 md:p-5">
          <div className="flex items-center justify-between gap-1 md:gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <div key={s.label} className="flex-1 flex items-center gap-2 min-w-0">
                  <div
                    className={`grid place-items-center h-9 w-9 rounded-xl shrink-0 transition ${
                      active ? "text-white shadow-brand" : done ? "text-white" : "glass text-muted-foreground"
                    }`}
                    style={active || done ? { background: "var(--gradient-brand)" } : undefined}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className={`hidden md:block text-xs truncate ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/10 mx-1" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-3xl glass-strong p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && <StepPersonal form={form} set={set} />}
              {step === 1 && <StepEducation form={form} set={set} />}
              {step === 2 && <StepCourse form={form} set={set} courseName={course.title} />}
              {step === 3 && <StepReview form={form} course={course} finalAmt={finalAmt} discount={discount} discountAmt={discountAmt} />}
              {step === 4 && (
                <StepPayment
                  form={form}
                  set={set}
                  course={course}
                  finalAmt={finalAmt}
                  discount={discount}
                  discountAmt={discountAmt}
                  screenshot={screenshotPreview}
                  onFileSelected={(file, preview) => {
                    setScreenshotFile(file);
                    setScreenshotPreview(preview);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submitting}
              className="rounded-xl glass px-5 py-3 text-sm font-semibold disabled:opacity-40"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => canNext() && setStep((s) => s + 1)}
                disabled={!canNext()}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-brand disabled:opacity-40"
                style={{ background: "var(--gradient-brand)" }}
              >
                Continue <ArrowRight className="inline h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={onSubmit}
                disabled={!canNext() || submitting}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-brand disabled:opacity-40 inline-flex items-center gap-2"
                style={{ background: "var(--gradient-brand)" }}
              >
                {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>) : (<>Submit Payment <Check className="h-4 w-4" /></>)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Steps --- */

function Field({
  label, children, span = 1,
}: { label: string; children: React.ReactNode; span?: 1 | 2 }) {
  return (
    <label className={`block ${span === 2 ? "sm:col-span-2" : ""}`}>
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}
const inputCls =
  "w-full rounded-xl glass px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neon/60 transition placeholder:text-muted-foreground/60";

function StepPersonal({ form, set }: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold">Personal information</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tell us about yourself.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full name *"><input className={inputCls} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Rahul Sharma" /></Field>
        <Field label="Father's name"><input className={inputCls} value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)} /></Field>
        <Field label="Mother's name"><input className={inputCls} value={form.motherName} onChange={(e) => set("motherName", e.target.value)} /></Field>
        <Field label="Age"><input type="number" className={inputCls} value={form.age} onChange={(e) => set("age", e.target.value)} /></Field>
        <Field label="Gender">
          <select className={inputCls} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="">Select…</option>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </Field>
        <Field label="Mobile number *"><input className={inputCls} value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="+91…" /></Field>
        <Field label="WhatsApp number"><input className={inputCls} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="Same as mobile" /></Field>
        <Field label="Email *"><input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Address" span={2}><input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <Field label="City *"><input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="State"><input className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
        <Field label="Country"><input className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)} /></Field>
      </div>
    </div>
  );
}

function StepEducation({ form, set }: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold">Education & setup</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Highest qualification *">
          <select className={inputCls} value={form.qualification} onChange={(e) => set("qualification", e.target.value)}>
            <option value="">Select…</option>
            <option>10th</option><option>12th</option><option>Graduate</option>
            <option>Post-graduate</option><option>Other</option>
          </select>
        </Field>
        <Field label="Current profession"><input className={inputCls} value={form.profession} onChange={(e) => set("profession", e.target.value)} /></Field>
        <Field label="Do you have a laptop?">
          <select className={inputCls} value={form.laptop} onChange={(e) => set("laptop", e.target.value)}>
            <option>Yes</option><option>No</option>
          </select>
        </Field>
        <Field label="Do you have a smartphone?">
          <select className={inputCls} value={form.mobileAvail} onChange={(e) => set("mobileAvail", e.target.value)}>
            <option>Yes</option><option>No</option>
          </select>
        </Field>
        <Field label="Stable internet?" span={2}>
          <select className={inputCls} value={form.internet} onChange={(e) => set("internet", e.target.value)}>
            <option>Yes</option><option>Sometimes</option><option>No</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

function StepCourse({ form, set, courseName }: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void; courseName: string }) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold">Course information</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Selected course"><input className={inputCls} value={courseName} readOnly /></Field>
        <Field label="How did you hear about us?">
          <select className={inputCls} value={form.hearAbout} onChange={(e) => set("hearAbout", e.target.value)}>
            <option value="">Select…</option>
            <option>YouTube</option><option>Instagram</option><option>Friend</option>
            <option>Google</option><option>WhatsApp</option><option>Other</option>
          </select>
        </Field>
        <Field label="Referral name"><input className={inputCls} value={form.referralName} onChange={(e) => set("referralName", e.target.value)} placeholder="Optional" /></Field>
        <Field label="Coupon code"><input className={inputCls} value={form.couponCode} onChange={(e) => set("couponCode", e.target.value.toUpperCase())} placeholder="LAUNCH20" /></Field>
        <Field label="Comments" span={2}>
          <textarea className={inputCls} rows={3} value={form.comments} onChange={(e) => set("comments", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

function StepReview({
  form, course, finalAmt, discount, discountAmt,
}: { form: FormState; course: { title: string; price: number }; finalAmt: number; discount: number; discountAmt: number }) {
  const rows: [string, string][] = [
    ["Name", form.fullName], ["Email", form.email],
    ["Mobile", form.mobile], ["WhatsApp", form.whatsapp || form.mobile],
    ["City", `${form.city}, ${form.state}`],
    ["Qualification", form.qualification],
    ["Course", course.title],
    ["Coupon", form.couponCode || "—"],
  ];
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold">Review your details</h2>
      <p className="mt-1 text-sm text-muted-foreground">Double-check before continuing to payment.</p>
      <div className="mt-6 rounded-2xl glass divide-y divide-white/5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium text-right truncate">{v || "—"}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl p-5" style={{ background: "var(--gradient-card)" }}>
        <div className="flex justify-between text-sm"><span>Course price</span><span>₹{course.price.toLocaleString()}</span></div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-success mt-1"><span>Coupon ({discount}% off)</span><span>− ₹{discountAmt.toLocaleString()}</span></div>
        )}
        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between font-bold text-lg">
          <span>Total</span><span>₹{finalAmt.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function StepPayment({
  form, set, course, finalAmt, discount, discountAmt, screenshot, onFileSelected,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  course: { title: string; price: number };
  finalAmt: number; discount: number; discountAmt: number;
  screenshot: string | null;
  onFileSelected: (file: File | null, preview: string | null) => void;
}) {
  const [copied, setCopied] = useState(false);
  const upiUrl = `upi://pay?pa=${SITE.upiId}&pn=${encodeURIComponent(SITE.short)}&am=${finalAmt}&cu=INR`;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large (max 5 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onFileSelected(file, reader.result as string);
    reader.readAsDataURL(file);
  };


  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold">Complete your payment</h2>
      <p className="mt-1 text-sm text-muted-foreground">Scan the QR with any UPI app to pay.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* QR + amount */}
        <div className="rounded-2xl glass p-6 text-center">
          <div className="relative mx-auto w-56 h-56 rounded-2xl overflow-hidden shadow-brand" style={{ background: "white" }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiUrl)}`}
              alt="UPI QR"
              className="h-full w-full"
            />
          </div>
          <div className="mt-4 text-xs text-muted-foreground">Scan with GPay / PhonePe / Paytm</div>
          <div className="mt-4 flex items-center gap-2 justify-center">
            <div className="rounded-lg glass-strong px-3 py-2 text-sm font-mono">{SITE.upiId}</div>
            <button
              onClick={() => { navigator.clipboard.writeText(SITE.upiId); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="rounded-lg glass px-3 py-2 text-xs inline-flex items-center gap-1"
            >
              <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Summary + submit */}
        <div className="rounded-2xl glass p-6">
          <div className="text-xs uppercase tracking-widest text-neon">Amount to pay</div>
          <div className="mt-2 text-5xl font-bold">₹{finalAmt.toLocaleString()}</div>
          <div className="mt-4 space-y-1 text-sm">
            <Row label="Course">{course.title}</Row>
            <Row label="Original price">₹{course.price.toLocaleString()}</Row>
            {discount > 0 && <Row label={`Coupon (${discount}%)`}><span className="text-success">− ₹{discountAmt.toLocaleString()}</span></Row>}
          </div>

          <div className="mt-6 space-y-3">
            <label className="block">
              <div className="text-xs font-medium text-muted-foreground mb-1.5">Transaction ID *</div>
              <input className={inputCls} value={form.transactionId} onChange={(e) => set("transactionId", e.target.value)} placeholder="e.g. UPI ref no." />
            </label>
            <label className="block">
              <div className="text-xs font-medium text-muted-foreground mb-1.5">Upload payment screenshot</div>
              <div className="rounded-xl glass px-4 py-6 text-center cursor-pointer border border-dashed border-white/20 hover:bg-white/5 transition">
                <input type="file" accept="image/*" onChange={onFile} className="hidden" id="ss" />
                <label htmlFor="ss" className="cursor-pointer">
                  {screenshot ? (
                    <img src={screenshot} alt="screenshot" className="max-h-40 mx-auto rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-5 w-5" /> Click to upload
                    </div>
                  )}
                </label>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl glass p-4 text-xs text-muted-foreground">
        <div className="font-semibold text-foreground mb-1">Payment instructions</div>
        1. Scan the QR with any UPI app. 2. Pay the exact amount shown above.
        3. Enter your transaction ID and upload the screenshot. 4. Click Submit — we'll verify and confirm within 24h on WhatsApp.
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{children}</span>
    </div>
  );
}
