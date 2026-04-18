"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Sparkles, Calendar, Clock, Activity, 
  Droplets, Thermometer, Brain, Moon, 
  Coffee, Zap, Target, Bell, ArrowRight, ArrowLeft, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

interface QuizData {
  averageCycleLength: number;
  height: string;
  weight: string;
  regularity: string;
  flowIntensity: string;
  periodSymptoms: string[];
  concerns: string[];
  stressLevel: string;
  sleepHours: string;
  activityLevel: string;
  hydration: string;
  primaryGoal: string;
  notificationsEnabled: boolean;
}

const QUESTIONS = [
  {
    id: "welcome",
    title: "Welcome to Maaya",
    description: "Your journey to holistic cycle awareness starts here. Let's customize your experience with a few quick questions.",
    type: "welcome",
    icon: Sparkles
  },
  {
    id: "cycle_length",
    title: "Typical Cycle Length",
    description: "On average, how many days pass between your periods?",
    type: "select",
    options: Array.from({ length: 20 }, (_, i) => ({ value: i + 21, label: `${i + 21} Days` })),
    default: 28,
    icon: Calendar
  },
  {
    id: "vitals",
    title: "Body Vitals",
    description: "Your health metrics help us provide more accurate cycle insights.",
    type: "vitals",
    icon: Activity
  },
  {
    id: "regularity",
    title: "Cycle Regularity",
    description: "How predictable is your cycle?",
    type: "radio",
    options: [
      { id: "very", label: "Very Regular", desc: "Predictable to the day" },
      { id: "mostly", label: "Mostly Regular", desc: "Varies by 1-2 days" },
      { id: "irregular", label: "Irregular", desc: "Highly unpredictable" }
    ],
    icon: Activity
  },
  {
    id: "symptoms",
    title: "Period Symptoms",
    description: "What do you usually experience during your period? (Select all that apply)",
    type: "multi",
    options: ["Cramps", "Bloating", "Headaches", "Mood Swings", "Acne", "Fatigue", "Back Pain", "Breast Tenderness"],
    icon: Thermometer
  },
  {
    id: "flow",
    title: "Flow Intensity",
    description: "How would you describe your typical flow?",
    type: "radio",
    options: [
      { id: "light", label: "Light", desc: "Minimal product use" },
      { id: "medium", label: "Medium", desc: "Standard product use" },
      { id: "heavy", label: "Heavy", desc: "Frequent product changes" }
    ],
    icon: Droplets
  },
  {
    id: "mood",
    title: "Mood & Energy",
    description: "Do you experience significant mood shifts before your period?",
    type: "radio",
    options: [
      { id: "none", label: "Not really", desc: "Feeling stable" },
      { id: "mild", label: "Mild changes", desc: "Slightly more sensitive" },
      { id: "significant", label: "Significant", desc: "Noticeable shifts" }
    ],
    icon: Brain
  },
  {
    id: "stress",
    title: "Stress Levels",
    description: "How would you rate your typical daily stress?",
    type: "radio",
    options: [
      { id: "low", label: "Low", desc: "Calm and managed" },
      { id: "medium", label: "Medium", desc: "Moderately busy" },
      { id: "high", label: "High", desc: "Very demanding" }
    ],
    icon: Zap
  },
  {
    id: "sleep",
    title: "Sleep Quality",
    description: "How many hours of sleep do you get on average?",
    type: "radio",
    options: [
      { id: "under_6", label: "< 6 Hours", desc: "Often sleep-deprived" },
      { id: "6_8", label: "6-8 Hours", desc: "Typical healthy rest" },
      { id: "over_8", label: "> 8 Hours", desc: "Generous rest" }
    ],
    icon: Moon
  },
  {
    id: "activity",
    title: "Physical Activity",
    description: "How often do you exercise or stay active?",
    type: "radio",
    options: [
      { id: "rarely", label: "Rarely", desc: "Mostly sedentary" },
      { id: "sometimes", label: "1-3 times/week", desc: "Light activity" },
      { id: "active", label: "4+ times/week", desc: "Consistent exercise" }
    ],
    icon: Activity
  },
  {
    id: "hydration",
    title: "Hydration Habits",
    description: "Do you drink enough water daily?",
    type: "radio",
    options: [
      { id: "under_1l", label: "< 1 Liter", desc: "Room for improvement" },
      { id: "1_2l", label: "1-2 Liters", desc: "Moderately hydrated" },
      { id: "over_2l", label: "> 2 Liters", desc: "Well hydrated" }
    ],
    icon: Coffee
  },
  {
    id: "concerns",
    title: "Health Concerns",
    description: "Are there specific areas you'd like to monitor? (Pick any)",
    type: "multi",
    options: ["Skin", "Energy", "Fertility", "Pain Management", "General Wellness"],
    icon: Target
  },
  {
    id: "goal",
    title: "Primary Goal",
    description: "What is your main goal for cycle tracking?",
    type: "radio",
    options: [
      { id: "insights", label: "Get Insights", desc: "Understand my body" },
      { id: "prediction", label: "Predictions", desc: "Plan ahead" },
      { id: "fertility", label: "Fertility", desc: "Family planning" }
    ],
    icon: Sparkles
  },
  {
    id: "notifications",
    title: "Cycle Alerts",
    description: "Would you like us to notify you about upcoming phases?",
    type: "radio",
    options: [
      { id: "yes", label: "Yes, please", desc: "Notify me of phase changes" },
      { id: "no", label: "Not now", desc: "I'll check manually" }
    ],
    icon: Bell
  },
  {
    id: "finish",
    title: "Almost Ready!",
    description: "Ready to see your personalized cycle dashboard?",
    type: "finish",
    icon: Heart
  }
];

