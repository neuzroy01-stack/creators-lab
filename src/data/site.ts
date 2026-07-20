// Central data source.
import courseYtAi from "@/assets/AI_learning_platform_hero_banner_202607192308.jpeg";
import courseMonetization from "@/assets/WhatsApp_Image_2026-07-20_at_6.34.08_AM.jpeg";
import courseShorts from "@/assets/WhatsApp_Image_2026-07-20_at_6.34.08_AM_(1).jpeg";
import courseGenerativeAi from "@/assets/Complete_YouTube_Master_Course_2K_202607200852.jpeg";
import coursePlaceholder from "@/assets/course-placeholder.jpg";
import galleryStudio from "@/assets/gallery-studio.jpg";
import galleryClass from "@/assets/gallery-class.jpg";
import galleryCertificate from "@/assets/gallery-certificate.jpg";

export const SITE = {
  name: "Creator Lab",
  short: "Creator Lab",
  tagline: "Learn YouTube & Generative AI From Beginner To Professional",
  whatsappNumber: "916353504505",
  whatsappMessage: "Hello! I want to know more about Creator Lab courses.",
  supportEmail: "support@creatorlab.in",
  supportPhone: "+91 63535 04505",
  upiId: "6353504505@slc",
};

export const IMAGES = {
  courseYtAi,
  courseMonetization,
  courseShorts,
  courseGenerativeAi,
  coursePlaceholder,
  galleryStudio,
  galleryClass,
  galleryCertificate,
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
  thumbnail: string;
  gallery: string[];
  outcomes: string[];
  tools: string[];
  syllabus: { week: string; topics: string[] }[];
  schedule: string;
  batchStart: string;
  includes?: string[];
};

