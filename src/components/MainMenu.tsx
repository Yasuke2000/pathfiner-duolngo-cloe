import Link from "next/link";
import { Die } from "./Die";

/**
 * The hub. Two courses with deliberately opposite shapes: the Pathfinder one is
 * a single playthrough you graduate from, the Dutch one is a trainer you come
 * back to. The menu says so, so nobody expects streaks from one or a finish
 * line from the other.
 */
export function MainMenu() {
  return (
    <div className="menu">
      <div className="title-emblem" aria-hidden>
        <Die value={20} />
      </div>
      <h1 className="title-logo">The Academy</h1>
      <p className="title-sub">Two courses. Pick your class.</p>

      <div className="menu-grid">
        <Link className="menu-card" href="/play" style={{ ["--tone" as string]: "265 75% 68%" } as React.CSSProperties}>
          <span className="menu-glyph" aria-hidden>
            🎲
          </span>
          <h2>The Sunken Threshold</h2>
          <p className="menu-tag">Learn Pathfinder 2e — by playing it</p>
          <p className="menu-blurb">
            A solo origin adventure that teaches the real rules as you descend: checks, the
            three-action turn, combat, conditions, dying. Build a hero and walk away ready for a
            real table.
          </p>
          <span className="menu-meta">One playthrough · 20–30 min · you graduate once</span>
          <span className="menu-go">Begin →</span>
        </Link>

        <Link className="menu-card" href="/dutch" style={{ ["--tone" as string]: "160 70% 55%" } as React.CSSProperties}>
          <span className="menu-glyph" aria-hidden>
            ☕
          </span>
          <h2>Code &amp; Koffie</h2>
          <p className="menu-tag">Nederlands &amp; Engels voor IT — Dutch &amp; English for tech people</p>
          <p className="menu-blurb">
            The working language of IT, both ways: programming, systems, networks, cloud, security,
            the helpdesk, business IT and AI — plus everyday Flemish. Vocabulary, sentences,
            real code and commands, grammar and a dictionary.
          </p>
          <span className="menu-meta">Paths for students, IT staff and developers · works on your phone</span>
          <span className="menu-go">Start →</span>
        </Link>
      </div>

      <div className="menu-tools">
        <Link className="text-btn" href="/create">
          Character builder
        </Link>
        <Link className="text-btn" href="/gm">
          GM decoder
        </Link>
        <Link className="text-btn" href="/dutch/coach">
          Coach view
        </Link>
        <Link className="text-btn" href="/about">
          About
        </Link>
      </div>
    </div>
  );
}
