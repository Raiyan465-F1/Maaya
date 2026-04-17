"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Heart, Sparkles, Stethoscope } from "lucide-react";
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
  const [date, setDate] = useState<Date | undefined>(new Date());
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
  }, []);

  return (
    <div className="flex flex-col h-full items-center pt-10">
      <div className="text-center mb-8">
        <p className="font-mono text-xs tracking-widest text-primary uppercase mb-3">Cycle Tracking</p>
        <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight mb-2">
          Your <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">cycle</span>
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">Calendar, analysis, and insights.</p>
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-start px-4 sm:px-8">
        <div className="flex flex-col gap-6 w-full max-w-[500px]">
          <Card className="w-full shadow-xl border-primary/15 bg-card">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Menstrual Calendar</CardTitle>
              <CardDescription className="text-[0.95rem]">Track your cycle to predict upcoming phases</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-6 pb-8">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                modifiers={{ predicted: predictedDates, fertile: fertileDates }}
                modifiersClassNames={{ 
                  predicted: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold",
                  fertile: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold" 
                }}
                className="rounded-xl border border-primary/10 shadow-sm p-4 sm:p-6 bg-background w-full max-w-[420px]"
              />
            </CardContent>
          </Card>

          <Card className="w-full shadow-md border-primary/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Cycle Configuration</CardTitle>
              <CardDescription>Adjust your expected cycle length</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Expected Length (Days)</label>
                    <Input type="number" value={predictedLength} onChange={(e) => setPredictedLength(parseInt(e.target.value))} />
                  </div>
                  {dateRange?.from && dateRange?.to && (
                     <div className="py-2 px-3 bg-primary/10 rounded-md border border-primary/20">
                       <p className="text-sm text-foreground">Actual Length: <strong>{Math.floor((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} Days</strong></p>
                     </div>
                  )}
                  <Button onClick={handleSaveCycle} disabled={!dateRange?.from || isSaving} className="w-full">
                    {isSaving ? "Saving..." : "Log Cycle Data"}
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 w-full">
          {/* Status Checkup */}
          <Card className="w-full shadow-lg border-transparent relative overflow-hidden group">
            {cycleStatus && cycleStatus.status === "SUCCESS" ? (
              <div className={`absolute inset-0 opacity-[0.15] bg-gradient-to-br ${
                cycleStatus.phase === "Menstrual" ? "from-rose-500 to-pink-500" :
                cycleStatus.phase === "Follicular" ? "from-emerald-400 to-teal-500" :
                cycleStatus.phase === "Ovulation" ? "from-amber-400 to-orange-500" :
                cycleStatus.phase === "Luteal" ? "from-indigo-500 to-purple-500" : "from-slate-400 to-slate-600"
              }`} />
            ) : (
               <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary to-secondary" />
            )}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500 pointer-events-none group-hover:rotate-12 group-hover:scale-110">
              <Sparkles className="w-32 h-32 text-foreground" />
            </div>
            
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center gap-2 font-bold tracking-tight text-foreground/80">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-xs uppercase tracking-wider">Your Body Today</span>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {!cycleStatus ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="space-y-2"><div className="h-4 bg-muted rounded"></div><div className="h-4 bg-muted rounded w-5/6"></div></div>
                  </div>
                </div>
              ) : cycleStatus.status === "NO_DATA" ? (
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-foreground">Awaiting Cycle Data</h3>
                  <p className="text-muted-foreground text-sm">{cycleStatus.message}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-end border-b border-foreground/10 pb-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Current Phase</p>
                      <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        {cycleStatus.phase} (Day {cycleStatus.dayOfCycle})
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Predicted Mood</p>
                      <span className="inline-block px-3 py-1 bg-background/60 rounded-full text-sm font-semibold border border-foreground/10 shadow-sm backdrop-blur-md">
                        {cycleStatus.predictedMood}
                      </span>
                    </div>
                  </div>
                  <div className="bg-background/40 p-4 rounded-xl backdrop-blur-sm border border-foreground/5 mt-2 transition-all hover:bg-background/60 shadow-sm">
                    <h4 className="font-bold text-foreground mb-1 flex items-center gap-2">
                       <Stethoscope className="w-4 h-4 text-primary" />
                       {cycleStatus.advice?.tipTitle}
                    </h4>
                    <p className="text-foreground/80 text-sm leading-relaxed">{cycleStatus.advice?.tipDescription}</p>
                  </div>
                </div>
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

          <Card className="w-full shadow-md border-primary/10 bg-card/60 backdrop-blur-sm -mt-2">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-lg flex items-center gap-2"><LineChart className="w-5 h-5 text-primary" />Cycle Consistency Tracker</CardTitle>
              <CardDescription>Your expected cycle targets vs real physical timeline</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLogs.length > 0 ? (
                <div className="w-full h-[200px] flex items-end justify-around gap-2 pt-10 pb-0 relative">
                  <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-primary/40 flex items-center">
                    <span className="absolute -top-5 left-1 text-[10px] text-muted-foreground uppercase font-bold tracking-wider opacity-60">Predictive Trend Line</span>
                  </div>
                  {historyLogs.map((log: any, idx: number) => {
                     const target = log.predictedCycleLength || 28;
                     const actual = log.actualCycleLength || target;
                     const heightPercentage = Math.min(100, (actual / 45) * 100);
                     const isUnder = actual < target;
                     const isOver = actual > target;
                     return (
                       <div key={log.id || idx} className="flex flex-col items-center gap-2 group w-full max-w-[50px] relative z-10 h-full justify-end">
                         <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-foreground text-background shadow-lg text-xs font-bold px-2 py-1 rounded transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                            {actual} Days
                         </div>
                         <div className="w-full relative flex items-end justify-center h-full">
                           <div className={`w-full max-w-[28px] rounded-t-[4px] transition-all duration-700 ease-in-out hover:brightness-[1.2] shadow-sm ${isUnder ? 'bg-amber-400 dark:bg-amber-500' : isOver ? 'bg-indigo-400 dark:bg-indigo-500' : 'bg-primary dark:bg-primary/80'}`} style={{ height: `${heightPercentage}%`, minHeight: '10%' }}/>
                         </div>
                         <span className="text-[10px] font-semibold text-muted-foreground mt-1">{new Date(log.startDate).toLocaleDateString(undefined, { month: 'short' })}</span>
                       </div>
                     );
                  })}
                </div>
              ) : (
                <div className="h-[150px] w-full flex items-center justify-center text-sm font-semibold opacity-50 bg-secondary/10 rounded-xl my-4 border border-dashed border-secondary">
                  Logging more cycles safely opens your historical analytics chart.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
