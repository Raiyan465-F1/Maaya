import { Heart, Activity, Droplets, CalendarClock, Smile, Moon, Thermometer, Wind, Lightbulb, BookOpen, ShieldAlert } from "lucide-react";
import Link from "next/link";


export function CycleRingWidget() {
  return (
    <div className="flex flex-col items-center justify-center py-8 relative">
      {/* Background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-teal-50 blur-3xl opacity-50 dark:opacity-20 pointer-events-none" />
      
      {/* The Cycle Ring */}
      <Link 
        href="/cycle-tracking"
        className="relative w-64 h-64 rounded-full p-2 bg-white dark:bg-card shadow-xl shadow-black/5 z-10 flex items-center justify-center group transition-transform hover:scale-105 duration-500 cursor-pointer"
      >
        {/* Colorful gradient border ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 opacity-20 group-hover:opacity-30 transition-opacity" />
        
        {/* Inner circle */}
        <div className="relative w-full h-full rounded-full border-[6px] border-white dark:border-card bg-gradient-to-b bg-teal-50 dark:bg-background flex flex-col items-center justify-center shadow-inner">
          <p className="text-xs uppercase tracking-[0.2em] font-bold mb-1 opacity-70 text-teal-500">
            Ovulation
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold opacity-50">Day</span>
            <span className="text-7xl font-heading font-black tracking-tighter text-teal-500 drop-shadow-sm">
              14
            </span>
          </div>
          <p className="text-sm font-medium opacity-80 mt-2 flex items-center gap-1.5">
            <CalendarClock className="w-4 h-4" />
            14 days to period
          </p>
        </div>
      </Link>

      
      {/* Quick Action Buttons (Flo style) */}
      <div className="flex flex-wrap items-center justify-center gap-8 mt-12 z-10">
        <Link 
          href="/cycle-tracking"
          className="flex items-center gap-4 px-12 py-6 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 transition-all duration-300 font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
        >
          <Droplets className="w-5 h-5 fill-rose-500 text-rose-500" />
          <span className="whitespace-nowrap uppercase tracking-wider">Log Period</span>
        </Link>
        <Link 
          href="/cycle-tracking"
          className="flex items-center gap-4 px-12 py-6 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all duration-300 font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
        >
          <Activity className="w-5 h-5" />
          <span className="whitespace-nowrap uppercase tracking-wider">Log Symptoms</span>
        </Link>
      </div>

    </div>
  );
}

export function HealthMetricsGrid({ todayMood, todaySymptoms }: { todayMood?: string | null, todaySymptoms?: string }) {
  const moodMap: Record<string, { emoji: string; label: string }> = {
    terrible: { emoji: "😫", label: "Terrible" },
    bad: { emoji: "😕", label: "Bad" },
    okay: { emoji: "😐", label: "Okay" },
    good: { emoji: "🙂", label: "Good" },
    great: { emoji: "😄", label: "Great" },
  };

  const moodData = todayMood && moodMap[todayMood] ? moodMap[todayMood] : { emoji: "😶", label: "Not logged" };

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Mood Card */}
      <Link 
        href="/cycle-tracking"
        className="rounded-[48px] p-10 min-h-[200px] shadow-sm border-0 bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-col hover:bg-indigo-100/50 transition-all duration-500 group cursor-pointer"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full group-hover:scale-110 transition-transform">
            <Smile className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="text-sm font-bold text-indigo-900/60 dark:text-indigo-100/60 uppercase tracking-widest">Mood</h3>
        </div>
        <div className="flex items-center gap-4 bg-white/60 dark:bg-black/40 p-5 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm w-full">
          <span className="text-3xl">{moodData.emoji}</span>
          <div>
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-widest">{moodData.label}</p>
          </div>
        </div>
      </Link>

      {/* Symptoms Card */}
      <Link 
        href="/cycle-tracking"
        className="rounded-[48px] p-10 min-h-[200px] shadow-sm border-0 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col hover:bg-rose-100/50 transition-all duration-500 group cursor-pointer"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-rose-100 dark:bg-rose-900/50 rounded-full group-hover:scale-110 transition-transform">
            <Wind className="w-6 h-6 text-rose-500" />
          </div>
          <h3 className="text-sm font-bold text-rose-900/60 dark:text-rose-100/60 uppercase tracking-widest">Symptoms</h3>
        </div>
        <div className="bg-white/60 dark:bg-black/40 p-5 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm w-full h-full flex items-center">
          <p className="text-sm font-bold text-rose-900 dark:text-rose-100 leading-tight uppercase tracking-wide">{todaySymptoms || "None logged"}</p>
        </div>
      </Link>

    </div>
  );
}

