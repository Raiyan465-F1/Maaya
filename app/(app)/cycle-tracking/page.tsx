"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Sparkles, Stethoscope } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CycleTrackingPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dailyMessage, setDailyMessage] = useState({ title: "Loading...", body: "" });
  const [flyingHearts, setFlyingHearts] = useState<{ id: number; tx: number; ty: number }[]>([]);

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

  useEffect(() => {
    // Mount algorithm hook to prevent SSR hydration mismatch
    import("@/lib/daily-messages").then((mod) => {
      setDailyMessage(mod.getDailyMessage());
    });
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
            <CardContent className="flex justify-center pt-6 pb-8">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-xl border border-primary/10 shadow-sm p-4 sm:p-6 bg-background w-full max-w-[420px]"
              />
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
          {/* Insights Card Placeholder */}
          <Card className="w-full shadow-md border-primary/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Cycle Insights</CardTitle>
              <CardDescription>Analytics based on your tracking</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center rounded-xl border border-dashed border-primary/20 bg-muted/10 mx-6 mb-6">
              <p className="text-muted-foreground text-sm font-medium">More data needed for insights</p>
            </CardContent>
          </Card>

          {/* Mood Tracker Card */}
          <Card className="w-full shadow-lg border-primary/20 bg-gradient-to-br from-card to-card/90">
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
                ].map((m) => (
                  <button
                    key={m.id}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all hover:bg-background hover:shadow-sm hover:scale-105 group w-full"
                  >
                    <span className="text-3xl grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                      {m.emoji}
                    </span>
                    <span className="text-[0.7rem] font-medium text-muted-foreground group-hover:text-foreground">
                      {m.label}
                    </span>
                  </button>
                ))}
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

        </div>
      </div>
    </div>
  );
}
