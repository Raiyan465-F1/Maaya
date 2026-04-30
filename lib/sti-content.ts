import { REAL_ARTICLES } from "@/lib/real";
import type { Article } from "@/lib/news";

export type StiQuickAction = {
  title: string;
  description: string;
  href: string;
  eyebrow: string;
};

export type StiGuide = {
  kind: "guide";
  slug: string;
  title: string;
  summary: string;
  reviewStatus: string;
  reviewedBy: string;
  updatedAt: string;
  category: "Common STI" | "Prevention" | "Testing";
  symptomSignals: string[];
  asymptomaticNote: string;
  testingGuide: string[];
  treatmentBasics: string[];
  preventionMoves: string[];
  urgentCareFlags: string[];
  myth: string;
  fact: string;
  nextSteps: string[];
  doctorQuestions: string[];
};

export type StiUpdate = Article & {
  kind: "update";
  topic: string;
  readingTime: string;
};

export type StiResource = StiGuide | StiUpdate;

export const STI_QUICK_ACTIONS: StiQuickAction[] = [
  {
    title: "Symptom check-in",
    description: "See the most common signs, remember that some STIs are silent, and learn when not to wait.",
    href: "/sti-awareness/symptom-check-guide",
    eyebrow: "Start here if something changed",
  },
  {
    title: "Testing timing",
    description: "Understand why exposure date, symptom timing, and retesting windows matter before you assume a result means everything.",
    href: "/sti-awareness/testing-playbook",
    eyebrow: "For uncertainty after exposure",
  },
  {
    title: "Prevention plan",
    description: "Compare condoms, vaccination, regular screening, and partner communication as a real prevention stack.",
    href: "/sti-awareness/safer-sex-playbook",
    eyebrow: "For reducing future risk",
  },
  {
    title: "Talk to a doctor",
    description: "Move from reading into action if you are worried about symptoms, results, or what to do next.",
    href: "/doctors-help",
    eyebrow: "For personal advice",
  },
];

