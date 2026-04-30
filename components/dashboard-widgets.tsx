import { Heart, Activity, Droplets, CalendarClock, Smile, Moon, Thermometer, Wind } from "lucide-react";

export function CycleRingWidget() {
  return (
    <div className="flex flex-col items-center justify-center py-8 relative">
      {/* Background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-teal-50 blur-3xl opacity-50 dark:opacity-20 pointer-events-none" />
      
      {/* The Cycle Ring */}
      <div className="relative w-64 h-64 rounded-full p-2 bg-white dark:bg-card shadow-xl shadow-black/5 z-10 flex items-center justify-center group transition-transform hover:scale-105 duration-500 cursor-pointer">
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
      </div>
      
      {/* Quick Action Buttons (Flo style) */}
      <div className="flex flex-wrap items-center justify-center gap-8 mt-12 z-10">
        <button className="flex items-center gap-4 px-12 py-6 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 transition-all duration-300 font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95">
          <Droplets className="w-5 h-5 fill-rose-500 text-rose-500" />
          <span className="whitespace-nowrap uppercase tracking-wider">Log Period</span>
        </button>
        <button className="flex items-center gap-4 px-12 py-6 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all duration-300 font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95">
          <Activity className="w-5 h-5" />
          <span className="whitespace-nowrap uppercase tracking-wider">Log Symptoms</span>
        </button>
      </div>
    </div>
  );
}

export function HealthMetricsGrid() {
  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Mood Card */}
      <div className="rounded-[48px] p-10 min-h-[260px] shadow-sm border-0 bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-col justify-between hover:bg-indigo-100/50 transition-all duration-500 group">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full group-hover:scale-110 transition-transform">
            <Smile className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="text-sm font-bold text-indigo-900/60 dark:text-indigo-100/60 uppercase tracking-widest">Mood</h3>
        </div>
        <div className="flex items-center gap-4 bg-white/60 dark:bg-black/40 p-5 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-auto w-full">
          <span className="text-3xl">🙂</span>
          <div>
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-widest">Good</p>
          </div>
        </div>
      </div>

      {/* Sleep Card */}
      <div className="rounded-[48px] p-10 min-h-[300px] shadow-sm border-0 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col justify-between hover:bg-blue-100/50 transition-all duration-500 group">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-full group-hover:scale-110 transition-transform">
            <Moon className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-sm font-bold text-blue-900/60 dark:text-blue-100/60 uppercase tracking-widest">Sleep</h3>
        </div>
        <div className="bg-white/60 dark:bg-black/40 p-5 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-auto w-full">
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">7<span className="text-sm font-medium opacity-60 ml-1">hr</span> 30<span className="text-sm font-medium opacity-60 ml-1">m</span></p>
        </div>
      </div>

      {/* Temp Card */}
      <div className="rounded-[48px] p-10 min-h-[300px] shadow-sm border-0 bg-orange-50/50 dark:bg-orange-950/20 flex flex-col justify-between hover:bg-orange-100/50 transition-all duration-500 group">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-900/50 rounded-full group-hover:scale-110 transition-transform">
            <Thermometer className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-sm font-bold text-orange-900/60 dark:text-orange-100/60 uppercase tracking-widest">BBT</h3>
        </div>
        <div className="bg-white/60 dark:bg-black/40 p-5 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-auto w-full">
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">36.5<span className="text-sm font-medium opacity-60 ml-1">°C</span></p>
        </div>
      </div>

      {/* Symptoms Card */}
      <div className="rounded-[48px] p-10 min-h-[300px] shadow-sm border-0 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col justify-between hover:bg-rose-100/50 transition-all duration-500 group">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-rose-100 dark:bg-rose-900/50 rounded-full group-hover:scale-110 transition-transform">
            <Wind className="w-6 h-6 text-rose-500" />
          </div>
          <h3 className="text-sm font-bold text-rose-900/60 dark:text-rose-100/60 uppercase tracking-widest">Symptoms</h3>
        </div>
        <div className="bg-white/60 dark:bg-black/40 p-5 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-auto w-full">
          <p className="text-sm font-bold text-rose-900 dark:text-rose-100 leading-tight uppercase tracking-wide">Mild Cramps, Headaches</p>
        </div>
      </div>
    </div>
  );
}

export function SmartInsightsCarousel() {
  return (
    <div className="rounded-[32px] border-0 bg-amber-50/80 p-6 dark:bg-amber-950/20 shadow-sm flex items-start gap-4">
      <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-2xl shrink-0">
        <Heart className="w-6 h-6 text-amber-500" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">Fertile Window</h4>
        <p className="mt-1 text-sm font-medium text-amber-800/80 dark:text-amber-200/80">You are likely entering your fertile window today. Chances of pregnancy are high.</p>
      </div>
    </div>
  );
}
