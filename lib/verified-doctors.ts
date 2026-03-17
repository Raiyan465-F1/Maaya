export type VerifiedDoctor = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image: string;
};

export const verifiedDoctors: VerifiedDoctor[] = [
  {
    id: "nadia-islam",
    name: "Dr. Nadia Islam",
    specialty: "Gynecologist",
    bio: "Supports patients with irregular cycles, PCOS management, and long-term reproductive health planning.",
    image: "/verified-doctors/dr-nadia-islam.svg",
  },
  {
    id: "sabrina-rahman",
    name: "Dr. Sabrina Rahman",
    specialty: "Obstetrician & Maternal Care",
    bio: "Focuses on prenatal and postpartum guidance, helping users navigate safe and informed pregnancy care.",
    image: "/verified-doctors/dr-sabrina-rahman.svg",
  },
  {
    id: "maisha-haque",
    name: "Dr. Maisha Haque",
    specialty: "Endocrinologist",
    bio: "Works with hormonal health concerns including thyroid conditions, acne-related cycles, and metabolic balance.",
    image: "/verified-doctors/dr-maisha-haque.svg",
  },
  {
    id: "farzana-chowdhury",
    name: "Dr. Farzana Chowdhury",
    specialty: "Sexual & Reproductive Health",
    bio: "Provides evidence-based education on STI prevention, consent, and confidential sexual wellness support.",
    image: "/verified-doctors/dr-farzana-chowdhury.svg",
  },
];

export function getVerifiedDoctorById(id: string) {
  return verifiedDoctors.find((doctor) => doctor.id === id);
}
