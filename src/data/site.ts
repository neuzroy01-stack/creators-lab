// Central mock data source. Admin panel would edit these via Cloud later.

export const SITE = {
  name: "YouTube AI Creator Academy",
  short: "YT AI Academy",
  tagline: "Learn YouTube & Generative AI From Beginner To Professional",
  whatsappNumber: "916353504505",
  whatsappMessage:
    "Hello! I want to know more about the YouTube AI Creator Academy courses.",
  supportEmail: "support@ytaiacademy.in",
  supportPhone: "+91 63535 04505",
  upiId: "ytaiacademy@upi",
};

export type Course = {
  id: string;
  title: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  duration: string;
  support: string;
  status: "live" | "coming-soon";
  seatsLeft?: number;
  badge?: string;
  overview: string;
  outcomes: string[];
  tools: string[];
  syllabus: { week: string; topics: string[] }[];
  schedule: string;
  batchStart: string;
};

export const COURSES: Course[] = [
  {
    id: "yt-ai-master",
    title: "YouTube AI Creator Master Program",
    tagline: "The complete beginner-to-pro creator system",
    price: 9999,
    originalPrice: 14999,
    duration: "3 Months Live",
    support: "+ 2 Months Growth Support",
    status: "live",
    seatsLeft: 12,
    badge: "Most Popular",
    overview:
      "Master YouTube channel building, AI content creation, editing, SEO, branding, and monetization with live mentorship on Microsoft Teams and lifetime community access.",
    outcomes: [
      "Launch and grow a monetizable YouTube channel from zero",
      "Create viral scripts, thumbnails and shorts with AI",
      "Edit like a pro on mobile and PC",
      "Rank videos with advanced YouTube SEO",
      "Build a personal brand that attracts sponsorships",
    ],
    tools: [
      "ChatGPT", "Gemini", "Midjourney", "Runway", "CapCut",
      "Premiere Pro", "Canva", "TubeBuddy", "VidIQ", "Notion",
    ],
    syllabus: [
      { week: "Week 1–2", topics: ["Channel foundation", "Niche & positioning", "Studio setup"] },
      { week: "Week 3–4", topics: ["AI scripting with ChatGPT & Gemini", "Storytelling frameworks"] },
      { week: "Week 5–6", topics: ["Mobile editing masterclass", "CapCut & VN pro workflow"] },
      { week: "Week 7–8", topics: ["PC editing in Premiere Pro", "Color, audio, motion"] },
      { week: "Week 9–10", topics: ["Thumbnails & CTR", "AI image generation for thumbnails"] },
      { week: "Week 11–12", topics: ["YouTube SEO deep-dive", "Monetization & sponsorships"] },
    ],
    schedule: "Mon / Wed / Fri • 8:00 – 9:30 PM IST",
    batchStart: "Next batch: 1st of next month",
  },
  {
    id: "premium-monetization",
    title: "Premium Monetization Mentorship",
    tagline: "1-on-1 mentorship for serious creators",
    price: 24999,
    originalPrice: 39999,
    duration: "8–12 Months Support",
    support: "1:1 Weekly Mentor Calls",
    status: "live",
    seatsLeft: 5,
    badge: "Premium",
    overview:
      "A hands-on mentorship program for creators who want to scale beyond ₹1L/month with brand deals, digital products and multi-channel strategies.",
    outcomes: [
      "Scale to ₹1L+ / month sustainably",
      "Land premium brand collaborations",
      "Launch a digital product / course",
      "Build a creator team & workflow",
    ],
    tools: ["ChatGPT Enterprise", "Notion", "Zapier", "Airtable", "Beehiiv"],
    syllabus: [
      { week: "Month 1", topics: ["Business audit", "Revenue mapping"] },
      { week: "Month 2–3", topics: ["Brand outreach systems", "Pitch decks"] },
      { week: "Month 4–6", topics: ["Digital product launch", "Sales funnels"] },
      { week: "Month 7+", topics: ["Team building", "Automation & scale"] },
    ],
    schedule: "1:1 weekly calls + group masterminds",
    batchStart: "Rolling admissions",
  },
  {
    id: "shorts-pro",
    title: "AI Shorts & Reels Pro",
    tagline: "Coming Soon",
    price: 0,
    duration: "TBA",
    support: "TBA",
    status: "coming-soon",
    overview: "",
    outcomes: [],
    tools: [],
    syllabus: [],
    schedule: "",
    batchStart: "",
  },
  {
    id: "thumbnail-lab",
    title: "AI Thumbnail Lab",
    tagline: "Coming Soon",
    price: 0,
    duration: "TBA",
    support: "TBA",
    status: "coming-soon",
    overview: "",
    outcomes: [],
    tools: [],
    syllabus: [],
    schedule: "",
    batchStart: "",
  },
  {
    id: "faceless-channel",
    title: "Faceless AI Channels",
    tagline: "Coming Soon",
    price: 0,
    duration: "TBA",
    support: "TBA",
    status: "coming-soon",
    overview: "",
    outcomes: [],
    tools: [],
    syllabus: [],
    schedule: "",
    batchStart: "",
  },
];

