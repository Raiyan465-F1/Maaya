import type { Article } from "./news";

export const REAL_ARTICLES: Article[] = [
  {
    slug: "fda-approves-doxypep",
    title: "FDA Approves DoxyPEP to Prevent Bacterial STIs",
    description: "The FDA and CDC have backed the use of doxycycline as post-exposure prophylaxis to prevent chlamydia and syphilis.",
    content: `
      <p>In a groundbreaking move for public health and sexual disease prevention, the U.S. Centers for Disease Control and Prevention (CDC) alongside the FDA has officially endorsed Doxycycline Post-Exposure Prophylaxis (DoxyPEP). Studies have overwhelmingly indicated that taking this specific antibiotic within 72 hours of unprotected sexual contact can drastically cut the rates of bacterial pathogens, specifically syphilis and chlamydia, by up to 66%.</p>
      <p>This approach marks the first major, systemic pharmaceutical intervention intended explicitly for post-exposure bacterial STI prevention meant for broad deployment, particularly among men who have sex with men (MSM) and transgender women, communities that have historically been disproportionately affected by the recent rise in bacterial infections.</p>
      <h3>What This Means Moving Forward</h3>
      <p>For populations at high risk, clinicians are now encouraged to prescribe a single 200mg dose of doxycycline post-encounter. However, public health commentators emphasize that this must be paired with routine screening, as long-term antibiotic stewardship is necessary to prevent widespread bacterial resistance down the line.</p>
    `,
    url: "/sti-awareness/fda-approves-doxypep",
    image: "https://images.unsplash.com/photo-1584308666744-24d5e4a50d4b?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2024-06-04T12:00:00Z",
    source: { name: "CDC Newsroom", url: "#" }
  },
  {
    slug: "global-syphilis-surge",
    title: "Global Syphilis Cases Continue Historic Rise",
    description: "WHO reports that new syphilis infections have surged globally, pointing to decreased condom use and gaps in screening.",
    content: `
      <p>Recent data published by the World Health Organization paints a concerning picture: syphilis is surging across multiple continents at rates not seen since the 1950s. While global health initiatives largely quelled the infection over the latter half of the 20th century, the latest epidemiological data suggests over 7 million new cases annually worldwide.</p>
      <p>Public health experts attribute this resurgence to several overlapping factors: a sharp decrease in consistent condom use across youth demographics, defunded public sexual health clinics following the COVID-19 pandemic, and increased societal stigma preventing individuals from seeking timely treatment.</p>
      <h3>The Threat of Congenital Syphilis</h3>
      <p>Perhaps the most devastating statistic lies in the spike of congenital syphilis—where the infection is passed from mother to infant during pregnancy. Early prenatal screening remains the absolute best defense, yet millions of individuals lack access to foundational maternal care, resulting in severe birth complications that are entirely preventable with a simple course of penicillin.</p>
    `,
    url: "/sti-awareness/global-syphilis-surge",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2024-05-21T08:30:00Z",
    source: { name: "World Health Organization", url: "#" }
  },
  {
    slug: "chlamydia-vaccine-trials",
    title: "Advances in the Chlamydia Vaccine Trials",
    description: "Phase 1 trials for a new chlamydia vaccine show significant promise in producing strong immune responses.",
    content: `
      <p>Vaccines for bacterial sexually transmitted infections have historically presented massive immunological hurdles. However, researchers publishing in The Lancet Infectious Diseases have confirmed that a novel protein-based vaccine against <i>Chlamydia trachomatis</i> has successfully cleared Phase 1 clinical testing.</p>
      <p>The vaccine candidate was shown to safely provoke robust antibody and cellular immune responses in a small cohort of healthy volunteers. Because chlamydia represents the most commonly reported bacterial STI worldwide—often occurring asymptomatically and leading to pelvic inflammatory disease and infertility if left untreated—a successful vaccine would represent a paradigm shift in global reproductive health.</p>
      <p>Phase 2 trials are scheduled to commence late next year, evaluating the vaccine's actual efficacy in preventing transmission in high-risk zones.</p>
    `,
    url: "/sti-awareness/chlamydia-vaccine-trials",
    image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2023-11-15T14:20:00Z",
    source: { name: "The Lancet Infectious Diseases", url: "#" }
  },
  {
    slug: "telemedicine-sti-testing",
    title: "The Impact of Telemedicine on STI Testing Rates",
    description: "A comprehensive study reveals telehealth and mail-in swab kits have increased testing by 40% among young adults.",
    content: `
      <p>The digital health revolution has firmly reached the sphere of sexual health. According to a massive retrospective analysis published recently, the widespread availability of asynchronous telehealth consults paired with discreet, mail-in laboratory testing kits has driven STI screening rates up by over 40% among adults aged 18 to 25.</p>
      <p>For decades, the physical journey to a clinic—coupled with perceived judgment from healthcare providers—stood as the primary barrier preventing symptomatic individuals from seeking help. Today, patients can order a comprehensive panel tracking HIV, Gonorrhea, Chlamydia, and Syphilis, collect samples via urine cups or oral swabs at home, and mail them back in a prepaid box.</p>
      <h3>Connecting Testing to Treatment</h3>
      <p>Crucially, modern telehealth platforms do not just provide results; positive panel triggers immediately prompt a virtual consultation with a licensed physician who can e-prescribe antibiotics directly to the patient's local pharmacy, creating a seamless, stigma-free loop of care.</p>
    `,
    url: "/sti-awareness/telemedicine-sti-testing",
    image: "https://images.unsplash.com/photo-1618498082410-b4aa22193b38?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2024-02-10T09:00:00Z",
    source: { name: "JAMA Network", url: "#" }
  },
  {
    slug: "mycoplasma-genitalium-threat",
    title: "Mycoplasma genitalium: The Silent Threat",
    description: "Experts warn of the rising antibiotic resistance in Mycoplasma genitalium cases, urging specialized testing.",
    content: `
      <p>While chlamydia and gonorrhea monopolize public awareness, a lesser-known bacterium is causing significant clinical distress: <i>Mycoplasma genitalium</i> (Mgen). The pathogen is heavily associated with persistent urethritis in men and cervicitis in women.</p>
      <p>What makes Mgen incredibly dangerous is its innate resistance footprint. Traditional first-line antibiotics such as azithromycin, which reliably neutralizes other bacterial STIs, fail in over 50% of Mgen cases due to rapidly mutating macrolide resistance.</p>
      <p>The CDC now formally advocates for specialized nucleic acid amplification tests (NAATs) that not only detect the presence of Mgen but simultaneously sequence the bacteria for macrolide resistance markers. Clinicians must adopt multi-stage, resistance-guided antibiotic therapies to effectively clear the infection and prevent further antibiotic resistance amplification.</p>
    `,
    url: "/sti-awareness/mycoplasma-genitalium-threat",
    image: "https://images.unsplash.com/photo-1606206873764-fd15e242df52?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2023-09-02T11:45:00Z",
    source: { name: "NEJM", url: "#" }
  },
  {
    slug: "new-hpv-guidelines",
    title: "New Guidelines Unveiled for HPV Screening",
    description: "The American Cancer Society has released updated guidelines for cervical cancer prevention and HPV screening protocols.",
    content: `
      <p>In a major shift away from decades-old clinical standards, the American Cancer Society has formally recommended that primary human papillomavirus (HPV) testing replace the traditional Pap smear. The new guidelines strongly advise that individuals with a cervix begin primary HPV screening every five years starting at age 25, continuing through age 65.</p>
      <p>The data driving this change is incontrovertible. Primary HPV DNA testing is exponentially more sensitive at detecting pre-cancerous cellular changes long before they mutate into life-threatening malignancies. When combined with the high efficacy rates of the modern Gardasil-9 vaccine given to adolescents, the medical community asserts that cervical cancer is on track to become functionally eradicated in developed nations.</p>
    `,
    url: "/sti-awareness/new-hpv-guidelines",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2024-01-18T10:15:00Z",
    source: { name: "American Cancer Society", url: "#" }
  },
  {
    slug: "gonorrhea-single-dose-antibiotics",
    title: "Single-Dose Antibiotics Under Review for Gonorrhea",
    description: "With traditional treatments faltering, a new single-dose oral antibiotic class enters Phase 3 clinical trials.",
    content: `
      <p>Neisseria gonorrhoeae has earned its moniker as a 'superbug' due to its frightening ability to develop resistance to almost every class of antimicrobial agent introduced over the past eighty years. Currently, treatment relies on a painful intramuscular injection of ceftriaxone, which itself is beginning to encounter strain resistance in regions surrounding the Pacific Rim.</p>
      <p>Fortunately, Zoliflodacin, a completely novel spiropyrimidinetrione antibiotic, has recently concluded Phase 3 trials showcasing remarkable non-inferiority to standard treatments. Crucially, Zoliflodacin attacks the bacteria's DNA synthesis enzymes through a completely different mechanism than previous drug classes, bypassing existing resistance mechanisms.</p>
      <p>Because it is administered as a single oral dose, providers are optimistic that compliance rates will soar, halting the progression of drug-resistant "super gonorrhea" strains globally.</p>
    `,
    url: "/sti-awareness/gonorrhea-single-dose-antibiotics",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2024-04-12T16:00:00Z",
    source: { name: "NIH Reports", url: "#" }
  },
  {
    slug: "herpes-vaccine-phase-2",
    title: "Herpes Vaccine Enters Phase 2 Testing",
    description: "A novel mRNA vaccine targeting HSV-2 demonstrates strong immunogenicity in early trials.",
    content: `
      <p>Building upon the accelerated mRNA vaccine technologies pioneered during the COVID-19 pandemic, research labs have rapidly synthesized a highly targeted mRNA vaccine meant to prevent and suppress Genital Herpes (HSV-2).</p>
      <p>Herpes lies dormant within the nervous system, evading standard white blood cell detection between outbreaks, making traditional deactivated-virus vaccines highly ineffective. By delivering specific mRNA instructions dictating the assembly of three unique viral glycoprotein structures, the new vaccine educates T-cells to aggressively identify and restrict viral shedding at the cellular level.</p>
      <p>If Phase 2 and 3 trials confirm early promises, the vaccine could function both prophylactically (preventing contraction) and therapeutically (drastically eliminating painful outbreaks for those already infected).</p>
    `,
    url: "/sti-awareness/herpes-vaccine-phase-2",
    image: "https://images.unsplash.com/photo-1574958269340-fa927503f3f4?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2024-03-05T08:20:00Z",
    source: { name: "Vaccines Journal", url: "#" }
  },
  {
    slug: "injectable-prep-revolution",
    title: "Long-acting Injectable PrEP Revolutionizes HIV Prevention",
    description: "Apretude, a bi-monthly injectable PrEP, has led to a significant decrease in new HIV infections in target demographics.",
    content: `
      <p>Daily oral pills like Truvada and Descovy changed the world by offering near-total immunity against HIV transmission. However, adherence—remembering to take a pill at the exact same time every single day—remains a persistent flaw leading to breakthrough infections among highly vulnerable demographics.</p>
      <p>The FDA's approval of Cabotegravir (marketed as Apretude), an extended-release injectable suspension, fundamentally solves the adherence crisis. Administered once every two months by a clinician, the injection maintains robust, protective drug concentrations inside the bloodstream steadily over 60 days.</p>
      <p>Early post-market analysis suggests that injectable PrEP could be the critical link needed to finally achieve global UNAIDS objectives, reducing domestic new transmission rates by a projected 45% over the next decade.</p>
    `,
    url: "/sti-awareness/injectable-prep-revolution",
    image: "https://images.unsplash.com/photo-1584308666744-24d5e4a50d4b?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2023-12-08T13:30:00Z",
    source: { name: "FDA Announcements", url: "#" }
  },
  {
    slug: "addressing-sti-stigma",
    title: "Addressing STI Stigma in Healthcare Settings",
    description: "A new research paper outlines strategies for clinicians to provide more compassionate, stigma-free sexual health care.",
    content: `
      <p>Regardless of pharmaceutical advancements, the most significant barrier to slowing STI transmission remains deeply psychological: stigma. The fear of moral judgment from healthcare providers prevents thousands of symptomatic individuals, ranging from teenagers to the elderly, from seeking timely clinical intervention.</p>
      <p>A recent systemic review published heavily emphasizes establishing "trauma-informed, sex-positive" clinics. This entails retraining medical staff to use neutral, non-presumptive language when acquiring sexual histories, normalizing routine swabbing identically to how blood pressure is taken, and completely divorcing sexual health from moral implications.</p>
      <p>Researchers concluded that clinics implementing these stigma-reduction protocols saw a 300% increase in patient return rates and substantially higher adherence to post-diagnosis treatment plans.</p>
    `,
    url: "/sti-awareness/addressing-sti-stigma",
    image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2023-10-22T09:40:00Z",
    source: { name: "The Lancet Public Health", url: "#" }
  }
];
