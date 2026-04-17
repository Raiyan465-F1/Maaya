"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Droplets, Sparkles, Stethoscope, LineChart, Minus, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

export default function CycleTrackingPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  
  const [predictedLength, setPredictedLength] = useState<number>(28);
  const [isSaving, setIsSaving] = useState(false);
  const [cycleStatus, setCycleStatus] = useState<any>(null);
  const [predictedDates, setPredictedDates] = useState<Date[]>([]);
  const [fertileDates, setFertileDates] = useState<Date[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);

  // Symptom States
  const [mood, setMood] = useState<string>("");
  const [flowIntensity, setFlowIntensity] = useState<string | null>(null);
  const [waterIntake, setWaterIntake] = useState<number>(0);

  useEffect(() => {
    fetch('/api/cycle-tracking/status')
      .then(r => r.json())
      .then(data => {
         setCycleStatus(data);
         if (data.fertileWindowStart && data.fertileWindowEnd) {
            const start = new Date(data.fertileWindowStart);
            const end = new Date(data.fertileWindowEnd);
            let arr: Date[] = [];
            let curr = new Date(start);
            while (curr <= end) {
               arr.push(new Date(curr));
               curr.setDate(curr.getDate() + 1);
            }
            setFertileDates(arr);
         }
      })
      .catch(console.error);

    fetch('/api/cycle-tracking')
      .then(r => r.json())
      .then(data => {
         if (data.cycleLogs) {
           setHistoryLogs([...data.cycleLogs].reverse());
         }
         const latestLog = data.cycleLogs?.[0];
         if (latestLog?.predictedEndDate) {
            const start = new Date(latestLog.predictedEndDate);
            let arr = [];
            for (let i = 0; i < 5; i++) {
               const d = new Date(start);
               d.setDate(d.getDate() + i);
               arr.push(d);
            }
            setPredictedDates(arr);
         }
      })
      .catch(console.error);
  }, []);

  const handleLogSymptom = async (updates: { mood?: string, flowIntensity?: string | null, waterIntake?: number }) => {
    if (updates.mood !== undefined) setMood(updates.mood);
    if (updates.flowIntensity !== undefined) setFlowIntensity(updates.flowIntensity);
    if (updates.waterIntake !== undefined) setWaterIntake(updates.waterIntake);

    const payload = {
      mood: updates.mood !== undefined ? updates.mood : mood,
      flowIntensity: updates.flowIntensity !== undefined ? updates.flowIntensity : flowIntensity,
      waterIntake: updates.waterIntake !== undefined ? updates.waterIntake : waterIntake,
    };

    try {
      await fetch('/api/cycle-tracking/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveCycle = async () => {
    if (!dateRange?.from) return;
    setIsSaving(true);
    try {
      await fetch('/api/cycle-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to ? dateRange.to.toISOString() : null,
          predictedCycleLength: predictedLength,
        }),
      });
      // Optionally trigger re-fetch of history here
      window.location.reload(); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

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

          <Card className="w-full shadow-sm border-secondary/20 bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-lg">Daily Symptoms & Insights</CardTitle>
              <CardDescription>Keep track of how your body feels for better pattern predictions.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 pt-4">
              <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground/80">Mood</h4>
                <div className="flex flex-wrap gap-2">
                  {["😊 Happy", "😢 Sad", "😡 Angry", "😴 Tired", "🤒 Sick", "😌 Calm"].map((m) => (
                    <Button key={m} variant={mood === m ? "default" : "outline"} className="rounded-full shadow-sm hover:scale-105 transition-transform" onClick={() => handleLogSymptom({ mood: m })}>{m}</Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="text-sm font-semibold mb-3 text-foreground/80">Flow Intensity</h4>
                   <div className="flex flex-wrap gap-2">
                      {["Light", "Medium", "Heavy"].map((flow) => (
                         <Button key={flow} variant={flowIntensity === flow ? "default" : "outline"} className={`rounded-full shadow-sm hover:scale-105 transition-all outline-none ${flowIntensity === flow ? "bg-rose-500 hover:bg-rose-600 text-white border-transparent" : "border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"}`} onClick={() => handleLogSymptom({ flowIntensity: flow })}>
                            <Droplets className={`w-4 h-4 mr-1 ${flowIntensity === flow ? 'text-white' : flow === 'Heavy' ? 'text-rose-600' : flow === 'Medium' ? 'text-rose-400' : 'text-rose-300'}`} />
                            {flow}
                         </Button>
                      ))}
                   </div>
                </div>
                <div>
                   <h4 className="text-sm font-semibold mb-3 text-foreground/80 flex items-center gap-1">Water Intake <span className="text-xs text-muted-foreground font-normal">(Glasses)</span></h4>
                   <div className="flex items-center gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded-xl border border-blue-100 dark:border-blue-900/30 w-max">
                      <Button variant="outline" size="icon" className="rounded-full h-8 w-8 border-blue-200 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40" onClick={() => handleLogSymptom({ waterIntake: Math.max(0, waterIntake - 1) })}><Minus className="w-4 h-4 cursor-pointer" /></Button>
                      <span className="text-xl font-black text-blue-600 dark:text-blue-400 w-6 text-center">{waterIntake}</span>
                      <Button variant="outline" size="icon" className="rounded-full h-8 w-8 border-blue-200 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40" onClick={() => handleLogSymptom({ waterIntake: waterIntake + 1 })}><Plus className="w-4 h-4 cursor-pointer" /></Button>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full shadow-md border-indigo-500/20 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 block animate-pulse"></span>
                Pregnancy Likelihood
              </CardTitle>
              <CardDescription>Estimated based on your cycle phase</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <div>
                    <h4 className="font-bold text-indigo-950 dark:text-indigo-100 mb-1">Status</h4>
                    <p className={`text-sm font-semibold px-2 py-1 inline-flex rounded-md ${cycleStatus?.phase === "Ovulation" ? "bg-red-500 text-white" : cycleStatus?.phase === "Follicular" || cycleStatus?.phase === "Luteal" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"}`}>
                      {cycleStatus?.phase === "Ovulation" ? "High (Fertile Window)" : cycleStatus?.phase === "Follicular" || cycleStatus?.phase === "Luteal" ? "Medium (Outside peak)" : "Low (Menstrual phase)"}
                    </p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-indigo-950 dark:text-indigo-100 mb-1">Peak Dates</h4>
                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                      {cycleStatus?.fertileWindowStart ? `${new Date(cycleStatus.fertileWindowStart).toLocaleDateString(undefined, {month: "short", day: "numeric"})} - ${new Date(cycleStatus.fertileWindowEnd).toLocaleDateString(undefined, {month: "short", day: "numeric"})}` : "Calculating..."}
                    </p>
                  </div>
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
