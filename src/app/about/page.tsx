import Link from "next/link";
import { COMMUNITY_USE_NOTICE } from "@/lib/config";

export const metadata = {
  title: "About — The Sunken Threshold",
};

export default function AboutPage() {
  return (
    <main className="shell">
      <div style={{ marginBottom: 16 }}>
        <Link className="text-btn" href="/">← Back</Link>
      </div>
      <div className="card">
        <h2>About</h2>
        <p className="prose">
          <b>The Sunken Threshold</b> is a free, solo, play-in-your-browser adventure that teaches
          Pathfinder 2e (Remaster) by playing it. You begin as a nobody who stumbles into a drowned
          dungeon, get imbued by a planar shard, and a worldwalking artificer named Tahar teaches you
          the rules as you descend — checks, the three-action turn, party combat, conditions, dying —
          then you build a hero of your own and face a capstone with a choice that echoes your origin.
        </p>
        <p className="prose">
          Everything you do is sealed into a record your Game Master can decode (at <Link className="text-btn" href="/gm">/gm</Link>)
          to learn what you did and grant a fitting curse &amp; blessing — so this whole thing slots in as
          your character&apos;s secret backstory. Just want to roll a character? Use
          the <Link className="text-btn" href="/create">standalone builder</Link>.
        </p>

        <h3 className="section-h">Licensing</h3>
        <p className="about-notice">{COMMUNITY_USE_NOTICE}</p>

        <h3 className="section-h">Built on research</h3>
        <p className="prose">
          The design and rules are grounded in published sources — Paizo&apos;s Player Core / GM Core and
          Archives of Nethys for accuracy; interactive-fiction craft from inkle, Failbetter / Emily Short,
          Disco Elysium, and Choice of Games; and beginner-dungeon design from the Five Room Dungeon,
          Alphastream, and Sly Flourish. The repository&apos;s <code>docs/</code> folder documents the
          research, the branch map, and the rules-accuracy audit.
        </p>

        <div className="actions" style={{ marginTop: 18 }}>
          <Link className="btn primary" href="/" style={{ textAlign: "center" }}>
            Play
          </Link>
        </div>
      </div>
    </main>
  );
}
