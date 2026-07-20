import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { COURSES, SITE } from "@/data/site";
import { supabase } from "@/integrations/supabase/client";
import { submitRegistration } from "@/lib/registrations.functions";
import { INDIAN_STATES, getDistricts } from "@/data/india";
import {
  ArrowLeft, ArrowRight, Check, Copy, Upload, User, GraduationCap,
  BookOpen, ClipboardCheck, CreditCard, Loader2, AlertCircle, ChevronDown,
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
  email: string; address: string; city: string; state: string; district: string; country: string;
  qualification: string; profession: string;
  laptop: string; mobileAvail: string; internet: string;
  hearAbout: string; referralName: string; couponCode: string; comments: string;
  transactionId: string;
};

const INIT: FormState = {
  fullName: "", fatherName: "", motherName: "",
  age: "", gender: "", mobile: "", whatsapp: "",
  email: "", address: "", city: "", state: "", district: "", country: "India",
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

const COUPONS: Record<string, number> = {
  LAUNCH20: 20,
  YT10: 10,
  EARLYBIRD: 15,
};

// ---------- Validation ----------
const NAME_RE = /^[A-Za-z][A-Za-z\s.'-]{1,98}$/;
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

type Errors = Partial<Record<keyof FormState, string>>;

function validateStep(step: number, form: FormState): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    else if (!NAME_RE.test(form.fullName.trim())) e.fullName = "Enter a valid name (letters and spaces only)";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required";
    else if (!MOBILE_RE.test(form.mobile.trim())) e.mobile = "Enter a valid 10-digit Indian mobile number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state) e.state = "Please select your state";
    if (!form.district) e.district = "Please select your district";
    if (form.whatsapp.trim() && !MOBILE_RE.test(form.whatsapp.trim()))
      e.whatsapp = "Enter a valid 10-digit WhatsApp number";
  }
  if (step === 1) {
    if (!form.qualification) e.qualification = "Please select your qualification";
  }
  if (step === 4) {
    if (!form.transactionId.trim()) e.transactionId = "Transaction ID is required";
    else if (form.transactionId.trim().length < 6) e.transactionId = "Enter a valid transaction ID (min 6 chars)";
  }
  return e;
}

