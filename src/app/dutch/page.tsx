import { DutchHome } from "@/components/dutch/DutchHome";

export const metadata = {
  title: "Code & Koffie — Nederlands voor informatici",
  description:
    "Leer Nederlands (Vlaams) en tech-Engels in beide richtingen: de les, het labo, de code, de examens en het dagelijks leven in Vlaanderen.",
};

export default function DutchPage() {
  return (
    <main className="shell">
      <DutchHome />
    </main>
  );
}
