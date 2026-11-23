import { CoachView } from "@/components/dutch/CoachView";
import "../dutch.css";

export const metadata = {
  title: "Coach view — Code & Koffie",
  description: "Open a learner's report to see which words and coding concepts need work.",
  robots: { index: false },
};

export default function CoachPage() {
  return (
    <main className="dk-main">
      <CoachView />
    </main>
  );
}
