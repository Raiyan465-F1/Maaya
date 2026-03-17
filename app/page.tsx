"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

import { verifiedDoctors } from "@/lib/verified-doctors";

/* ─── Navbar ─────────────────────────────────────────────── */
function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-primary/15 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="font-heading text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
            MAAYA
          </span>
          <span className="hidden sm:inline text-xs text-muted-foreground font-medium tracking-wide">
            Smart Women&apos;s Health
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground">
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#verified-doctors" className="hover:text-primary transition-colors">Doctors</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#for-professionals" className="hover:text-primary transition-colors">For Doctors</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="/login"
            className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            Log In
          </a>
          <a
            href="/register"
            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-gradient-to-r from-primary to-accent rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            Register
          </a>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-primary/15 px-6 py-4 flex flex-col gap-4 text-sm font-medium text-foreground">
          <a href="#about" onClick={() => setMobileOpen(false)} className="hover:text-primary">About</a>
          <a href="#features" onClick={() => setMobileOpen(false)} className="hover:text-primary">Features</a>
          <a href="#verified-doctors" onClick={() => setMobileOpen(false)} className="hover:text-primary">Doctors</a>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="hover:text-primary">How It Works</a>
          <a href="#for-professionals" onClick={() => setMobileOpen(false)} className="hover:text-primary">For Doctors</a>
          <div className="flex gap-3 pt-2 border-t border-primary/15">
            <a href="/login" className="flex-1 text-center px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
              Log In
            </a>
            <a href="/register" className="flex-1 text-center px-4 py-2 text-primary-foreground bg-gradient-to-r from-primary to-accent rounded-lg hover:opacity-90">
              Register
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Hero preview cards ──────────────────────────────────── */
const calDots = [
  "bg-muted/70", "bg-muted/70", "bg-secondary/60", "bg-secondary/70", "bg-secondary/70", "bg-muted/70", "bg-muted/70",
  "bg-muted/70", "bg-muted/70", "bg-muted/70", "bg-muted/70", "bg-primary ring-2 ring-primary/30", "bg-primary/25", "bg-primary/15",
  "bg-muted/50", "bg-muted/70", "bg-muted/70", "bg-muted/70", "bg-muted/70", "bg-muted/70", "bg-muted/50",
  "bg-muted/30", "bg-muted/30", "bg-secondary/30", "bg-secondary/50", "bg-secondary/65", "bg-secondary/70", "bg-secondary/55",
];

