import { STIDashboard } from "@/components/sti-dashboard";
import { STI_GUIDES, STI_QUICK_ACTIONS, STI_UPDATES } from "@/lib/sti-content";

export const metadata = {
  title: "STI Awareness Hub | Maaya",
  description: "Practical STI guidance for symptoms, testing, prevention, and next-step decisions, with research updates kept secondary.",
};

export default function STIAwarenessPage() {
  return (
    <STIDashboard guides={STI_GUIDES} updates={STI_UPDATES} quickActions={STI_QUICK_ACTIONS} />
  );
}
