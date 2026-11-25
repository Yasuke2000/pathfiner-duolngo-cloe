import { LegalView } from "@/components/dutch/LegalView";
import "../dutch.css";

export const metadata = {
  title: "Voorwaarden, privacy & cookies — Code & Koffie",
  robots: { index: false },
};

export default function LegalPage() {
  return (
    <main className="dk-main">
      <LegalView />
    </main>
  );
}
