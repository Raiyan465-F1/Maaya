import { EducationQuizLab } from "@/components/education-quiz-lab";
import { EDUCATION_TRACKS } from "@/lib/education-content";

export default function EducationQuizPage() {
  return <EducationQuizLab tracks={EDUCATION_TRACKS} />;
}
