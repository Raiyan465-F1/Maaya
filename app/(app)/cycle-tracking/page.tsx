"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Heart, Sparkles, Stethoscope, ArrowRight, CalendarClock, Activity, Baby, Scale, Ruler, Droplets, Flame, CalendarHeart, Smile, Clock, Lightbulb, FileEdit } from "lucide-react";
import { DateRange } from "react-day-picker";
import { isSameDay, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getTodayMood, saveDailyMood } from "@/lib/health-actions";
import { OnboardingJourney } from "@/components/onboarding-journey";

const MOOD_MESSAGES: Record<string, string> = {
  terrible: "Sending you a gentle hug. Be extra kind to yourself today. 🤍",
  bad: "It's completely okay to have off days. Take it easy and rest up. ☁️",
  okay: "Steady and balanced! Make sure to keep taking care of yourself. 🌱",
  good: "Glad you're having a good day! Let's keep that positive energy flowing. ☀️",
  great: "Love to see it! Harness that amazing energy today! ✨"
};

const getDaysColor = (days: number) => {
  if (days <= 3) return "text-red-500 font-bold";
  if (days <= 7) return "text-orange-500 font-bold";
  return "text-green-500 font-bold";
};

export default function CycleTrackingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isLogging, setIsLogging] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [dailyMessage, setDailyMessage] = useState({ title: "Loading...", body: "" });
  const [flyingHearts, setFlyingHearts] = useState<{ id: number; tx: number; ty: number }[]>([]);
  
  const [isPending, startTransition] = useTransition();
  const [lockedMood, setLockedMood] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [calFeedback, setCalFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [insightForm, setInsightForm] = useState({
    weight: "",
    height: "",
    pregnancyStatus: "",
    vaginalDischarge: "",
    sex: "",
    sexDrive: ""
  });
  const [isUpdatingHealth, setIsUpdatingHealth] = useState(false);

  useEffect(() => {
    if (analytics?.userStats) {
      setInsightForm(prev => ({
        ...prev,
        weight: analytics.userStats.weight || "",
        height: analytics.userStats.height || ""
      }));
    }
  }, [analytics]);

  const handleUpdateHealth = async () => {
    setIsUpdatingHealth(true);
    try {
      await fetch("/api/cycle-tracking/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(insightForm)
      });
      const newAnalytics = await fetch("/api/cycle-tracking/analytics").then(res => res.json());
      setAnalytics(newAnalytics);
    } catch(err) {
      console.error(err);
    }
    setIsUpdatingHealth(false);
  };

  const handleHeartClick = () => {
    const newHearts = Array.from({ length: 3 }).map(() => ({
      id: Math.random(),
      tx: (Math.random() - 0.5) * 120, // Spread X 
      ty: (Math.random() - 0.8) * 120, // Mostly spread Upwards Y
    }));
    
    setFlyingHearts((prev) => [...prev, ...newHearts]);

    // Remove from DOM precisely after 1 second per requirement
    setTimeout(() => {
      setFlyingHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 1000);
  };

  const handleMoodSelect = (moodId: string, moodLabel: string) => {
    if (lockedMood) return; // Locked 24 hrs natively natively prevents client firing

    setFeedbackMsg(null);
    startTransition(async () => {
      const localToday = new Date().toLocaleDateString("en-CA");
      const result = await saveDailyMood(moodId, localToday);
      
      if (result.error) {
        setFeedbackMsg({ type: "error", text: result.error });
      } else {
        setLockedMood(moodId);
        setFeedbackMsg({ type: "success", text: MOOD_MESSAGES[moodId] || `Locked in! You're feeling ${moodLabel} today. 🌸` });
      }
    });
  };

  const handleLogPeriod = async () => {
    if (!selectedDate) return;
    if (selectedDate > new Date()) {
      setCalFeedback({ type: "error", text: "You cannot log a period for a future date." });
      return;
    }
    setCalFeedback(null);
    setIsLogging(true);
    try {
      const resp = await fetch("/api/cycle-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: selectedDate
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setCalFeedback({ 
          type: "success", 
          text: "Period start logged! Tracking active." 
        });
        setSelectedDate(undefined);
        // Refresh analytics dynamically
        const newAnalytics = await fetch("/api/cycle-tracking/analytics").then(res => res.json());
        setAnalytics(newAnalytics);
      } else {
        setCalFeedback({ type: "error", text: "Failed to log cycle." });
      }
    } catch(err) {
      setCalFeedback({ type: "error", text: "Error logging cycle." });
    }
    setIsLogging(false);
  };

  const handleEndPeriod = async () => {
    if (!selectedDate) return;
    if (selectedDate > new Date()) {
      setCalFeedback({ type: "error", text: "You cannot log an end date for a future date." });
      return;
    }
    setCalFeedback(null);
    setIsLogging(true);
    try {
      const resp = await fetch("/api/cycle-tracking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endDate: selectedDate
        })
      });
      if (resp.ok) {
        setCalFeedback({ type: "success", text: "Period end date logged successfully!" });
        setSelectedDate(undefined);
        const newAnalytics = await fetch("/api/cycle-tracking/analytics").then(res => res.json());
        setAnalytics(newAnalytics);
      } else {
        const errorData = await resp.json();
        setCalFeedback({ type: "error", text: errorData.error || "Failed to log end date." });
      }
    } catch(err) {
      setCalFeedback({ type: "error", text: "Error logging end date." });
    }
    setIsLogging(false);
  };

  const isActiveCycle = analytics?.latestCycle && !analytics.latestCycle.endDate;

  useEffect(() => {
    // Mount algorithm hook to prevent SSR hydration mismatch
    import("@/lib/daily-messages").then((mod) => {
      setDailyMessage(mod.getDailyMessage());
    });

    // Cross-verify with Neon database if the user already logged in today
    const localToday = new Date().toLocaleDateString("en-CA");
    getTodayMood(localToday).then((fetchedMood) => {
      if (fetchedMood) {
        setLockedMood(fetchedMood);
      }
    });

    // Fetch cycle analytics
    fetch("/api/cycle-tracking/analytics")
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex flex-col h-full items-center pt-10">
      <div className="text-center mb-8">
        <p className="font-mono text-xs tracking-widest text-primary uppercase mb-3">
          Cycle Tracking
        </p>
        <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight mb-2">
          Your{" "}
          <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            cycle
          </span>
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
          Calendar, analysis, and insights.
        </p>
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-start px-4 sm:px-8">
        {analytics && !analytics.hasData && !analytics.isOnboarded && (
          <div className="col-span-full mb-4">
            <Card className="w-full overflow-hidden border-none shadow-2xl bg-gradient-to-br from-primary/20 via-rose-50 to-orange-50 dark:from-primary/10 dark:via-background dark:to-orange-950/20">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center justify-between p-8 gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                      <Sparkles className="w-4 h-4" />
                      New Feature
                    </div>
                    <h2 className="text-4xl font-bold mb-4 tracking-tight">Your Cycle Journey <span className="italic text-primary">Starts Here</span></h2>
                    <p className="text-muted-foreground text-lg mb-8 max-w-xl leading-relaxed">
                      Welcome to Maaya's cycle tracking. Answer a few questions to unlock personalized predictions, health insights, and wellness tips tailored just for you.
                    </p>
                    <Button 
                      onClick={() => setShowOnboarding(true)}
                      size="lg" 
                      className="rounded-2xl px-10 py-7 text-xl font-bold shadow-xl hover:scale-105 transition-all shadow-primary/20"
                    >
                      Start Your Journey
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  </div>
                  <div className="relative w-full max-w-[300px] aspect-square flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <Heart className="w-48 h-48 text-primary fill-primary/10 animate-pulse relative z-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showOnboarding && (
          <OnboardingJourney onComplete={() => {
            setShowOnboarding(false);
            fetch("/api/cycle-tracking/analytics")
              .then(res => res.json())
              .then(data => setAnalytics(data));
          }} onClose={() => setShowOnboarding(false)} />
        )}

        <div className="flex flex-col gap-6 w-full max-w-[400px]">
          <Card className={`w-full shadow-2xl border-2 transition-all duration-300 ${isActiveCycle ? 'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 shadow-rose-200' : 'border-rose-200/50 bg-rose-50/30 dark:bg-rose-950/10'}`}>
            <CardHeader className="text-center pb-2 relative overflow-hidden">
              {isActiveCycle && (
                 <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-400 via-red-500 to-rose-400 animate-pulse" />
              )}
              <CardTitle className="text-2xl flex items-center justify-center gap-2 text-rose-900 dark:text-rose-100">
                <CalendarHeart className={`w-7 h-7 ${isActiveCycle ? 'text-red-500 animate-pulse' : 'text-rose-400'}`} />
                {isActiveCycle ? 'Period is Active' : 'Menstrual Calendar'}
              </CardTitle>
              <CardDescription className="text-[0.95rem] font-medium">
                {isActiveCycle ? 'Don\'t forget to log your end date when it finishes.' : 'Select a date to log your period start.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4 pb-8 gap-5">
              <style>{`
                .rdp-day_button { position: relative !important; transition: all 0.2s ease; }
                .rdp-day_button:hover { transform: scale(1.1); z-index: 10; }
                .logged-period-day {
                  outline: 2px solid #ef4444 !important;
                  border-radius: 8px;
                  background-color: rgba(239, 68, 68, 0.1) !important;
                }
                .logged-period-day .rdp-day_button::after {
                  content: '';
                  position: absolute;
                  bottom: 2px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background-color: #ef4444 !important;
                  box-shadow: 0 0 4px rgba(255,0,0,0.6);
                  z-index: 50;
                }
                .active-cycle-start .rdp-day_button {
                  background-color: #ef4444 !important;
                  color: white !important;
                  font-weight: bold;
                  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
                }
              `}</style>
              <div className="p-1 bg-white dark:bg-black/40 rounded-2xl shadow-inner border border-rose-100 dark:border-rose-900/30">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={{ after: new Date() }}
                  className="rounded-xl border-none p-3 sm:p-5 w-full bg-transparent"
                  modifiers={{
                    periodStart: (analytics?.periodStartDates || []).map((d: string) => {
                      const [year, month, day] = d.split('T')[0].split('-').map(Number);
                      return new Date(year, month - 1, day);
                    }),
                    activeStart: isActiveCycle ? [
                      new Date(
                        Number(analytics.latestCycle.startDate.split('-')[0]),
                        Number(analytics.latestCycle.startDate.split('-')[1]) - 1,
                        Number(analytics.latestCycle.startDate.split('-')[2].substring(0, 2))
                      )
                    ] : []
                  }}
                  modifiersClassNames={{
                    periodStart: "logged-period-day",
                    activeStart: "active-cycle-start"
                  }}
                />
              </div>
              
              <div className="w-full flex flex-col items-center gap-3 mt-2">
                {selectedDate && (
                  <div className="w-full max-w-[280px] animate-in fade-in zoom-in-95 duration-300">
                    {isActiveCycle ? (
                      <Button 
                         onClick={handleEndPeriod} 
                         disabled={isLogging} 
                         variant="default"
                         className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white shadow-lg shadow-red-500/30 font-bold py-6 text-lg rounded-xl transition-all active:scale-95"
                      >
                        <Heart className="w-5 h-5 mr-2 fill-white/20" />
                        {isLogging ? "Saving..." : `Log End Date (${selectedDate.toLocaleDateString()})`}
                      </Button>
                    ) : (
                      <Button 
                         onClick={handleLogPeriod} 
                         disabled={isLogging} 
                         className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white shadow-lg shadow-pink-500/20 font-bold py-6 text-lg rounded-xl transition-all active:scale-95"
                      >
                        <Droplets className="w-5 h-5 mr-2" />
                        {isLogging ? "Saving..." : `Log Period Start (${selectedDate.toLocaleDateString()})`}
                      </Button>
                    )}
                  </div>
                )}
                
                {isActiveCycle && !selectedDate && (
                  <div className="text-center animate-pulse text-rose-600 dark:text-rose-400 font-medium text-sm flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" /> Select a date above to end period
                  </div>
                )}

                {calFeedback && (
                  <div className={`px-4 py-2 rounded-lg text-sm font-bold mt-1 animate-in slide-in-from-bottom-2 fade-in duration-300 ${calFeedback.type === 'error' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200"}`}>
                    {calFeedback.text}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mood Tracker Card */}
          <Card className={`w-full shadow-lg border-indigo-200/50 bg-indigo-50/30 dark:bg-indigo-950/20 transition-opacity duration-300 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                <Smile className="w-5 h-5 text-indigo-500" />
                How are you feeling today?
              </CardTitle>
              <CardDescription>Track your daily mood to see cycle trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center bg-muted/40 p-2 rounded-2xl border border-border/50">
                {[
                  { id: "terrible", emoji: "😫", label: "Terrible" },
                  { id: "bad", emoji: "😕", label: "Bad" },
                  { id: "okay", emoji: "😐", label: "Okay" },
                  { id: "good", emoji: "🙂", label: "Good" },
                  { id: "great", emoji: "😄", label: "Great" },
                ].map((m) => {
                  const isSelected = lockedMood === m.id;
                  const isBlurred = lockedMood && lockedMood !== m.id;
                  
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleMoodSelect(m.id, m.label)}
                      disabled={!!lockedMood || isPending}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-500 group w-full 
                        ${isSelected ? 'bg-primary/20 ring-2 ring-primary scale-105 shadow-sm my-2' : ''} 
                        ${isBlurred ? 'opacity-30 grayscale blur-[1px] hover:scale-100 hover:bg-transparent' : 'hover:bg-background hover:shadow-sm hover:scale-105'}
                      `}
                    >
                      <span className={`text-3xl transition-all duration-300 ${isSelected ? 'grayscale-0 drop-shadow-md' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                        {m.emoji}
                      </span>
                      <span className={`text-[0.7rem] font-medium transition-colors ${isSelected ? 'text-primary drop-shadow-md' : 'text-muted-foreground group-hover:text-foreground'}`}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Secure 24-hr Lock Feedback Display */}
              <div className="mt-3 flex flex-col sm:flex-row items-center justify-between min-h-[3rem] gap-2">
                <div className="flex-1 text-center sm:text-left">
                  {feedbackMsg && (
                    <p className={`text-sm font-semibold animate-in slide-in-from-top-2 fade-in duration-500 ${feedbackMsg.type === 'error' ? "text-destructive" : "text-primary"}`}>
                      {feedbackMsg.text}
                    </p>
                  )}
                  {lockedMood && !feedbackMsg && (
                    <p className="text-sm font-medium text-muted-foreground delay-500 animate-in fade-in">
                      {MOOD_MESSAGES[lockedMood] || "Your mood is safely tracked for today."}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor's Help Card */}
          <Card className="w-full shadow-md border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
            <CardHeader className="pb-3 text-center">
              <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2 w-fit">
                <Stethoscope className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Facing a problem?</CardTitle>
              <CardDescription className="text-sm">
                Consult our verified doctors here.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Link href="/doctors-help" className="w-full sm:w-auto">
                <Button className="w-full sm:min-w-[200px] rounded-xl text-md font-semibold transition-all hover:scale-105 shadow-md">
                  Get Help
                </Button>
              </Link>
            </CardContent>
          </Card>


        </div>
        {/* Right Column: Insights & Mood */}
        <div className="hidden lg:flex flex-col gap-6 w-full">
          {/* Insights Card */}
          <Dialog>
            <DialogTrigger asChild>
              <Card className="w-full shadow-md border-purple-200/50 bg-purple-50/40 dark:bg-purple-950/20 cursor-pointer hover:bg-purple-100/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-purple-900 dark:text-purple-100">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Cycle Insights
                  </CardTitle>
                  <CardDescription>Click to view and update your health data</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {!analytics ? (
                    <div className="h-[100px] flex items-center justify-center rounded-xl border border-dashed border-purple-200 bg-muted/10">
                      <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading insights...</p>
                    </div>
                  ) : !analytics.hasData ? (
                    <div className="h-[100px] flex items-center justify-center rounded-xl border border-dashed border-purple-200 bg-muted/10">
                      <p className="text-muted-foreground text-sm font-medium">{analytics.message}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900 flex flex-col gap-1">
                           <p className="text-xs uppercase text-purple-600 dark:text-purple-400 font-bold mb-1 flex items-center gap-1"><CalendarClock className="w-3 h-3"/> Period In</p>
                           <p className={`text-2xl ${getDaysColor(analytics.daysUntilNextPeriod)}`}>{analytics.daysUntilNextPeriod} <span className="text-sm font-medium text-muted-foreground">Days</span></p>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900 flex flex-col gap-1">
                           <p className="text-xs uppercase text-purple-600 dark:text-purple-400 font-bold mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3"/> Phase</p>
                           <p className="text-lg font-bold text-purple-700 dark:text-purple-300 truncate">{analytics.currentPhase}</p>
                           <p className="text-xs text-muted-foreground">Day {analytics.dayOfCycle}</p>
                        </div>
                      </div>
                      <div className="mt-1 bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900">
                         <p className="text-sm font-semibold mb-1 text-purple-700 dark:text-purple-300 flex items-center gap-2"><Activity className="w-4 h-4"/> Symptoms You Might Feel</p>
                         <p className="text-sm text-muted-foreground leading-snug">{analytics.predictedSymptoms}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </DialogTrigger>
            {analytics?.hasData && (
              <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100 text-xl">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Detailed Cycle Insights
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Update your daily health status and see extended insights.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-5 mt-2">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-4 rounded-xl border border-purple-100 dark:border-purple-900 shadow-sm">
                     <p className="text-xs uppercase text-purple-600 dark:text-purple-400 font-bold mb-1 flex items-center gap-1.5"><Activity className="w-4 h-4"/> Current Phase</p>
                     <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{analytics.currentPhase} <span className="text-base font-medium text-purple-700/70 dark:text-purple-300/70">(Day {analytics.dayOfCycle})</span></p>
                  </div>
                  
                  <div>
                     <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-1.5 flex items-center gap-2"><Smile className="w-4 h-4"/> Expected Mood</p>
                     <p className="text-sm text-muted-foreground leading-relaxed bg-indigo-50/40 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100/50 dark:border-indigo-900/50">{analytics.expectedMood}</p>
                  </div>
                  
                  <div>
                     <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-2.5 flex items-center gap-2"><Lightbulb className="w-4 h-4"/> Recommendations</p>
                     {analytics.recommendations?.map((tip: any, i: number) => (
                       <div key={i} className="mb-2 bg-amber-50/40 dark:bg-amber-950/20 p-3 rounded-lg border-l-4 border-amber-400 shadow-sm">
                         <p className="text-sm font-bold text-amber-900 dark:text-amber-100">{tip.tipTitle || "Tip"}</p>
                         <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-1 leading-snug">{tip.tipDescription}</p>
                       </div>
                     ))}
                  </div>

                  <div className="mt-2 pt-5 border-t border-border/50">
                    <h4 className="font-bold text-foreground mb-4 flex items-center gap-2"><FileEdit className="w-5 h-5 text-purple-500"/> Update Daily Health Logs</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold mb-1 flex items-center gap-1"><Scale className="w-3 h-3"/> Weight</label>
                        <Input value={insightForm.weight} onChange={(e) => setInsightForm(p => ({...p, weight: e.target.value}))} placeholder="e.g. 60kg" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-1 flex items-center gap-1"><Ruler className="w-3 h-3"/> Height</label>
                        <Input value={insightForm.height} onChange={(e) => setInsightForm(p => ({...p, height: e.target.value}))} placeholder="e.g. 165cm" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-1 flex items-center gap-1"><Baby className="w-3 h-3"/> Pregnancy Status</label>
                        <select 
                          className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${insightForm.pregnancyStatus === 'Yes' ? 'text-green-600 bg-green-50 font-bold border-green-200' : insightForm.pregnancyStatus === 'No' ? 'text-red-600 bg-red-50 font-bold border-red-200' : 'bg-background'}`}
                          value={insightForm.pregnancyStatus} 
                          onChange={(e) => setInsightForm(p => ({...p, pregnancyStatus: e.target.value}))}
                        >
                          <option value="">Select...</option>
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-1 flex items-center gap-1"><Droplets className="w-3 h-3"/> Vaginal Discharge</label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={insightForm.vaginalDischarge} onChange={(e) => setInsightForm(p => ({...p, vaginalDischarge: e.target.value}))}>
                          <option value="">Select...</option>
                          <option value="None">None</option>
                          <option value="Clear">Clear</option>
                          <option value="White/Cloudy">White/Cloudy</option>
                          <option value="Sticky">Sticky</option>
                          <option value="Egg White">Egg White</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-1 flex items-center gap-1"><Heart className="w-3 h-3"/> Sex</label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={insightForm.sex} onChange={(e) => setInsightForm(p => ({...p, sex: e.target.value}))}>
                          <option value="">Select...</option>
                          <option value="None">None</option>
                          <option value="Protected">Protected</option>
                          <option value="Unprotected">Unprotected</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-1 flex items-center gap-1"><Flame className="w-3 h-3"/> Sex Drive</label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={insightForm.sexDrive} onChange={(e) => setInsightForm(p => ({...p, sexDrive: e.target.value}))}>
                          <option value="">Select...</option>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>
                    <Button onClick={handleUpdateHealth} disabled={isUpdatingHealth} className="w-full mt-6 font-bold text-md py-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/20 border-0 transition-all active:scale-95">
                      {isUpdatingHealth ? "Saving..." : "Save Logs"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>

          {/* Cycle Predictions Card */}
          <Card className="w-full shadow-md border-amber-200/50 bg-amber-50/40 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <Clock className="w-5 h-5 text-amber-500" />
                Cycle Predictions
              </CardTitle>
              <CardDescription>Estimated dates for your cycle</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {!analytics ? (
                <div className="h-[100px] flex items-center justify-center rounded-xl border border-dashed border-primary/20 bg-muted/10">
                  <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading predictions...</p>
                </div>
              ) : !analytics.hasData ? (
                <div className="h-[100px] flex items-center justify-center rounded-xl border border-dashed border-primary/20 bg-muted/10">
                  <p className="text-muted-foreground text-sm font-medium">Log a period to see predictions.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex justify-between items-center">
                    <div>
                      <p className="text-xs uppercase text-primary font-bold mb-1">Next Period Starts</p>
                      <p className="text-sm font-semibold">
                        {analytics.latestCycle?.predictedEndDate && !isNaN(new Date(analytics.latestCycle.predictedEndDate).getTime())
                          ? new Date(analytics.latestCycle.predictedEndDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                          : 'Pending'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase text-primary font-bold mb-1">Next Period Ends</p>
                      <p className="text-sm font-semibold">
                        {analytics.latestCycle?.expectedPeriodEnd && !isNaN(new Date(analytics.latestCycle.expectedPeriodEnd).getTime()) 
                          ? new Date(analytics.latestCycle.expectedPeriodEnd).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                          : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generalized Medical Suggestions Card */}
          <Card className={`w-full shadow-md border-teal-200/50 transition-colors ${analytics?.healthStatus?.status === 'Warning' ? 'bg-red-50 dark:bg-red-950/20 border-red-200' : analytics?.healthStatus?.status === 'Excellent' ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : 'bg-teal-50/40 dark:bg-teal-950/20'}`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className={`w-5 h-5 ${analytics?.healthStatus?.status === 'Warning' ? 'text-red-500' : analytics?.healthStatus?.status === 'Excellent' ? 'text-green-500' : 'text-primary'}`} />
                Medical Suggestions
              </CardTitle>
              <CardDescription>Based on your current cycle data</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {!analytics ? (
                <div className="h-[50px] flex items-center justify-center rounded-xl border border-dashed border-primary/20 bg-muted/10">
                  <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading status...</p>
                </div>
              ) : !analytics.hasData ? (
                <div className="h-[50px] flex items-center justify-center rounded-xl border border-dashed border-primary/20 bg-muted/10">
                  <p className="text-muted-foreground text-sm font-medium">Log a period to see suggestions.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className={`p-4 rounded-xl border ${analytics?.healthStatus?.status === 'Warning' ? 'bg-red-100 border-red-200 dark:bg-red-900/40' : analytics?.healthStatus?.status === 'Excellent' ? 'bg-green-100 border-green-200 dark:bg-green-900/40' : 'bg-primary/5 border-primary/10'}`}>
                    <p className={`text-sm font-bold mb-1 ${analytics?.healthStatus?.status === 'Warning' ? 'text-red-700 dark:text-red-400' : analytics?.healthStatus?.status === 'Excellent' ? 'text-green-700 dark:text-green-400' : 'text-primary'}`}>
                      {analytics.healthStatus?.message || "Reproductive system seems fine."}
                    </p>
                    <p className="text-sm text-foreground/80 leading-snug">
                      {analytics.healthStatus?.details || "Everything appears to be within normal ranges."}
                    </p>
                  </div>
                  {analytics?.healthStatus?.status === 'Warning' && (
                     <Link href="/doctors-help" className="w-full mt-2">
                        <Button variant="destructive" className="w-full font-bold shadow-md">
                          Ask for Consultation
                        </Button>
                     </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Check-up Card */}
          <Card className="w-full shadow-sm border-pink-200/50 bg-pink-50/40 dark:bg-pink-950/20 relative overflow-hidden group">
            <style>{`
              @keyframes pop-heart {
                0% { transform: translate(-50%, -50%) scale(0.2) rotate(0deg); opacity: 0.8; }
                40% { opacity: 1; }
                100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.5) rotate(15deg); opacity: 0; }
              }
            `}</style>
            <div 
              className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-all duration-500 cursor-pointer z-10 active:scale-95"
              onClick={handleHeartClick}
            >
              <Heart className="w-24 h-24 text-secondary rotate-12 fill-secondary/20 transition-transform active:rotate-0" />
              
              {flyingHearts.map((h) => (
                <Heart 
                  key={h.id}
                  className="absolute top-1/2 left-1/2 w-10 h-10 text-pink-500 fill-pink-500 pointer-events-none drop-shadow-md"
                  style={{ 
                    '--tx': `${h.tx}px`, 
                    '--ty': `${h.ty}px`,
                    animation: 'pop-heart 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
                  } as React.CSSProperties}
                />
              ))}
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-secondary font-semibold">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs uppercase tracking-wider text-primary">Daily Check-up</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1 transition-opacity duration-500">
                <h3 className="text-lg font-bold text-foreground">{dailyMessage.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {dailyMessage.body}
                </p>
              </div>
            </CardContent>
          </Card>





        </div>
      </div>
    </div>
  );
}
