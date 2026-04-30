export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type LearningSection = {
  title: string;
  body: string;
};

export type LearningModule = {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  objectives: string[];
  sections: LearningSection[];
  myth: string;
  fact: string;
  quiz: QuizQuestion[];
};

export type GlossaryTerm = {
  term: string;
  definition: string;
};

export type EducationTrack = {
  slug: string;
  title: string;
  strapline: string;
  description: string;
  audienceLevel: "Beginner" | "Intermediate";
  estimatedMinutes: number;
  reviewedBy: string;
  updatedAt: string;
  focusAreas: string[];
  modules: LearningModule[];
  glossary: GlossaryTerm[];
};

export const EDUCATION_TRACKS: EducationTrack[] = [
  {
    slug: "puberty-basics",
    title: "Puberty Basics",
    strapline: "Body changes without panic or guesswork.",
    description:
      "A calm starting point for understanding body changes, emotional shifts, and when normal development still deserves a medical check-in.",
    audienceLevel: "Beginner",
    estimatedMinutes: 28,
    reviewedBy: "Dr. Nusrat Jahan, MBBS",
    updatedAt: "2026-04-12",
    focusAreas: ["Body changes", "Mood shifts", "When to ask for help"],
    modules: [
      {
        id: "puberty-signals",
        title: "What changes first",
        summary: "Learn the most common physical and emotional signs of puberty and why timing differs from person to person.",
        minutes: 12,
        objectives: [
          "Recognize common puberty milestones",
          "Understand why timing varies",
          "Know what symptoms are worth discussing with a doctor",
        ],
        sections: [
          {
            title: "There is no single correct timeline",
            body:
              "Puberty is not a race. Breast development, body hair, growth spurts, discharge, acne, and mood changes can appear in different orders. Family history, nutrition, stress, and general health all affect timing.",
          },
          {
            title: "Emotional changes are part of the picture",
            body:
              "Hormonal shifts can increase sensitivity, irritability, or self-consciousness. That does not automatically mean something is wrong, but persistent sadness, panic, or intense distress still deserve support.",
          },
          {
            title: "Know the red flags",
            body:
              "Very early puberty, no puberty signs by the expected age range, severe pain, or rapid unexplained changes are worth a medical conversation. Education helps you notice patterns early instead of dismissing everything as normal.",
          },
        ],
        myth: "Puberty always starts the same way for everyone.",
        fact: "The sequence and pace vary widely, which is why comparison is usually misleading.",
        quiz: [
          {
            id: "puberty-signals-q1",
            prompt: "Which statement is most accurate?",
            options: [
              "Puberty follows the exact same order for everyone.",
              "Puberty can show up in different sequences and speeds.",
              "Mood changes mean puberty is abnormal.",
            ],
            correctIndex: 1,
            explanation: "Timing and sequence differ from person to person, so variation by itself is not usually a problem.",
          },
          {
            id: "puberty-signals-q2",
            prompt: "Which situation is most worth raising with a clinician?",
            options: [
              "A different pace than a friend",
              "A mild growth spurt",
              "Very early development with severe pain",
            ],
            correctIndex: 2,
            explanation: "Painful or unusually early changes deserve medical review rather than wait-and-see.",
          },
        ],
      },
      {
        id: "puberty-selfcheck",
        title: "How to track changes without spiraling",
        summary: "Use simple observation habits to notice what is changing without turning every symptom into an emergency.",
        minutes: 16,
        objectives: [
          "Build a basic self-observation routine",
          "Separate normal variation from persistent symptoms",
          "Prepare useful notes before asking a doctor",
        ],
        sections: [
          {
            title: "Track trends, not single moments",
            body:
              "One day of fatigue or acne is rarely meaningful by itself. What matters more is a pattern over time: worsening cramps, bleeding changes, constant fatigue, or new symptoms that keep coming back.",
          },
          {
            title: "Use simple language",
            body:
              "A useful note sounds like: 'pain for three periods in a row' or 'new discharge with itching for five days.' That gives a doctor more value than vague statements like 'everything feels weird.'",
          },
          {
            title: "Support matters too",
            body:
              "Puberty education is not only medical. It should also reduce shame, improve communication, and help a user ask questions earlier instead of hiding symptoms until they worsen.",
          },
        ],
        myth: "If you write symptoms down, you are overreacting.",
        fact: "A short record often makes care faster and more accurate.",
        quiz: [
          {
            id: "puberty-selfcheck-q1",
            prompt: "What kind of note is most useful before asking a doctor?",
            options: [
              "Everything feels off",
              "Pain has happened for three cycles in a row",
              "I think something is wrong maybe",
            ],
            correctIndex: 1,
            explanation: "Specific timing and pattern details are more actionable than broad feelings alone.",
          },
          {
            id: "puberty-selfcheck-q2",
            prompt: "Why track trends over time?",
            options: [
              "Because a single symptom snapshot can be misleading",
              "Because symptoms are never urgent",
              "Because only doctors should notice changes",
            ],
            correctIndex: 0,
            explanation: "Patterns help separate normal variation from persistent or worsening issues.",
          },
        ],
      },
    ],
    glossary: [
      { term: "Growth spurt", definition: "A faster-than-usual period of height and body growth during adolescence." },
      { term: "Hormones", definition: "Chemical messengers that help regulate body changes, mood, and development." },
      { term: "Discharge", definition: "Fluid from the vagina that can change through puberty and the menstrual cycle." },
    ],
  },
  {
    slug: "cycle-literacy",
    title: "Cycle Literacy",
    strapline: "Understand periods, symptoms, and patterns.",
    description:
      "Build a practical understanding of menstruation, what common cycle variation looks like, and when symptoms deserve clinical attention.",
    audienceLevel: "Beginner",
    estimatedMinutes: 34,
    reviewedBy: "Dr. Sadia Rahman, FCPS",
    updatedAt: "2026-04-10",
    focusAreas: ["Period basics", "Symptom patterns", "Care planning"],
    modules: [
      {
        id: "cycle-phases",
        title: "Your cycle in plain language",
        summary: "A short explanation of cycle phases, bleeding patterns, and why regular does not always mean identical every month.",
        minutes: 15,
        objectives: [
          "Explain the basic cycle phases",
          "Understand common variation in cycle length",
          "Recognize when heavy bleeding or severe pain needs attention",
        ],
        sections: [
          {
            title: "The cycle is a pattern, not just a period",
            body:
              "The menstrual cycle includes bleeding days, hormone shifts before ovulation, ovulation itself, and the days leading into the next period. Symptoms often make more sense when viewed across the whole cycle instead of one painful day.",
          },
          {
            title: "Regular can still vary",
            body:
              "A cycle does not need to be identical every month to be considered regular. Stress, sleep, illness, weight shifts, and travel can all nudge timing. Large or persistent changes deserve review.",
          },
          {
            title: "Pain should not be dismissed automatically",
            body:
              "Mild to moderate discomfort is common, but missing school or work, vomiting from cramps, or bleeding that soaks through products quickly can point to a problem that deserves care.",
          },
        ],
        myth: "If period pain is intense, you just have to tolerate it.",
        fact: "Severe pain can signal conditions that should be assessed, including endometriosis or fibroids.",
        quiz: [
          {
            id: "cycle-phases-q1",
            prompt: "Which statement is most accurate?",
            options: [
              "Only bleeding days matter when understanding a cycle",
              "Cycle symptoms make more sense when tracked across the full month",
              "Regular cycles must be exactly the same length each month",
            ],
            correctIndex: 1,
            explanation: "Cycle patterns become clearer when you track the full sequence, not just the period itself.",
          },
          {
            id: "cycle-phases-q2",
            prompt: "Which symptom pattern deserves more attention?",
            options: [
              "Cramping so severe that school or work becomes impossible",
              "A single mildly uncomfortable day",
              "A preference for rest during a period",
            ],
            correctIndex: 0,
            explanation: "Disabling pain is not something to normalize away.",
          },
        ],
      },
      {
        id: "cycle-care-plan",
        title: "Build a realistic cycle care plan",
        summary: "Turn cycle tracking into useful action: symptom logs, comfort tools, and the right moment to reach out for help.",
        minutes: 19,
        objectives: [
          "Create a simple symptom log",
          "Identify comfort and support strategies",
          "Know which notes to bring into a doctor conversation",
        ],
        sections: [
          {
            title: "Track what matters most",
            body:
              "Useful entries include start date, end date, pain level, flow changes, new symptoms, mood changes, and medications used. You do not need a perfect spreadsheet. You need enough detail to see a pattern.",
          },
          {
            title: "Relief is part of health literacy",
            body:
              "A care plan can include hydration, heat, medication prescribed or advised by a clinician, sleep protection, and backup products. Good education should help someone function, not just memorize terms.",
          },
          {
            title: "Bring specifics into appointments",
            body:
              "Questions like 'my pain peaks on day two and over-the-counter medication no longer helps' move a conversation forward faster than 'my periods are bad.'",
          },
        ],
        myth: "If symptoms come every month, they are automatically normal.",
        fact: "Repeated symptoms can still be clinically important, especially if they are worsening or disruptive.",
        quiz: [
          {
            id: "cycle-care-plan-q1",
            prompt: "What belongs in a useful cycle log?",
            options: [
              "Only the first day of bleeding",
              "Flow, pain level, timing, and repeated symptoms",
              "Only whether a product was purchased",
            ],
            correctIndex: 1,
            explanation: "Tracking the symptom pattern over time helps identify whether the problem is stable, worsening, or unusual.",
          },
          {
            id: "cycle-care-plan-q2",
            prompt: "Why does symptom detail matter in appointments?",
            options: [
              "It gives the doctor clearer, pattern-based information",
              "It makes treatment unnecessary",
              "It replaces examination and tests",
            ],
            correctIndex: 0,
            explanation: "Specific information usually leads to a faster and more accurate clinical discussion.",
          },
        ],
      },
    ],
    glossary: [
      { term: "Ovulation", definition: "The release of an egg from the ovary during the menstrual cycle." },
      { term: "Flow", definition: "How light or heavy menstrual bleeding is across the cycle." },
      { term: "Cycle length", definition: "The number of days from the start of one period to the start of the next." },
    ],
  },
  {
    slug: "contraception-confidence",
    title: "Contraception Confidence",
    strapline: "Understand options instead of relying on rumors.",
    description:
      "Compare common contraceptive methods, their tradeoffs, and the questions that help a user talk to a clinician with more clarity.",
    audienceLevel: "Intermediate",
    estimatedMinutes: 31,
    reviewedBy: "Dr. Farhana Islam, DGO",
    updatedAt: "2026-04-08",
    focusAreas: ["Method comparison", "Side effects", "Clinician questions"],
    modules: [
      {
        id: "contraception-overview",
        title: "Method types and what they actually do",
        summary: "A practical comparison of pills, condoms, emergency contraception, injections, and long-acting methods.",
        minutes: 14,
        objectives: [
          "Differentiate barrier, hormonal, and emergency methods",
          "Know the basic strengths of each option",
          "Avoid the most common misinformation loops",
        ],
        sections: [
          {
            title: "Different tools solve different problems",
            body:
              "Some methods are best for pregnancy prevention, some help with cycle symptoms, and some also reduce STI risk. A useful comparison starts with goals, not with what a friend says worked for them.",
          },
          {
            title: "Emergency contraception is not routine contraception",
            body:
              "Emergency contraception is for specific situations after unprotected sex or contraceptive failure. It is not designed to replace a long-term method, even though it is an important safety net.",
          },
          {
            title: "Condoms still matter",
            body:
              "Even when someone uses another contraceptive method, condoms remain important because pregnancy prevention and STI prevention are not the same thing.",
          },
        ],
        myth: "If one method works for a friend, it is the best method for everyone.",
        fact: "Choosing contraception depends on symptoms, preferences, health history, access, and STI protection needs.",
        quiz: [
          {
            id: "contraception-overview-q1",
            prompt: "Why might condoms still be recommended with another method?",
            options: [
              "Because condoms can also help reduce STI transmission risk",
              "Because all other methods are unsafe",
              "Because condoms replace emergency contraception",
            ],
            correctIndex: 0,
            explanation: "Condoms have a distinct role in STI risk reduction that many other methods do not provide.",
          },
          {
            id: "contraception-overview-q2",
            prompt: "What is the best starting point for comparing methods?",
            options: [
              "What a friend uses",
              "Personal goals, health history, and tradeoffs",
              "A viral social media post",
            ],
            correctIndex: 1,
            explanation: "A good match depends on the person's needs and constraints, not on popularity.",
          },
        ],
      },
      {
        id: "contraception-questions",
        title: "Questions to ask before choosing a method",
        summary: "Use a short decision framework to ask smarter questions about side effects, convenience, and follow-up.",
        minutes: 17,
        objectives: [
          "Prepare better clinician questions",
          "Understand common adherence problems",
          "Compare convenience and follow-up needs",
        ],
        sections: [
          {
            title: "Convenience affects real-world effectiveness",
            body:
              "A method only works consistently if someone can actually keep up with it. Daily pills, clinic visits, insertion procedures, and refill barriers all matter in real life.",
          },
          {
            title: "Side effects need context",
            body:
              "Some side effects settle, some signal that a method is a poor fit, and some require urgent follow-up. Good education should explain what is common, what is inconvenient, and what is unsafe.",
          },
          {
            title: "Bring your own priorities",
            body:
              "Users should leave a contraception page knowing how to ask: What are the likely side effects, when should I follow up, how does this interact with my cycle symptoms, and what STI protection do I still need?",
          },
        ],
        myth: "Choosing a method is mostly about memorizing names.",
        fact: "The better approach is understanding fit, consistency, side effects, and follow-up.",
        quiz: [
          {
            id: "contraception-questions-q1",
            prompt: "Why does convenience matter so much?",
            options: [
              "Because difficult routines reduce real-world consistency",
              "Because side effects never matter",
              "Because all methods are equally easy",
            ],
            correctIndex: 0,
            explanation: "A method that is hard to maintain can become less effective in practice.",
          },
          {
            id: "contraception-questions-q2",
            prompt: "Which question is strongest before choosing a method?",
            options: [
              "Will this protect me from every STI too?",
              "What side effects are common, and when should I follow up?",
              "Will I never need condoms again?",
            ],
            correctIndex: 1,
            explanation: "That question gets to practical safety and method fit quickly.",
          },
        ],
      },
    ],
    glossary: [
      { term: "Barrier method", definition: "A method, such as condoms, that helps block sperm from reaching an egg." },
      { term: "Emergency contraception", definition: "A time-sensitive option used after unprotected sex or method failure." },
      { term: "Long-acting method", definition: "A contraceptive option that works for an extended period without daily action." },
    ],
  },
  {
    slug: "consent-and-boundaries",
    title: "Consent and Boundaries",
    strapline: "Safety, autonomy, and communication in real situations.",
    description:
      "A practical learning track on consent, pressure, boundaries, and how to prepare language for difficult conversations.",
    audienceLevel: "Beginner",
    estimatedMinutes: 24,
    reviewedBy: "Maaya Care Team",
    updatedAt: "2026-04-09",
    focusAreas: ["Consent", "Pressure", "Safety planning"],
    modules: [
      {
        id: "consent-basics",
        title: "What real consent sounds like",
        summary: "Move past vague slogans and understand what voluntary, informed, and ongoing consent actually looks like.",
        minutes: 11,
        objectives: [
          "Define consent clearly",
          "Recognize coercion and pressure",
          "Understand that consent can change at any point",
        ],
        sections: [
          {
            title: "Consent is active, not assumed",
            body:
              "Silence, fear, pressure, or confusion are not the same as agreement. Consent needs to be freely given, specific to the situation, and possible to withdraw at any time.",
          },
          {
            title: "Pressure changes the situation",
            body:
              "Repeated pushing, guilt, threats, status differences, or emotional manipulation can make a situation unsafe even when someone technically said yes at some point.",
          },
          {
            title: "Changing your mind is allowed",
            body:
              "A previous yes does not obligate a future yes. Education on consent should reduce shame and give users language they can actually use under pressure.",
          },
        ],
        myth: "If someone agreed once before, consent is automatic later.",
        fact: "Consent must be active and current for each situation.",
        quiz: [
          {
            id: "consent-basics-q1",
            prompt: "Which example best reflects real consent?",
            options: [
              "A clear and voluntary yes in the current situation",
              "Silence because a person feels pressured",
              "Agreement from a past relationship",
            ],
            correctIndex: 0,
            explanation: "Consent must be active, voluntary, and relevant to the current moment.",
          },
          {
            id: "consent-basics-q2",
            prompt: "What is true about changing your mind?",
            options: [
              "It is only valid before anything starts",
              "It is valid at any point",
              "It only matters if both people stay calm",
            ],
            correctIndex: 1,
            explanation: "Consent can be withdrawn at any time.",
          },
        ],
      },
      {
        id: "boundary-language",
        title: "Boundary language you can actually use",
        summary: "Short scripts and framing for saying no, slowing down, or asking for support without overexplaining.",
        minutes: 13,
        objectives: [
          "Prepare short, direct boundary phrases",
          "Reduce pressure to overjustify yourself",
          "Identify when a support person or clinician should be involved",
        ],
        sections: [
          {
            title: "Short is enough",
            body:
              "Phrases like 'I don't want this,' 'I need to stop,' or 'I'm not comfortable' are enough. A healthy response respects the limit instead of demanding an explanation.",
          },
          {
            title: "Plan support in advance",
            body:
              "Education becomes useful when it helps someone know who to text, where to go, and what to say if a boundary is ignored or if a situation becomes unsafe.",
          },
          {
            title: "Medical support can still matter",
            body:
              "If there was coercion, injury, fear of pregnancy, or STI exposure risk, the next step may involve urgent support or a medical conversation, not just relationship advice.",
          },
        ],
        myth: "You need the perfect explanation for a boundary to count.",
        fact: "A limit does not need a long defense to be valid.",
        quiz: [
          {
            id: "boundary-language-q1",
            prompt: "Which phrase is enough to set a boundary?",
            options: [
              "I don't want this",
              "Maybe later if I can explain everything",
              "I'm sorry for being difficult",
            ],
            correctIndex: 0,
            explanation: "A clear limit is valid without a long defense.",
          },
          {
            id: "boundary-language-q2",
            prompt: "When should medical support be considered?",
            options: [
              "Only when a relationship ends",
              "If there was injury, coercion, or exposure concern",
              "Never, because this is only emotional",
            ],
            correctIndex: 1,
            explanation: "Consent and safety concerns can also require medical care or urgent support.",
          },
        ],
      },
    ],
    glossary: [
      { term: "Consent", definition: "Freely given, informed, and ongoing agreement in a specific situation." },
      { term: "Coercion", definition: "Pressure, threats, or manipulation that make a situation unsafe or non-voluntary." },
      { term: "Boundary", definition: "A limit someone sets to protect comfort, safety, or autonomy." },
    ],
  },
];

export function getEducationTrackBySlug(slug: string) {
  return EDUCATION_TRACKS.find((track) => track.slug === slug);
}