export const COURSES: Course[] = [
  {
    id: "yt-ai-master",
    title: "YouTube All Creator Master Program",
    tagline: "The complete beginner-to-pro YouTube creator system",
    price: 9999,
    originalPrice: 14999,
    duration: "3 Months Live",
    support: "+ 2 Months Growth Support",
    status: "live",
    seatsLeft: 12,
    badge: "Most Popular",
    thumbnail: courseYtAi,
    gallery: [galleryStudio, galleryClass, galleryCertificate],
    overview:
      "Master everything about YouTube — channel setup, app installation, basic to advanced video editing, AI editing workflow, SEO, thumbnails, titles, descriptions, tags, hashtags, branding, YouTube Studio, copyright, community guidelines, monetization, shorts & long video strategy, content planning, AI tools, viral research, analytics, audience growth, upload workflow, live streaming, and backup & security — with live mentorship on Microsoft Teams and lifetime community access.",
    outcomes: [
      "Complete YouTube Channel Setup from scratch",
      "Install and set up all required apps including Facebook Lite, WhatsApp Business",
      "Basic to Advanced Video Editing on mobile and PC",
      "AI Editing Workflow for faster content creation",
      "Master SEO, thumbnails, titles, descriptions, tags and hashtags",
      "Understand YouTube Studio, copyright rules and community guidelines",
      "Complete the monetization process and unlock YouTube features",
      "Build Shorts & Long Video strategies that grow your channel",
      "Use free AI tools for YouTube and viral content research",
      "Read analytics, grow your audience and run live streams",
    ],
    tools: [
      "ChatGPT", "Gemini", "Midjourney", "Runway", "CapCut",
      "Premiere Pro", "Canva", "TubeBuddy", "VidIQ", "Notion",
      "Facebook Lite", "WhatsApp Business",
    ],
    syllabus: [
      { week: "Week 1–2", topics: ["Complete YouTube Channel Setup", "Install & setup required apps", "Facebook Lite setup & usage", "YouTube account setup", "WhatsApp Business setup", "WhatsApp Number Display setup"] },
      { week: "Week 3–4", topics: ["Basic to Advanced Video Editing", "AI Editing Workflow", "Mobile & PC editing masterclass"] },
      { week: "Week 5–6", topics: ["What is SEO and how it works", "Thumbnail Designing", "Title Optimization", "Description Writing", "Tags Research", "Hashtag Strategy"] },
      { week: "Week 7–8", topics: ["Channel Branding", "YouTube Studio Complete Guide", "Copyright Rules", "Community Guidelines"] },
      { week: "Week 9–10", topics: ["Monetization Process", "YouTube Features", "Shorts Strategy", "Long Video Strategy", "Content Planning"] },
      { week: "Week 11–12", topics: ["AI Tools for YouTube", "Free AI Tools", "Viral Content Research", "Analytics Understanding", "Audience Growth Strategy", "Upload Workflow", "Live Streaming Basics", "Backup & Security Tips"] },
    ],
    schedule: "Mon / Wed / Fri • 8:00 – 9:30 PM IST",
    batchStart: "Next batch: 1st of next month",
    includes: [
      "121 Live Sessions",
      "Recorded Sessions",
      "Lifetime Access",
      "Regular Updates",
      "Doubt Clearing Sessions",
      "Full Team Support",
      "Beginner Friendly",
      "Step-by-Step Learning",
      "Free YouTube Monetization Guidance",
      "Premium Learning Experience",
    ],
  },
  {
    id: "premium-monetization",
    title: "Premium Monetization Mentorship",
    tagline: "1-on-1 mentorship for serious creators ready to scale",
    price: 24999,
    originalPrice: 39999,
    duration: "8–12 Months Support",
    support: "1:1 Weekly Mentor Calls",
    status: "live",
    seatsLeft: 5,
    badge: "Premium",
    thumbnail: courseMonetization,
    gallery: [galleryClass, galleryCertificate, galleryStudio],
    overview:
      "The most comprehensive creator mentorship program in India. Built for serious creators who want to scale beyond ₹1L/month. Covers everything from complete YouTube setup and channel creation to advanced AI tools, SEO mastery, brand deals, digital product launches, and full channel automation — all with personalised 1-on-1 weekly mentor calls and a dedicated support team.",
    outcomes: [
      "Complete YouTube Channel Setup & Branding from scratch",
      "Facebook Lite setup, WhatsApp Business & Number Display configuration",
      "Basic to Advanced Video Editing — mobile and PC workflows",
      "AI Editing Workflow for faster, premium content",
      "Full YouTube SEO: thumbnails, titles, descriptions, tags & hashtags",
      "YouTube Studio mastery, copyright & community guidelines",
      "Complete monetization process: AdSense, brand deals & digital products",
      "Shorts & long-form content strategy that drives algorithmic growth",
      "Free AI tools, viral content research & analytics deep-dive",
      "Audience growth strategy, live streaming & upload workflow",
      "Scale to ₹1L+ / month with sustainable revenue streams",
      "Land premium brand collaborations with professional pitch decks",
      "Launch a digital product or online course",
      "Build a creator team & automate your workflow",
    ],
    tools: [
      "ChatGPT Enterprise", "Gemini", "Midjourney", "Runway", "CapCut",
      "Premiere Pro", "Canva", "TubeBuddy", "VidIQ", "Notion",
      "Zapier", "Airtable", "Beehiiv", "Facebook Lite", "WhatsApp Business",
    ],
    syllabus: [
      { week: "Month 1", topics: ["Complete YouTube Channel Setup", "Facebook Lite & WhatsApp Business setup", "Channel branding & positioning", "Business audit & revenue mapping"] },
      { week: "Month 2–3", topics: ["Video Editing — Basic to Advanced", "AI Editing Workflow", "SEO: thumbnails, titles, descriptions, tags", "Hashtag & viral content strategy"] },
      { week: "Month 4–5", topics: ["YouTube Studio deep-dive", "Copyright, community guidelines & monetization", "Shorts & long-form content strategy", "Analytics & audience growth", "Brand outreach systems & pitch decks"] },
      { week: "Month 6–7", topics: ["AI Tools for YouTube & free AI toolkit", "Viral content research", "Live streaming & upload workflow", "Digital product launch & sales funnels"] },
      { week: "Month 8+", topics: ["Backup & security tips", "Team building & workflow automation", "Scaling to ₹1L+ per month", "Long-term brand partnerships & licensing"] },
    ],
    schedule: "1:1 weekly mentor calls + group masterminds",
    batchStart: "Rolling admissions — apply now",
    includes: [
      "1:1 Weekly Mentor Calls",
      "121+ Live Group Sessions",
      "Recorded Sessions — Lifetime Access",
      "Doubt Clearing Sessions",
      "Full Team WhatsApp Support",
      "Regular Curriculum Updates",
      "Step-by-Step Practical Projects",
      "Free AI Tools Toolkit",
      "YouTube Monetization Guidance",
      "Brand Deal Templates & Pitch Decks",
      "Digital Product Launch Playbook",
      "Verified Certificate on Completion",
      "Premium Learning Experience",
    ],
  },
  {
    id: "generative-ai-master",
    title: "Generative AI Master Program",
    tagline: "Coming Soon",
    price: 0,
    duration: "TBA",
    support: "TBA",
    status: "coming-soon",
    thumbnail: courseGenerativeAi,
    gallery: [],
    overview: "",
    outcomes: [],
    tools: [],
    syllabus: [],
    schedule: "",
    batchStart: "",
  },
  {
    id: "ai-video-generation-masterclass",
    title: "AI Video Generation Masterclass",
    tagline: "Coming Soon",
    price: 0,
    duration: "TBA",
    support: "TBA",
    status: "coming-soon",
    thumbnail: courseShorts,
    gallery: [],
    overview: "",
    outcomes: [],
    tools: [],
    syllabus: [],
    schedule: "",
    batchStart: "",
  },
  {
    id: "google-veo-video-generation",
    title: "Google Veo Video Generation",
    tagline: "Coming Soon",
    price: 0,
    duration: "TBA",
    support: "TBA",
    status: "coming-soon",
    thumbnail: coursePlaceholder,
    gallery: [],
    overview: "",
    outcomes: [],
    tools: [],
    syllabus: [],
    schedule: "",
    batchStart: "",
  },
  {
    id: "google-omni-ai-course",
    title: "Google Omni AI Course",
    tagline: "Coming Soon",
    price: 0,
    duration: "TBA",
    support: "TBA",
    status: "coming-soon",
    thumbnail: coursePlaceholder,
    gallery: [],
    overview: "",
    outcomes: [],
    tools: [],
    syllabus: [],
    schedule: "",
    batchStart: "",
  },
  {
    id: "ai-avatar-video-creation",
    title: "AI Avatar Video Creation",
    tagline: "Coming Soon",
    price: 0,
    duration: "TBA",
    support: "TBA",
    status: "coming-soon",
    thumbnail: coursePlaceholder,
    gallery: [],
    overview: "",
    outcomes: [],
    tools: [],
    syllabus: [],
    schedule: "",
    batchStart: "",
  },
  {
    id: "ai-talking-video-creation",
    title: "AI Talking Video Creation",
    tagline: "Coming Soon",
    price: 0,
    duration: "TBA",
    support: "TBA",
    status: "coming-soon",
    thumbnail: coursePlaceholder,
    gallery: [],
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
    thumbnail: coursePlaceholder,
    gallery: [],
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
    thumbnail: coursePlaceholder,
    gallery: [],
    overview: "",
    outcomes: [],
    tools: [],
    syllabus: [],
    schedule: "",
    batchStart: "",
  },
];