function HeroPreviewCards() {
  return (
    <div className="hidden lg:flex flex-col gap-4 w-64 xl:w-72 flex-shrink-0">
      {/* Cycle calendar preview */}
      <div className="bg-card rounded-2xl border border-primary/12 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-foreground">Cycle Tracking</span>
          <span className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full tabular-nums">
            Day 12
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calDots.map((cls, i) => (
            <div key={i} className={`w-5 h-5 rounded-full ${cls}`} />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-secondary/70" />
            <span className="text-[10px] text-muted-foreground">Period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] text-muted-foreground">Today</span>
          </div>
        </div>
      </div>

      {/* Forum post preview */}
      <div className="bg-card rounded-2xl border border-secondary/12 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            #cycles
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
            Anonymous
          </span>
        </div>
        <p className="text-xs text-foreground leading-relaxed mb-3">
          &ldquo;Has anyone tracked their cycle with PCOS? Would love to hear your experiences with symptom logging...&rdquo;
        </p>
        <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
          <span>↑ 38</span>
          <span>12 replies</span>
        </div>
      </div>

      {/* Doctor Q&A preview */}
      <div className="bg-card rounded-2xl border border-accent/12 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-[10px] font-semibold">
            Dr
          </div>
          <div>
            <p className="text-[10px] font-medium text-foreground">Dr. Nadia Islam</p>
            <p className="text-[10px] text-muted-foreground">Verified ✓</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          &ldquo;Irregular cycles are common with PCOS. Tracking over 3+ months gives the best data...&rdquo;
        </p>
      </div>
    </div>
  );
}

/* ─── Hero ────────────────────────────────────────────────── */
function LandingHero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background pt-16">
      {/* Repositioned blobs — less symmetrical */}
      <div aria-hidden className="pointer-events-none absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full bg-secondary/15 blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 min-h-[calc(100vh-4rem)] flex flex-col justify-center lg:flex-row lg:items-center lg:gap-16 py-20">
        {/* Left / main content — left-aligned */}
        <div className="flex-1 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-primary/10 text-primary border border-primary/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Smart Women&apos;s Health Platform
          </span>

          <h1 className="font-heading text-5xl sm:text-6xl lg:text-[5.5rem] font-bold text-foreground leading-[1.05] tracking-tight mb-6">
            Your health,{" "}
            <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              your story
            </span>
            ,<br />
            your space.
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
            MAAYA is a safe, supportive platform for reproductive health education,
            cycle tracking, community discussion, and expert guidance — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <a
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent rounded-xl shadow-md hover:opacity-90 transition-all duration-200"
            >
              Join Us — It&apos;s Free
            </a>
            <a
              href="#about"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-primary bg-card border border-primary/30 rounded-xl hover:bg-primary/5 transition-all duration-200"
            >
              Learn More
            </a>
          </div>

          {/* Stats row — DM Mono numbers */}
          <div className="mt-12 flex items-center gap-10 pt-8 border-t border-border/50">
            {[
              { value: "100%", label: "Anonymous friendly" },
              { value: "Free", label: "Always free to join" },
              { value: "Safe", label: "Private & secure" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-2xl font-medium text-foreground tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — feature preview cards */}
        <HeroPreviewCards />
      </div>
    </section>
  );
}

/* ─── About ───────────────────────────────────────────────── */
function AboutSection() {
  return (
    <section id="about" className="py-24 bg-card">
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest text-primary uppercase mb-4 text-center">
          Our Story
        </p>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-heading text-4xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              Breaking the silence{" "}
              <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                around women&apos;s health
              </span>
            </h2>

            <p className="text-muted-foreground text-base leading-relaxed mb-4">
              Masuma was a young woman who experienced her first menstrual cycle without any
              prior guidance. The fear and confusion she felt — largely because of social stigma
              around reproductive health — was something she shouldn&apos;t have had to face alone.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              MAAYA was built to change that. We believe every woman deserves access to accurate,
              non-judgmental information about her own body — without shame, without barriers.
            </p>

            <div className="flex flex-col gap-3">
              {[
                "Accessible reproductive health education for everyone",
                "A safe community to ask questions anonymously",
                "Expert guidance from verified health professionals",
                "Tools to understand and track your own cycle",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm text-foreground">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pull quote card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/8 to-secondary/8 rounded-3xl p-8 border border-primary/10">
              <span className="font-heading text-7xl text-primary/20 leading-none select-none">&ldquo;</span>
              <blockquote className="font-heading text-xl italic font-normal text-foreground leading-relaxed -mt-4 mb-6">
                If accessible and supportive guidance had been available, the situation would
                have been far less distressing.
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  M
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Masuma&apos;s story</p>
                  <p className="text-xs text-muted-foreground">The inspiration behind MAAYA</p>
                </div>
              </div>
            </div>

            {/* Floating stat cards — DM Mono numbers */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-lg border border-primary/10 px-5 py-3">
              <p className="font-mono text-xl font-medium text-primary">22+</p>
              <p className="text-xs text-muted-foreground">Core features</p>
            </div>
            <div className="absolute -top-6 -right-6 bg-card rounded-2xl shadow-lg border border-secondary/10 px-5 py-3">
              <p className="font-mono text-xl font-medium text-secondary">Open</p>
              <p className="text-xs text-muted-foreground">Community forum</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ────────────────────────────────────────────── */
const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    iconClass: "bg-primary/10 text-primary",
    title: "Cycle Tracking",
    description: "Log and visualize your menstrual cycle, track symptoms, predict your next cycle, and understand your fertile window — all in a private calendar view.",
    highlights: ["Cycle calendar", "Symptom logging", "Next cycle prediction", "Pregnancy likelihood"],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 10h8M8 14h5" />
      </svg>
    ),
    iconClass: "bg-secondary/10 text-secondary",
    title: "Educational Hub",
    description: "Browse curated articles on reproductive health, STI awareness, and sexual education. Take quizzes to reinforce your learning.",
    highlights: ["Curated articles", "Topic categories", "Search & recommendations", "Knowledge quizzes"],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
    iconClass: "bg-accent/15 text-accent",
    title: "Community Forum",
    description: "Ask questions, share experiences, and support each other in a moderated, Reddit-style forum. Post anonymously whenever you need privacy.",
    highlights: ["Anonymous posting", "Upvoting system", "Threaded discussions", "Moderated & safe"],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3l3 3 3-3h4a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
        <path d="M8 12h.01M12 12h.01M16 12h.01" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    iconClass: "bg-primary/10 text-primary",
    title: "Doctor's Help",
    description: "Browse verified medical professionals and submit your questions directly. Get expert, trustworthy answers from qualified doctors.",
    highlights: ["Verified doctor directory", "Direct Q&A", "Expert-reviewed content", "Professional profiles"],
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14">
          <p className="font-mono text-xs tracking-widest text-primary uppercase mb-3">
            What MAAYA Offers
          </p>
          <h2 className="font-heading text-4xl font-bold text-foreground leading-[1.1] tracking-tight">
            Everything you need,{" "}
            <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              in one place
            </span>
          </h2>
        </div>

        {/* Editorial list layout */}
        <div className="divide-y divide-border/50">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="py-10 flex gap-6 md:gap-10 items-start group"
            >
              {/* Number */}
              <span className="font-mono text-lg tabular-nums text-muted-foreground/40 pt-1.5 w-8 flex-shrink-0 group-hover:text-primary/50 transition-colors">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Content: title+icon on left, description on right at md+ */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-4 md:gap-12 items-start">
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${f.iconClass}`}>
                    {f.icon}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground leading-snug">
                    {f.title}
                  </h3>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {f.description}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {f.highlights.map((h) => (
                      <li
                        key={h}
                        className="text-xs px-2.5 py-1 rounded-full border border-border/70 text-muted-foreground"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ────────────────────────────────────────── */
const steps = [
  { step: "01", title: "Create your account", description: "Sign up in minutes — optionally anonymously. Your data stays private and you're always in control of what you share." },
  { step: "02", title: "Set up your profile", description: "Tell MAAYA a little about yourself. The more context you provide, the more personalized your dashboard and cycle insights will be." },
  { step: "03", title: "Track & learn", description: "Log your cycle, read educational articles, take quizzes, and explore topics tailored to your health journey." },
  { step: "04", title: "Connect with community", description: "Ask questions in the forum, read peer experiences, and get answers from verified doctors — all in a safe, moderated space." },
];

function HowItHelpsSection() {
  return (
    <section id="how-it-works" className="py-24 bg-card">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <p className="font-mono text-xs tracking-widest text-primary uppercase mb-3">
            How It Works
          </p>
          <h2 className="font-heading text-4xl font-bold text-foreground leading-[1.1] tracking-tight">
            Getting started is{" "}
            <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              simple
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl text-base mt-4">
            MAAYA is designed to be welcoming from day one — no medical background required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="flex flex-col">
              {/* DM Mono step number — large, light, distinctive */}
              <span className="font-mono text-5xl font-light text-primary/20 leading-none mb-5 tabular-nums">
                {s.step}
              </span>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg hover:opacity-90 transition-all duration-200"
          >
            Start your journey
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── For Professionals ───────────────────────────────────── */
function VerifiedDoctorsSection() {
  const featuredDoctors = verifiedDoctors.slice(0, 3);

  return (
    <section id="verified-doctors" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div>
            <p className="font-mono text-xs tracking-widest text-primary uppercase mb-3">
              Trusted Experts
            </p>
            <h2 className="font-heading text-4xl font-bold text-foreground leading-[1.1] tracking-tight">
              Meet our{" "}
              <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                verified doctors
              </span>
            </h2>
            <p className="text-muted-foreground text-base mt-4 max-w-2xl">
              MAAYA works with verified doctors who answer questions and guide users with
              professional, evidence-based advice.
            </p>
          </div>

          <Link
            href="/verified-doctors"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent rounded-xl shadow-sm hover:opacity-90 transition-opacity"
          >
            View all doctors
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {featuredDoctors.map((doctor) => (
            <Link
              key={doctor.id}
              href={`/verified-doctors/${doctor.id}`}
              className="group bg-card rounded-2xl border border-border p-5 hover:border-primary/35 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-xl font-semibold text-foreground leading-tight">
                  {doctor.name}
                </p>
                <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  Verified
                </span>
              </div>
              <p className="text-sm text-primary font-medium mt-2">{doctor.specialty}</p>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                {doctor.bio}
              </p>
              <p className="text-xs font-medium text-primary mt-4 group-hover:underline">
                View doctor profile
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForProfessionals() {
  return (
    <section id="for-professionals" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual card */}
          <div className="order-2 lg:order-1">
            <div className="relative bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary-foreground" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                    <path d="M12 17v4M8 21h8" />
                    <path d="M9 11h.01M12 11h.01M15 11h.01" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">Verified Professional</p>
                  <p className="text-sm text-muted-foreground">Doctor / Health Contributor</p>
                </div>
                <span className="ml-auto text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                  Verified ✓
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { label: "Answer community questions", icon: "💬" },
                  { label: "Maintain a professional profile", icon: "👤" },
                  { label: "Provide expert health guidance", icon: "🩺" },
                  { label: "Help educate users directly", icon: "📚" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-primary/10">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <p className="font-mono text-xs tracking-widest text-secondary uppercase mb-4">
              For Healthcare Professionals
            </p>
            <h2 className="font-heading text-4xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              Join MAAYA as a{" "}
              <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                verified expert
              </span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-4">
              Are you a doctor, gynecologist, or reproductive health professional? MAAYA is
              looking for qualified contributors to answer user questions and provide
              trustworthy guidance to women who need it most.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              After a verification process, you&apos;ll have a professional profile on the platform
              where you can engage with the community, answer Q&amp;As, and make a real difference.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:contact@maaya.health"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent rounded-xl shadow-sm hover:opacity-90 transition-opacity"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3z" />
                  <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839z" />
                </svg>
                Contact Us
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-all"
              >
                Learn about verification
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────── */
function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-primary/15">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-2">
            <span className="font-heading text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
              MAAYA
            </span>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xs">
              A safe, supportive platform for reproductive health education, cycle tracking,
              and community connection.
            </p>
            <p className="text-xs text-muted-foreground mt-4">Built with care by the MAAYA team.</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-4">Platform</p>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              {[
                { label: "Cycle Tracking", href: "#features" },
                { label: "Educational Hub", href: "#features" },
                { label: "Community Forum", href: "#features" },
                { label: "Doctor's Help", href: "#features" },
                { label: "Verified Doctors", href: "/verified-doctors" },
                { label: "Dashboard", href: "/login" },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-primary transition-colors">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-4">Company</p>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              {[
                { label: "About MAAYA", href: "#about" },
                { label: "For Doctors", href: "#for-professionals" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Privacy Policy", href: "#" },
                { label: "Contact Us", href: "mailto:contact@maaya.health" },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-primary transition-colors">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">&copy; {currentYear} MAAYA. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">
            Built for reproductive health education — not for medical diagnosis.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <LandingHero />
      <AboutSection />
      <FeaturesSection />
      <HowItHelpsSection />
      <VerifiedDoctorsSection />
      <ForProfessionals />
      <LandingFooter />
    </div>
  );
}
