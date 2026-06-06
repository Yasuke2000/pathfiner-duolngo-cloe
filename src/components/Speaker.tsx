interface AvatarDef {
  glyph: string;
  tone: string;
}

/** Recurring characters get a portrait medallion; everything else is a chip. */
const AVATARS: Record<string, AvatarDef> = {
  Yasuke: { glyph: "🛡️", tone: "26 80% 60%" },
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
        <span className="speaker-role">your companion</span>
      </div>
    </div>
  );
}
