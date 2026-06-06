interface AvatarDef {
  glyph: string;
  tone: string;
  role: string;
}

/** Recurring characters get a portrait medallion; everything else is a chip. */
const AVATARS: Record<string, AvatarDef> = {
  Tahar: { glyph: "⚙️", tone: "265 70% 66%", role: "Artificer · walked a hundred worlds" },
};

export function Speaker({ name }: { name: string }) {
  const a = AVATARS[name];
  if (!a) return <span className="speaker">{name}</span>;
  return (
    <div className="speaker-box">
      <span className="avatar" style={{ ["--tone" as string]: a.tone } as React.CSSProperties}>
        {a.glyph}
      </span>
      <div className="speaker-meta">
        <span className="speaker-name">{name}</span>
        <span className="speaker-role">{a.role}</span>
      </div>
    </div>
  );
}
