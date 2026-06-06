import { ALL_CHAPTERS } from "@/lib/chapters";
import { Die } from "./Die";
import { SupportButton } from "./SupportButton";

export function TitleScreen({
  onStart,
  onContinue,
  canContinue = false,
}: {
  onStart: (mode: "full" | "short") => void;
  onContinue?: () => void;
  canContinue?: boolean;
}) {
  return (
    <div className="title-screen">
      <div className="title-emblem" aria-hidden>
        <Die value={20} />
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

      {canContinue && (
        <button className="btn primary big" onClick={onContinue}>
          Continue your journey
        </button>
      )}

      <div className="mode-cta">
        {canContinue && <div className="mode-divider">or start over</div>}
        <button className="btn mode-btn" onClick={() => onStart("full")}>
          Full Story
          <span className="hint">the complete origin — branching choices, a dark path, and a finale that becomes your backstory · ~30 min</span>
        </button>
        <button className="btn mode-btn" onClick={() => onStart("short")}>
          Quick Lessons
          <span className="hint">just the rules, taught by playing — no long story · ~15 min</span>
        </button>
      </div>
      <p className="title-foot">
        <a className="text-btn" href="/create">Just want to build a character? →</a>
        {"  ·  "}
        <a className="text-btn" href="/about">About</a>
      </p>
      <p className="muted">A solo, single-playthrough course · no account needed</p>
      <SupportButton />
    </div>
  );
}
