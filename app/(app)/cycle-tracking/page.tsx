"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Heart, Sparkles, Stethoscope } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTodayMood, saveDailyMood } from "@/lib/health-actions";

const MOOD_MESSAGES: Record<string, string> = {
  terrible: "Sending you a gentle hug. Be extra kind to yourself today. 🤍",
  bad: "It's completely okay to have off days. Take it easy and rest up. ☁️",
  okay: "Steady and balanced! Make sure to keep taking care of yourself. 🌱",
  good: "Glad you're having a good day! Let's keep that positive energy flowing. ☀️",
  great: "Love to see it! Harness that amazing energy today! ✨"
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
        setFeedbackMsg({ 
          type: "success", 
          text: data.state === "started" ? "Cycle started! Predictions updated." : "Cycle ended! Period logged." 
        });
        setSelectedDate(undefined);
        // Refresh analytics dynamically
        const newAnalytics = await fetch("/api/cycle-tracking/analytics").then(res => res.json());
        setAnalytics(newAnalytics);
      } else {
        setFeedbackMsg({ type: "error", text: "Failed to log cycle." });
      }
    } catch(err) {
      setFeedbackMsg({ type: "error", text: "Error logging cycle." });
    }
    setIsLogging(false);
  };

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
        <div className="flex flex-col gap-6 w-full max-w-[500px]">
          <Card className="w-full shadow-xl border-primary/15 bg-card">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Menstrual Calendar</CardTitle>
              <CardDescription className="text-[0.95rem]">
                Track your cycle to predict upcoming phases
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 gap-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-xl border border-primary/10 shadow-sm p-4 sm:p-6 bg-background w-full"
              />
              {selectedDate && (
                <Button 
                   onClick={handleLogPeriod} 
                   disabled={isLogging} 
                   className="w-full max-w-[200px]"
                >
                  {isLogging ? "Saving..." : "Log Period"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Mood Tracker Card */}
          <Card className={`w-full shadow-lg border-primary/20 bg-gradient-to-br from-card to-card/90 transition-opacity duration-300 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">How are you feeling today?</CardTitle>
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
          <Card className="w-full shadow-md border-primary/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Cycle Insights</CardTitle>
              <CardDescription>Analytics based on your tracking</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {!analytics ? (
                <div className="h-[100px] flex items-center justify-center rounded-xl border border-dashed border-primary/20 bg-muted/10">
                  <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading insights...</p>
                </div>
              ) : !analytics.hasData ? (
                <div className="h-[100px] flex items-center justify-center rounded-xl border border-dashed border-primary/20 bg-muted/10">
                  <p className="text-muted-foreground text-sm font-medium">{analytics.message}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                     <p className="text-xs uppercase text-primary font-bold mb-1">Current Phase</p>
                     <p className="text-lg font-semibold">{analytics.currentPhase} (Day {analytics.dayOfCycle})</p>
                  </div>
                  <div>
                     <p className="text-sm font-semibold mb-1">Expected Mood</p>
                     <p className="text-sm text-muted-foreground leading-snug">{analytics.expectedMood}</p>
                  </div>
                  <div>
                     <p className="text-sm font-semibold mb-2">Recommendations</p>
                     {analytics.recommendations?.map((tip: any, i: number) => (
                       <div key={i} className="mb-2 bg-muted/30 p-2 rounded-lg">
                         <p className="text-sm font-medium text-foreground">{tip.tipTitle || "Tip"}</p>
                         <p className="text-xs text-muted-foreground mt-1">{tip.tipDescription}</p>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cycle Predictions Card */}
          <Card className="w-full shadow-md border-primary/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Cycle Predictions</CardTitle>
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
                      <p className="text-xs uppercase text-primary font-bold mb-1">Period Ends</p>
                      <p className="text-sm font-semibold">
                        {analytics.latestCycle?.expectedPeriodEnd && !isNaN(new Date(analytics.latestCycle.expectedPeriodEnd).getTime()) 
                          ? new Date(analytics.latestCycle.expectedPeriodEnd).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                          : 'Pending'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase text-primary font-bold mb-1">Next Period Starts</p>
                      <p className="text-sm font-semibold">
                        {analytics.latestCycle?.predictedEndDate && !isNaN(new Date(analytics.latestCycle.predictedEndDate).getTime())
                          ? new Date(analytics.latestCycle.predictedEndDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                          : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Check-up Card */}
          <Card className="w-full shadow-sm border-secondary/30 bg-secondary/5 relative overflow-hidden group">
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
