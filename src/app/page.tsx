import { MainMenu } from "@/components/MainMenu";

export const metadata = {
  title: "The Academy — Learn Pathfinder 2e, or Dutch for computer science",
};

export default function Home() {
  return (
    <main className="shell">
      <MainMenu />
    </main>
  );
}