export const STI_GUIDES: StiGuide[] = [
  {
    kind: "guide",
    slug: "symptom-check-guide",
    title: "Symptom Check Guide",
    summary: "A first-stop guide for what to do when something feels off: which signs are common, which are silent, and which symptoms should push you toward faster care.",
    reviewStatus: "Clinically reviewed",
    reviewedBy: "Maaya Medical Advisory Team",
    updatedAt: "2026-04-16",
    category: "Testing",
    symptomSignals: [
      "Burning during urination",
      "New discharge, odor, or irritation",
      "Pelvic pain, sores, blisters, or unusual bleeding",
      "Symptoms after a recent sexual exposure",
    ],
    asymptomaticNote: "A person can still have an STI without obvious symptoms, which is why symptom-free exposure can still need testing advice.",
    testingGuide: [
      "Write down what changed, when it started, and whether there was a recent exposure.",
      "Testing choice depends on the symptom pattern and the type of exposure.",
      "Early negative results can still be too early to settle the question.",
    ],
    treatmentBasics: [
      "Do not guess the condition from one symptom alone.",
      "Avoid taking leftover antibiotics or assuming symptoms that fade have been resolved.",
      "Ask a clinician what treatment or follow-up is appropriate based on the actual test plan.",
    ],
    preventionMoves: [
      "Use barrier protection consistently.",
      "Have a testing plan before a scare happens.",
      "Treat symptom changes as information to act on, not something to hide out of embarrassment.",
    ],
    urgentCareFlags: [
      "Severe pain, fever, or rapidly worsening symptoms",
      "Assault or coercion",
      "Pregnancy with new symptoms or bleeding",
    ],
    myth: "You can usually tell which STI it is just from the symptom.",
    fact: "Many STI symptoms overlap with each other and with non-STI conditions, which is why the next step matters more than self-diagnosis.",
    nextSteps: [
      "Record the symptom and timing clearly.",
      "Use testing guidance that matches the exposure and body site.",
      "Escalate to clinical advice sooner if symptoms are severe or emotionally difficult to navigate alone.",
    ],
    doctorQuestions: [
      "Which tests fit my symptom pattern and exposure timing?",
      "Is this something that should be assessed urgently?",
      "What should I avoid doing before I get tested?",
    ],
  },
  {
    kind: "guide",
    slug: "chlamydia-guide",
    title: "Chlamydia",
    summary: "A very common bacterial STI that is often silent, which is why routine screening matters even when someone feels fine.",
    reviewStatus: "Clinically reviewed",
    reviewedBy: "Dr. Farzana Ahmed, MBBS",
    updatedAt: "2026-04-14",
    category: "Common STI",
    symptomSignals: [
      "Burning during urination",
      "Pelvic discomfort or lower abdominal pain",
      "Unusual discharge",
      "Bleeding after sex or between periods",
    ],
    asymptomaticNote: "Many people have no symptoms at all, so absence of symptoms does not rule it out.",
    testingGuide: [
      "NAAT testing is commonly used and may involve urine or swab samples.",
      "Ask a clinician when to test after exposure and whether repeat testing is recommended.",
      "Follow-up testing may matter even after treatment, depending on exposure and risk.",
    ],
    treatmentBasics: [
      "Treatment is usually straightforward with clinician-directed antibiotics.",
      "Partners may need evaluation and treatment too.",
      "Avoid assuming symptoms resolving on their own means the infection is gone.",
    ],
    preventionMoves: [
      "Use condoms consistently and correctly.",
      "Do not skip screening just because there are no symptoms.",
      "Talk about testing with partners before assuming risk is low.",
    ],
    urgentCareFlags: [
      "Severe pelvic pain",
      "Fever with worsening symptoms",
      "Pain during pregnancy or concern about pregnancy-related complications",
    ],
    myth: "If there are no symptoms, there is nothing to worry about.",
    fact: "Chlamydia is commonly asymptomatic and can still cause complications if missed.",
    nextSteps: [
      "Get tested if there was recent exposure or symptoms.",
      "Avoid self-treating with random antibiotics.",
      "Ask about partner notification and follow-up testing.",
    ],
    doctorQuestions: [
      "What test is most appropriate for my symptoms or exposure?",
      "Do I need repeat testing after treatment?",
      "What should my partner do next?",
    ],
  },
  {
    kind: "guide",
    slug: "gonorrhea-guide",
    title: "Gonorrhea",
    summary: "A bacterial STI that can affect multiple body sites and is important to treat promptly because resistance patterns are evolving.",
    reviewStatus: "Clinically reviewed",
    reviewedBy: "Dr. Sadia Rahman, FCPS",
    updatedAt: "2026-04-11",
    category: "Common STI",
    symptomSignals: [
      "Pain or burning during urination",
      "Increased discharge",
      "Pelvic pain",
      "Throat or rectal symptoms depending on exposure",
    ],
    asymptomaticNote: "Some infections are quiet, especially depending on the site of exposure.",
    testingGuide: [
      "Testing may involve urine, vaginal, throat, or rectal samples depending on history.",
      "Tell the clinician what kind of exposure happened so the correct site is tested.",
      "Do not assume one sample type covers every exposure route.",
    ],
    treatmentBasics: [
      "Treatment should follow current clinician guidance because recommendations can change with resistance trends.",
      "Partners may need evaluation and treatment as well.",
      "Follow-up matters if symptoms persist or if reinfection is possible.",
    ],
    preventionMoves: [
      "Use condoms and barrier protection consistently.",
      "Screen based on risk and exposure, not only symptoms.",
      "Seek care early instead of waiting for symptoms to become severe.",
    ],
    urgentCareFlags: [
      "Severe pelvic pain",
      "Fever or feeling acutely unwell",
      "Worsening pain after recent exposure or treatment",
    ],
    myth: "A single negative urine test rules out every possible gonorrhea exposure.",
    fact: "Testing needs to match the exposure site, so one sample may not tell the whole story.",
    nextSteps: [
      "Tell the clinician exactly where symptoms are and what exposures happened.",
      "Ask whether multiple testing sites are needed.",
      "Return if symptoms continue after treatment.",
    ],
    doctorQuestions: [
      "Do I need throat or rectal testing too?",
      "What follow-up should I expect if symptoms continue?",
      "How should I handle partner testing?",
    ],
  },
  {
    kind: "guide",
    slug: "hpv-guide",
    title: "HPV",
    summary: "A very common viral infection with many strains. Some cause warts, while others matter more for cervical and other cancer screening.",
    reviewStatus: "Clinically reviewed",
    reviewedBy: "Dr. Nusrat Jahan, MBBS",
    updatedAt: "2026-04-13",
    category: "Common STI",
    symptomSignals: [
      "Often no symptoms",
      "Genital warts in some cases",
      "Abnormal screening results rather than obvious day-to-day symptoms",
    ],
    asymptomaticNote: "Most HPV infections do not announce themselves with clear symptoms.",
    testingGuide: [
      "Screening recommendations depend on age, anatomy, and local clinical guidance.",
      "HPV-related care is often discovered through routine cervical screening rather than symptom-based testing.",
      "Vaccination status and screening history both matter in the conversation.",
    ],
    treatmentBasics: [
      "There is no single treatment that erases every HPV infection immediately.",
      "Care often focuses on monitoring, treating visible lesions, or addressing abnormal screening findings.",
      "Follow-up intervals matter because persistence, not panic, usually guides care.",
    ],
    preventionMoves: [
      "Vaccination is a major prevention tool.",
      "Routine screening remains important even if someone feels well.",
      "Barrier methods help but do not remove risk completely.",
    ],
    urgentCareFlags: [
      "Abnormal bleeding that is persistent",
      "A lesion that changes rapidly or causes pain",
      "A concerning screening result with no follow-up plan",
    ],
    myth: "HPV only matters if visible warts appear.",
    fact: "Some higher-risk strains matter precisely because they are silent and found through screening.",
    nextSteps: [
      "Know your vaccination and screening history.",
      "Ask what follow-up interval is appropriate for your situation.",
      "Do not skip screenings because there are no symptoms.",
    ],
    doctorQuestions: [
      "How does my screening history change my next steps?",
      "Should I ask about HPV vaccination?",
      "What follow-up is recommended after an abnormal result?",
    ],
  },
  {
    kind: "guide",
    slug: "herpes-guide",
    title: "Herpes",
    summary: "A viral infection that can cause outbreaks or remain quiet between them. Good education focuses on outbreak patterns, transmission, and support without stigma.",
    reviewStatus: "Clinically reviewed",
    reviewedBy: "Dr. M. Hossain, MBBS",
    updatedAt: "2026-04-09",
    category: "Common STI",
    symptomSignals: [
      "Painful blisters or sores",
      "Tingling or burning before an outbreak",
      "Flu-like symptoms during an initial episode",
    ],
    asymptomaticNote: "Transmission can still happen outside obvious outbreaks, which is why silence does not always mean zero risk.",
    testingGuide: [
      "Timing matters because tests differ in what they detect.",
      "Visible lesions may be tested directly during an outbreak.",
      "Ask what type of test fits the current situation rather than assuming one test always answers it.",
    ],
    treatmentBasics: [
      "Treatment can shorten outbreaks or reduce recurrence depending on the plan.",
      "Management is often about symptom control and transmission reduction.",
      "Support matters because stigma can be more damaging than the condition itself.",
    ],
    preventionMoves: [
      "Avoid sexual contact during active outbreaks.",
      "Use barrier protection and discuss risk openly with partners.",
      "Follow a clinician's plan if suppressive treatment is recommended.",
    ],
    urgentCareFlags: [
      "Severe pain with difficulty urinating",
      "Eye symptoms",
      "Symptoms during pregnancy or with a compromised immune system",
    ],
    myth: "Herpes is only contagious during visible sores.",
    fact: "Viral shedding can happen outside visible outbreaks, although risk patterns vary.",
    nextSteps: [
      "Get lesions assessed early if possible.",
      "Ask what test is appropriate for the current timing.",
      "Discuss outbreak management and partner communication.",
    ],
    doctorQuestions: [
      "Would suppressive treatment help in my case?",
      "What should I know about transmission outside outbreaks?",
      "What should I do if symptoms return?",
    ],
  },
  {
    kind: "guide",
    slug: "testing-playbook",
    title: "Testing Playbook",
    summary: "A guide for what to do after possible exposure: when to test, why timing matters, and how to avoid false confidence.",
    reviewStatus: "Clinically reviewed",
    reviewedBy: "Maaya Medical Advisory Team",
    updatedAt: "2026-04-15",
    category: "Testing",
    symptomSignals: [
      "Recent exposure with no symptoms yet",
      "Symptoms but uncertainty about the right test",
      "A negative result taken too early to be reassuring",
    ],
    asymptomaticNote: "Exposure without symptoms is one of the most common reasons people still need guidance.",
    testingGuide: [
      "Ask which STI panel matches your actual exposure history rather than requesting everything blindly.",
      "Testing windows vary, so the date of exposure matters.",
      "Some situations need repeat testing if the first test happened too early.",
    ],
    treatmentBasics: [
      "Do not treat random symptoms with leftover medication.",
      "Let test results and clinician guidance shape treatment where possible.",
      "If treatment starts empirically, ask what follow-up or repeat testing still matters.",
    ],
    preventionMoves: [
      "Know your routine screening plan before there is a scare.",
      "Use protection consistently and discuss testing expectations with partners.",
      "Treat testing as part of sexual health maintenance, not evidence of failure.",
    ],
    urgentCareFlags: [
      "Assault or coercion",
      "Fever, severe pain, or rapid worsening symptoms",
      "Pregnancy with new symptoms or recent exposure",
    ],
    myth: "A very early negative test always means you are in the clear.",
    fact: "Testing windows differ, so some negative results are simply too early to answer the question well.",
    nextSteps: [
      "Write down the exposure date and symptom onset.",
      "Ask which tests match the situation and whether retesting is needed.",
      "Use a clinician if symptoms are significant or the situation is high-risk.",
    ],
    doctorQuestions: [
      "Was this test done at the right time?",
      "Do I need repeat testing later?",
      "Which body sites should be tested based on exposure?",
    ],
  },
  {
    kind: "guide",
    slug: "safer-sex-playbook",
    title: "Safer Sex Playbook",
    summary: "Prevention is not one tool. It is a stack: barrier protection, vaccination, testing, communication, and a plan for what happens after risk.",
    reviewStatus: "Clinically reviewed",
    reviewedBy: "Maaya Care Team",
    updatedAt: "2026-04-12",
    category: "Prevention",
    symptomSignals: [
      "A pattern of repeated exposure risk",
      "Uncertainty about how to lower risk consistently",
      "Difficulty discussing testing or condom use with partners",
    ],
    asymptomaticNote: "Prevention planning matters most before symptoms appear, not after.",
    testingGuide: [
      "Routine screening helps because many infections stay silent.",
      "Testing plans should reflect actual risk, not just anxiety after one event.",
      "A prevention plan is stronger when testing intervals are already decided in advance.",
    ],
    treatmentBasics: [
      "Prevention and treatment should connect, not live in separate pages.",
      "Know where you would go if symptoms, exposure, or a positive result happened tomorrow.",
      "Partner treatment and follow-up planning matter in prevention too.",
    ],
    preventionMoves: [
      "Use condoms and barrier methods correctly and consistently.",
      "Ask about vaccination where relevant, including HPV and hepatitis protection.",
      "Set expectations for testing and disclosure before a stressful moment.",
      "Use professional help when exposure or symptoms create uncertainty.",
    ],
    urgentCareFlags: [
      "Exposure with assault or coercion",
      "High-risk exposure with rapidly developing symptoms",
      "Avoiding care because of stigma despite significant concern",
    ],
    myth: "Prevention is basically just a condom reminder.",
    fact: "The best prevention approach combines protection, screening, communication, vaccination, and a care plan.",
    nextSteps: [
      "Choose a screening cadence that fits your real risk level.",
      "Prepare one direct partner conversation before you need it.",
      "Know where to ask for medical advice if your plan breaks down.",
    ],
    doctorQuestions: [
      "What prevention plan fits my actual risk pattern?",
      "How often should I be screened?",
      "What should I do immediately after a higher-risk exposure?",
    ],
  },
];

function inferTopic(article: Article): string {
  const text = `${article.title} ${article.description}`.toLowerCase();
  if (text.includes("vaccine")) return "Vaccines";
  if (text.includes("prep")) return "Prevention";
  if (text.includes("testing")) return "Testing access";
  if (text.includes("stigma")) return "Stigma and care";
  if (text.includes("guidelines")) return "Clinical guidance";
  return "Research update";
}

function inferReadingTime(article: Article): string {
  const wordCount = article.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.round(wordCount / 130));
  return `${minutes} min read`;
}

export const STI_UPDATES: StiUpdate[] = REAL_ARTICLES.map((article) => ({
  ...article,
  kind: "update",
  topic: inferTopic(article),
  readingTime: inferReadingTime(article),
}));

export function getStiGuideBySlug(slug: string) {
  return STI_GUIDES.find((guide) => guide.slug === slug);
}

export function getStiUpdateBySlug(slug: string) {
  return STI_UPDATES.find((article) => article.slug === slug);
}

export function getStiResourceBySlug(slug: string): StiResource | undefined {
  return getStiGuideBySlug(slug) ?? getStiUpdateBySlug(slug);
}