export function OnboardingJourney({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<QuizData>({
    averageCycleLength: 28,
    height: "",
    weight: "",
    regularity: "mostly",
    flowIntensity: "medium",
    periodSymptoms: [],
    concerns: [],
    stressLevel: "medium",
    sleepHours: "6_8",
    activityLevel: "sometimes",
    hydration: "1_2l",
    primaryGoal: "insights",
    notificationsEnabled: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = QUESTIONS[step];

  const handleNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const updateField = (field: keyof QuizData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMulti = (field: "periodSymptoms" | "concerns", value: string) => {
    setFormData(prev => {
      const list = prev[field] as string[];
      if (list.includes(value)) {
        return { ...prev, [field]: list.filter(i => i !== value) };
      }
      return { ...prev, [field]: [...list, value] };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const resp = await fetch("/api/cycle-tracking/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (resp.ok) {
        toast.success("Onboarding complete! Welcome journey saved.");
        onComplete();
      } else {
        toast.error("Something went wrong saving your journey.");
      }
    } catch (err) {
      toast.error("Network error saving journey.");
    }
    setIsSubmitting(false);
  };

  const renderContent = () => {
    if (currentQuestion.type === "welcome" || currentQuestion.type === "finish") {
      return (
        <div className="flex flex-col items-center text-center py-6">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <currentQuestion.icon className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{currentQuestion.title}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
            {currentQuestion.description}
          </p>
        </div>
      );
    }

    if (currentQuestion.type === "select") {
      const field = currentQuestion.id as keyof QuizData;
      return (
        <div className="flex flex-col gap-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentQuestion.options?.map((opt: any) => (
              <button
                key={opt.value}
                onClick={() => updateField(field, opt.value)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  formData[field] === opt.value 
                    ? 'border-primary bg-primary/10 font-bold scale-105' 
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentQuestion.type === "vitals") {
      return (
        <div className="flex flex-col gap-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Height (cm)</label>
              <input 
                type="text"
                placeholder="e.g. 170"
                value={formData.height}
                onChange={(e) => updateField("height", e.target.value)}
                className="w-full mt-2 p-4 rounded-xl border-2 border-muted bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-xl font-bold"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Weight (kg)</label>
              <input 
                type="text"
                placeholder="e.g. 60"
                value={formData.weight}
                onChange={(e) => updateField("weight", e.target.value)}
                className="w-full mt-2 p-4 rounded-xl border-2 border-muted bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-xl font-bold"
              />
            </div>
          </div>
        </div>
      );
    }

    if (currentQuestion.type === "radio") {
      const field = currentQuestion.id === "notifications" ? "notificationsEnabled" : currentQuestion.id as keyof QuizData;
      return (
        <div className="flex flex-col gap-3 py-2">
          {currentQuestion.options?.map((opt: any) => {
            const val = opt.id === "yes" ? true : opt.id === "no" ? false : opt.id;
            const isSelected = formData[field] === val;
            return (
              <button
                key={opt.id}
                onClick={() => updateField(field, val)}
                className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all group ${
                  isSelected 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-md translate-y-[-2px]' 
                    : 'border-muted bg-card hover:bg-muted/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-lg ${isSelected ? 'text-primary' : ''}`}>{opt.label}</span>
                  {isSelected && <Check className="w-5 h-5 text-primary" />}
                </div>
                <span className="text-sm text-muted-foreground mt-1 group-hover:text-foreground/80">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (currentQuestion.type === "multi") {
      const field = currentQuestion.id as "periodSymptoms" | "concerns";
      return (
        <div className="grid grid-cols-2 gap-3 py-2">
          {currentQuestion.options?.map((opt: any) => {
            const isSelected = (formData[field] as string[]).includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggleMulti(field, opt)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/10 font-bold shadow-sm' 
                    : 'border-muted bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{opt}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl relative"
      >
        <Card className="shadow-2xl border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-muted flex">
            <motion.div 
              className="h-full bg-primary shadow-[0_0_10px_rgba(255,0,0,0.5)]"
              initial={{ width: "0%" }}
              animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <CardHeader className="pt-8 pb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono tracking-widest text-primary uppercase">
                Step {step + 1} of {QUESTIONS.length}
              </span>
              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10">
                <currentQuestion.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            {step > 0 && step < QUESTIONS.length - 1 && (
              <>
                <CardTitle className="text-2xl font-bold">{currentQuestion.title}</CardTitle>
                <CardDescription className="text-md mt-2">{currentQuestion.description}</CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="min-h-[400px] flex flex-col justify-center px-6 sm:px-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <div className="p-8 border-t bg-muted/30 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0 || isSubmitting}
              className="rounded-xl px-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="rounded-xl px-8 py-6 text-lg font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              {isSubmitting ? "Saving..." : step === QUESTIONS.length - 1 ? "Finish Journey" : "Continue"}
              {step < QUESTIONS.length - 1 && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