export function SmartInsightsCarousel() {
  return (
    <Link 
      href="/cycle-tracking" 
      className="rounded-[32px] border-0 bg-amber-50/80 p-6 dark:bg-amber-950/20 shadow-sm flex items-start gap-4 hover:bg-amber-100/80 transition-all duration-300 cursor-pointer group"
    >
      <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
        <Heart className="w-6 h-6 text-amber-500" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">Fertile Window</h4>
        <p className="mt-1 text-sm font-medium text-amber-800/80 dark:text-amber-200/80">You are likely entering your fertile window today. Chances of pregnancy are high.</p>
      </div>
    </Link>

  );
}

export function FunFactsWidget() {
  const facts = [
    "The average person spends about 38.5 days brushing their teeth over their lifetime.",
    "Your heart pumps about 2,000 gallons of blood every single day.",
    "During a typical menstrual cycle, estrogen levels can fluctuate by more than 200%.",
    "Laughing for 10-15 minutes can burn up to 40 calories!"
  ];
  const fact = facts[Math.floor(Math.random() * facts.length)];

  return (
    <div className="mt-8 rounded-[32px] p-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden group">
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <Lightbulb className="w-5 h-5 text-yellow-200" />
          </div>
          <h4 className="font-black text-xs uppercase tracking-widest text-white/80">Health Fact</h4>
        </div>
        <p className="text-base font-bold leading-relaxed italic text-white">
          "{fact}"
        </p>
      </div>
    </div>
  );
}

export function FeaturedArticlesWidget() {
  const articles = [
    {
      id: 1,
      title: "Understanding Hormonal Fluctuations",
      hub: "Education",
      icon: <BookOpen className="w-3 h-3" />,
      color: "bg-blue-500",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&h=200&fit=crop"
    },
    {
      id: 2,
      title: "STI Prevention: A Comprehensive Guide",
      hub: "STI Awareness",
      icon: <ShieldAlert className="w-3 h-3" />,
      color: "bg-rose-500",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&fit=crop"
    },
    {
      id: 3,
      title: "The Importance of Regular Checkups",
      hub: "Education",
      icon: <BookOpen className="w-3 h-3" />,
      color: "bg-emerald-500",
      image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=200&h=200&fit=crop"
    },
    {
      id: 4,
      title: "Nutrition Tips for Cycle Balance",
      hub: "Education",
      icon: <BookOpen className="w-3 h-3" />,
      color: "bg-amber-500",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=200&fit=crop"
    },
    {
      id: 5,
      title: "Common Myths About STI Transmission",
      hub: "STI Awareness",
      icon: <ShieldAlert className="w-3 h-3" />,
      color: "bg-purple-500",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&h=200&fit=crop"
    },
    {
      id: 6,
      title: "Mental Health and the Menstrual Cycle",
      hub: "Education",
      icon: <BookOpen className="w-3 h-3" />,
      color: "bg-indigo-500",
      image: "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=200&h=200&fit=crop"
    }
  ];

  return (
    <div className="mt-8 rounded-[32px] p-6 bg-white/60 dark:bg-black/20 backdrop-blur-xl border-0 shadow-sm">
      <div className="flex items-center justify-between mb-6 px-2">
        <h4 className="font-black text-xs uppercase tracking-widest text-foreground/70">Recommended Reads</h4>
        <Link href="/education" className="text-[10px] font-bold text-primary hover:underline cursor-pointer">View All</Link>

      </div>
      
      <div className="space-y-4">
        {articles.map((article) => (
          <Link 
            key={article.id} 
            href={article.hub === "Education" ? "/education" : "/sti-awareness"}
            className="flex items-center gap-4 group cursor-pointer"
          >
            <div className="relative shrink-0">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-16 h-16 rounded-2xl object-cover shadow-sm transition-transform group-hover:scale-105 duration-300"
              />
              <div className={`absolute -top-1 -left-1 ${article.color} text-white p-1 rounded-lg shadow-sm`}>
                {article.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-wider mb-0.5">{article.hub}</p>
              <h5 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h5>
            </div>
          </Link>
        ))}

      </div>
    </div>
  );
}