// Banner slides for homepage carousel
export type Banner = {
  id: string;
  courseId?: string;
  image: string;
  title: string;
  description: string;
  price?: string;
  seatsBadge?: string;
  ctaLabel: string;
  isPlaceholder?: boolean;
};

export const BANNERS: Banner[] = [
  {
    id: "b1",
    courseId: "yt-ai-master",
    image: courseYtAi,
    title: "YouTube All Creator Master Program",
    description: "Beginner-to-pro system with live mentorship, AI tools & monetization.",
    price: "₹9,999",
    seatsBadge: "Only 12 Seats Left",
    ctaLabel: "Enroll Now",
  },
  {
    id: "b2",
    courseId: "premium-monetization",
    image: courseMonetization,
    title: "Premium Monetization Mentorship",
    description: "1-on-1 weekly mentor calls. Scale beyond ₹1L/month.",
    price: "₹24,999",
    seatsBadge: "Only 5 Seats Left",
    ctaLabel: "Enroll Now",
  },
  {
    id: "b3",
    courseId: "generative-ai-master",
    image: courseGenerativeAi,
    title: "Generative AI Master Program",
    description: "Master generative AI for content creation. Batch launching soon.",
    price: "Coming Soon",
    seatsBadge: "Join Waitlist",
    ctaLabel: "Notify Me",
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
