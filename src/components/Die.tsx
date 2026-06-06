// A faceted, gem-style d20 drawn in SVG. The shaded facets read as a real,
// dimensional die; a lively 2D shake/scale on roll feels good without the
// edge-on disappearing act of rotating a flat polygon in 3D.

const P = {
  A: "50,5", B: "93,28", C: "93,72", D: "50,95", E: "7,72", F: "7,28",
  T1: "50,34", T2: "29,64", T3: "71,64",
};

type Facet = { pts: string; cls: string };

const FACETS: Facet[] = [
  { pts: `${P.T1} ${P.T2} ${P.T3}`, cls: "f-bright" }, // center (number face)
  { pts: `${P.A} ${P.B} ${P.T1}`, cls: "f-light" },
  { pts: `${P.A} ${P.T1} ${P.F}`, cls: "f-light" },
  { pts: `${P.B} ${P.T3} ${P.T1}`, cls: "f-mid" },
  { pts: `${P.F} ${P.T1} ${P.T2}`, cls: "f-mid" },
  { pts: `${P.F} ${P.T2} ${P.E}`, cls: "f-dark" },
  { pts: `${P.B} ${P.C} ${P.T3}`, cls: "f-dark" },
  { pts: `${P.E} ${P.T2} ${P.D}`, cls: "f-darker" },
  { pts: `${P.T2} ${P.T3} ${P.D}`, cls: "f-middark" },
  { pts: `${P.T3} ${P.C} ${P.D}`, cls: "f-darker" },
];

const OUTLINE = `${P.A} ${P.B} ${P.C} ${P.D} ${P.E} ${P.F}`;

export function Die({
  value,
  rolling = false,
  tone = "gold",
  small = false,
}: {
  value: number | string;
  rolling?: boolean;
  tone?: "gold" | "crit" | "fumble";
  small?: boolean;
}) {
  return (
    <svg
      className={`d20 ${tone} ${rolling ? "rolling" : ""} ${small ? "small" : ""}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label={typeof value === "number" ? `d20 showing ${value}` : "d20"}
    >
      <polygon className="d20-base" points={OUTLINE} />
      {FACETS.map((f, i) => (
        <polygon key={i} className={f.cls} points={f.pts} />
      ))}
      <polygon className="d20-edge" points={OUTLINE} />
      <text x="50" y="56" className="d20-num">
        {value}
      </text>
    </svg>
  );
}
