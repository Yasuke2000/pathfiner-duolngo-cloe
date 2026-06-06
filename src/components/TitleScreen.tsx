import { ALL_CHAPTERS } from "@/lib/chapters";
import { SupportButton } from "./SupportButton";

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="title-screen">
      <div className="title-emblem" aria-hidden>
        <span className="d20">20</span>
      </div>
      <h1 className="title-logo">The Sunken Threshold</h1>
      <p className="title-sub">Learn Pathfinder 2e — by playing it</p>

      <p className="title-pitch">
        Never rolled a d20? Perfect. Over one guided adventure you&apos;ll learn the
        real rules — checks, combat, conditions, dying — build a hero of your own,
        and walk away genuinely ready to sit down at a real table.
      </p>

      <div className="chapter-rail">
        {ALL_CHAPTERS.map((c) => (
          <div className="chapter-pill" key={c.index} style={{ ["--tone" as string]: c.accent } as React.CSSProperties}>
            <span className="num">{c.index}</span>
            {c.title}
          </div>
        ))}
      </div>

      <button className="btn primary big" onClick={onStart}>
        Begin your journey
      </button>
      <p className="muted title-foot">A solo, single-playthrough course · about 20–30 minutes · no account needed</p>
      <SupportButton />
    </div>
  );
}