function EnrollPage() {
  const { course } = Route.useLoaderData();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INIT);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submit = useServerFn(submitRegistration);

  const discount = COUPONS[form.couponCode.toUpperCase()] ?? 0;
  const discountAmt = Math.round((course.price * discount) / 100);
  const finalAmt = course.price - discountAmt;

  const districts = useMemo(() => (form.state ? getDistricts(form.state) : []), [form.state]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onBlur = (k: keyof FormState) => {
    setTouched((t) => ({ ...t, [k]: true }));
    const e = validateStep(step, form);
    setErrors((prev) => ({ ...prev, [k]: e[k] }));
  };

  const canNext = () => {
    const e = validateStep(step, form);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    const e = validateStep(step, form);
    setErrors(e);
    const keys = Object.keys(e) as (keyof FormState)[];
    setTouched((t) => ({ ...t, ...Object.fromEntries(keys.map((k) => [k, true])) }));
    if (Object.keys(e).length === 0) setStep((s) => s + 1);
  };

  const onSubmit = async () => {
    if (submitting) return;
    const e = validateStep(4, form);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Please fix the errors before submitting.");
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
        <Link to="/courses/$courseId" params={{ courseId: course.id }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
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
                    className={`grid place-items-center h-9 w-9 rounded-xl shrink-0 transition-all duration-300 ${
                      active ? "text-white shadow-brand scale-110" : done ? "text-white" : "glass text-muted-foreground"
                    }`}
                    style={active || done ? { background: "var(--gradient-brand)" } : undefined}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className={`hidden md:block text-xs truncate transition-colors ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 transition-colors ${done ? "bg-brand/60" : "bg-white/10"}`} />}
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
              {step === 0 && <StepPersonal form={form} set={set} errors={errors} touched={touched} onBlur={onBlur} districts={districts} />}
              {step === 1 && <StepEducation form={form} set={set} errors={errors} touched={touched} onBlur={onBlur} />}
              {step === 2 && <StepCourse form={form} set={set} errors={errors} touched={touched} onBlur={onBlur} courseName={course.title} />}
              {step === 3 && <StepReview form={form} course={course} finalAmt={finalAmt} discount={discount} discountAmt={discountAmt} />}
              {step === 4 && (
                <StepPayment
                  form={form}
                  set={set}
                  errors={errors}
                  touched={touched}
                  onBlur={onBlur}
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
              className="rounded-xl glass px-5 py-3 text-sm font-semibold disabled:opacity-40 transition-all hover:bg-white/5"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-brand transition-transform hover:scale-[1.03] inline-flex items-center gap-1"
                style={{ background: "var(--gradient-brand)" }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-brand disabled:opacity-40 inline-flex items-center gap-2 transition-transform hover:scale-[1.03]"
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

/* --- Shared field components --- */

function Field({
  label, children, span = 1, required, error, touched: isTouched,
}: {
  label: string; children: React.ReactNode; span?: 1 | 2;
  required?: boolean; error?: string; touched?: boolean;
}) {
  const showError = isTouched && error;
  return (
    <label className={`block ${span === 2 ? "sm:col-span-2" : ""}`}>
      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive">*</span>}
      </div>
      {children}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive"
          >
            <AlertCircle className="h-3 w-3 shrink-0" /> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </label>
  );
}

const inputBase =
  "w-full rounded-xl glass px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-neon/60 focus:border-neon/40 hover:border-white/20";
const inputError =
  "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50 ring-2 ring-destructive/60 border-destructive/40 focus:ring-2 focus:ring-destructive/60";

function TextInput({
  value, onChange, onBlur, placeholder, type = "text", error, touched, readOnly,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  error?: string;
  touched?: boolean;
  readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      readOnly={readOnly}
      className={touched && error ? inputError : inputBase + (readOnly ? " opacity-70 cursor-not-allowed" : "")}
    />
  );
}

// Premium themed dropdown
function PremiumSelect({
  value, onChange, onBlur, placeholder, options, error, touched,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  options: string[];
  error?: string;
  touched?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`appearance-none w-full rounded-xl glass px-4 py-3 pr-10 text-sm outline-none cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-neon/60 focus:border-neon/40 hover:border-white/20 ${
          touched && error ? "ring-2 ring-destructive/60 border-destructive/40" : ""
        } ${!value ? "text-muted-foreground/70" : "text-foreground"}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o} className="bg-popover text-popover-foreground">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

/* --- Steps --- */

type StepProps = {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  errors: Errors;
  touched: Partial<Record<keyof FormState, boolean>>;
  onBlur: (k: keyof FormState) => void;
};

function StepPersonal({ form, set, errors, touched, onBlur, districts }: StepProps & { districts: string[] }) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold">Personal information</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tell us about yourself. Fields marked <span className="text-destructive">*</span> are required.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={errors.fullName} touched={touched.fullName}>
          <TextInput
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            onBlur={() => onBlur("fullName")}
            placeholder="e.g. Rahul Sharma"
            error={errors.fullName}
            touched={touched.fullName}
          />
        </Field>
        <Field label="Father's name">
          <TextInput value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)} placeholder="e.g. Suresh Sharma" />
        </Field>
        <Field label="Mother's name">
          <TextInput value={form.motherName} onChange={(e) => set("motherName", e.target.value)} placeholder="e.g. Anita Sharma" />
        </Field>
        <Field label="Age">
          <TextInput type="number" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="e.g. 24" />
        </Field>
        <Field label="Gender">
          <PremiumSelect
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
            placeholder="Select gender"
            options={["Male", "Female", "Other"]}
          />
        </Field>
        <Field label="Mobile number" required error={errors.mobile} touched={touched.mobile}>
          <TextInput
            value={form.mobile}
            onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
            onBlur={() => onBlur("mobile")}
            placeholder="10-digit number, e.g. 9876543210"
            error={errors.mobile}
            touched={touched.mobile}
          />
        </Field>
        <Field label="WhatsApp number" error={errors.whatsapp} touched={touched.whatsapp}>
          <TextInput
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))}
            onBlur={() => onBlur("whatsapp")}
            placeholder="Same as mobile if empty"
            error={errors.whatsapp}
            touched={touched.whatsapp}
          />
        </Field>
        <Field label="Email" required error={errors.email} touched={touched.email}>
          <TextInput
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => onBlur("email")}
            placeholder="e.g. you@email.com"
            error={errors.email}
            touched={touched.email}
          />
        </Field>
        <Field label="Address" span={2}>
          <TextInput value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="House no, street, area" />
        </Field>
        <Field label="State" required error={errors.state} touched={touched.state}>
          <PremiumSelect
            value={form.state}
            onChange={(e) => {
              set("state", e.target.value);
              set("district", "");
            }}
            onBlur={() => onBlur("state")}
            placeholder="Select your state"
            options={INDIAN_STATES.map((s) => s.name)}
            error={errors.state}
            touched={touched.state}
          />
        </Field>
        <Field label="District" required error={errors.district} touched={touched.district}>
          <PremiumSelect
            value={form.district}
            onChange={(e) => set("district", e.target.value)}
            onBlur={() => onBlur("district")}
            placeholder={form.state ? "Select your district" : "Select state first"}
            options={districts}
            error={errors.district}
            touched={touched.district}
          />
        </Field>
        <Field label="City" required error={errors.city} touched={touched.city}>
          <TextInput
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            onBlur={() => onBlur("city")}
            placeholder="e.g. Jaipur"
            error={errors.city}
            touched={touched.city}
          />
        </Field>
        <Field label="Country">
          <TextInput value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="India" />
        </Field>
      </div>
    </div>
  );
}

function StepEducation({ form, set, errors, touched, onBlur }: StepProps) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold">Education & setup</h2>
      <p className="mt-1 text-sm text-muted-foreground">Your background and available equipment.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Highest qualification" required error={errors.qualification} touched={touched.qualification}>
          <PremiumSelect
            value={form.qualification}
            onChange={(e) => set("qualification", e.target.value)}
            onBlur={() => onBlur("qualification")}
            placeholder="Select qualification"
            options={["10th", "12th", "Graduate", "Post-graduate", "Other"]}
            error={errors.qualification}
            touched={touched.qualification}
          />
        </Field>
        <Field label="Current profession">
          <TextInput value={form.profession} onChange={(e) => set("profession", e.target.value)} placeholder="e.g. Student, Freelancer" />
        </Field>
        <Field label="Do you have a laptop?">
          <PremiumSelect value={form.laptop} onChange={(e) => set("laptop", e.target.value)} options={["Yes", "No"]} />
        </Field>
        <Field label="Do you have a smartphone?">
          <PremiumSelect value={form.mobileAvail} onChange={(e) => set("mobileAvail", e.target.value)} options={["Yes", "No"]} />
        </Field>
        <Field label="Stable internet?" span={2}>
          <PremiumSelect value={form.internet} onChange={(e) => set("internet", e.target.value)} options={["Yes", "Sometimes", "No"]} />
        </Field>
      </div>
    </div>
  );
}

function StepCourse({ form, set, errors, touched, onBlur, courseName }: StepProps & { courseName: string }) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold">Course information</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tell us how you found us and apply any coupon.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Selected course">
          <TextInput value={courseName} onChange={() => {}} placeholder="" readOnly />
        </Field>
        <Field label="How did you hear about us?">
          <PremiumSelect
            value={form.hearAbout}
            onChange={(e) => set("hearAbout", e.target.value)}
            placeholder="Select an option"
            options={["YouTube", "Instagram", "Friend", "Google", "WhatsApp", "Other"]}
          />
        </Field>
        <Field label="Referral name">
          <TextInput value={form.referralName} onChange={(e) => set("referralName", e.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Coupon code">
          <TextInput
            value={form.couponCode}
            onChange={(e) => set("couponCode", e.target.value.toUpperCase())}
            placeholder="e.g. LAUNCH20"
          />
        </Field>
        <Field label="Comments" span={2}>
          <textarea
            className={inputBase}
            rows={3}
            value={form.comments}
            onChange={(e) => set("comments", e.target.value)}
            placeholder="Anything you'd like us to know (optional)"
          />
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
    ["State", form.state || "—"], ["District", form.district || "—"], ["City", form.city || "—"],
    ["Qualification", form.qualification || "—"],
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
  form, set, errors, touched, onBlur, course, finalAmt, discount, discountAmt, screenshot, onFileSelected,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  errors: Errors;
  touched: Partial<Record<keyof FormState, boolean>>;
  onBlur: (k: keyof FormState) => void;
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
      toast.error("File too large (max 5 MB).");
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
              className="rounded-lg glass px-3 py-2 text-xs inline-flex items-center gap-1 hover:bg-white/10 transition"
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
            <Field label="Transaction ID (UTR)" required error={errors.transactionId} touched={touched.transactionId}>
              <TextInput
                value={form.transactionId}
                onChange={(e) => set("transactionId", e.target.value)}
                onBlur={() => onBlur("transactionId")}
                placeholder="e.g. 123456789012"
                error={errors.transactionId}
                touched={touched.transactionId}
              />
            </Field>
            <Field label="Upload payment screenshot">
              <div className="rounded-xl glass px-4 py-6 text-center cursor-pointer border border-dashed border-white/20 hover:bg-white/5 hover:border-neon/40 transition-all">
                <input type="file" accept="image/*" onChange={onFile} className="hidden" id="ss" />
                <label htmlFor="ss" className="cursor-pointer">
                  {screenshot ? (
                    <img src={screenshot} alt="screenshot" className="max-h-40 mx-auto rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-5 w-5" /> Click to upload (max 5 MB)
                    </div>
                  )}
                </label>
              </div>
            </Field>
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