export const STATS = [
  { label: "Students Trained", value: 10000, suffix: "+" },
  { label: "Successful YouTubers", value: 1000, suffix: "+" },
  { label: "Live Sessions", value: 500, suffix: "+" },
  { label: "Student Satisfaction", value: 95, suffix: "%" },
];

export const FEATURES = [
  { icon: "🎥", title: "Live Classes", desc: "Interactive Microsoft Teams sessions with mentors" },
  { icon: "🤖", title: "AI Tools Training", desc: "ChatGPT, Gemini, Midjourney, Runway & more" },
  { icon: "📱", title: "Mobile + PC Editing", desc: "CapCut, VN, Premiere Pro, DaVinci" },
  { icon: "📈", title: "YouTube SEO", desc: "Rank videos and grow organically" },
  { icon: "💸", title: "Monetization Guidance", desc: "AdSense, brand deals & products" },
  { icon: "🎓", title: "Certificate", desc: "Verifiable certificate on completion" },
  { icon: "💬", title: "Doubt Clearing", desc: "Weekly live doubt sessions" },
  { icon: "♾️", title: "Lifetime Community", desc: "Learn with 10,000+ creators" },
  { icon: "📝", title: "Weekly Assignments", desc: "Practical, portfolio-worthy projects" },
];

export const DEMO_VIDEOS = [
  {
    id: "d1",
    title: "How AI is changing YouTube in 2026",
    desc: "A quick walkthrough of the AI creator stack we teach.",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    id: "d2",
    title: "Live class preview: Viral thumbnails",
    desc: "Watch a real 20-min excerpt from Week 5.",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    id: "d3",
    title: "Student success: 0 to 100K in 6 months",
    desc: "Meet Ananya and her channel journey.",
    youtubeId: "dQw4w9WgXcQ",
  },
];

export const TESTIMONIALS = [
  {
    name: "Ananya Sharma",
    role: "Lifestyle Creator • 128K subs",
    quote:
      "Went from 200 to 128K subscribers in 6 months. The AI thumbnail workflow alone was worth 10x the price.",
    rating: 5,
  },
  {
    name: "Rohit Verma",
    role: "Tech Creator • 54K subs",
    quote:
      "The mentors actually reply. Every doubt gets answered within hours. Best community I've ever paid for.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Faceless AI Channel • 89K subs",
    quote:
      "I run my channel entirely from my phone using their AI pipeline. Made my first ₹1L month in month 5.",
    rating: 5,
  },
  {
    name: "Kabir Singh",
    role: "Finance Creator • 210K subs",
    quote:
      "The monetization mentorship helped me land 3 brand deals worth ₹4.5L. Genuinely life-changing.",
    rating: 5,
  },
];

export const FAQS = [
  {
    q: "How do I purchase a course?",
    a: "Click Enroll Now, fill the registration form, and complete payment via UPI QR. You'll get an instant purchase code.",
  },
  {
    q: "Which payment methods are accepted?",
    a: "UPI (GPay, PhonePe, Paytm, BHIM) via QR code. EMI options coming soon.",
  },
  {
    q: "When does the next batch start?",
    a: "New batches start on the 1st of every month. Reserve a seat by enrolling early.",
  },
  {
    q: "Will I receive recorded classes?",
    a: "Yes, every live class is recorded and available in your student dashboard for lifetime access.",
  },
  {
    q: "Can I join using only a mobile phone?",
    a: "Absolutely. Our entire mobile editing track is designed for phone-only creators.",
  },
  {
    q: "How do I join Microsoft Teams classes?",
    a: "Class links are pinned in your dashboard and shared on WhatsApp 30 minutes before each session.",
  },
  {
    q: "How do I use a coupon code?",
    a: "Enter your coupon at Step 3 of the enrollment form. Discounts apply automatically.",
  },
  {
    q: "What is the refund policy?",
    a: "7-day money-back guarantee if you attend the first two classes and aren't satisfied.",
  },
  {
    q: "How do I contact support?",
    a: "WhatsApp us at +91 63535 04505 or use the floating chat button — we typically reply within minutes.",
  },
];
