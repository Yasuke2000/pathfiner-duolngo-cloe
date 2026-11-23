"use client";

import { useState } from "react";
import { useUi } from "./settings";
import { DAILY_GOAL } from "@/dutch/progress";
import type { ActivityDay, Strength } from "@/dutch/stats";

/** Shared figures for the coach view: stat tile, activity chart, memory bar. */

export function Kpi({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="dk-kpi">
      <span className="label">{label}</span>
      <b className="value">{value}</b>
      {sub && <span className="sub">{sub}</span>}
    </div>
  );
}

/** Round the axis top up to a clean number that leaves headroom above the goal. */
function axisTop(max: number): number {
  const step = max <= 200 ? 50 : max <= 500 ? 100 : 250;
  return Math.max(step * 2, Math.ceil(max / step) * step);
}

/** XP per day: a single-series column chart with the daily goal as a reference line. */
export function ActivityChart({ series }: { series: ActivityDay[] }) {
  const { t, lang } = useUi();
  const [active, setActive] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);

  const max = Math.max(DAILY_GOAL, ...series.map((d) => d.xp));
  const top = axisTop(max);
  const ticks = [top, top / 2, 0];
  const empty = series.every((d) => d.xp === 0);
  const fmt = (day: string) =>
    new Date(`${day}T12:00:00`).toLocaleDateString(lang === "nl" ? "nl-BE" : "en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  const hovered = active === null ? null : series[active];

  return (
    <>
      <div className="dk-panel-head">
        <div>
          <h2>{t("prog.activity")}</h2>
          <p className="dk-panel-sub">{t("prog.activity.sub")}</p>
        </div>
        <button className="dk-btn ghost sm" onClick={() => setAsTable(!asTable)}>
          {asTable ? t("prog.chart") : t("prog.table")}
        </button>
      </div>

      {asTable ? (
        <table className="dk-table">
          <thead>
            <tr>
              <th>{t("prog.col.day")}</th>
              <th>{t("prog.col.xp")}</th>
              <th>{t("prog.col.answers")}</th>
              <th>{t("prog.col.correct")}</th>
            </tr>
          </thead>
          <tbody>
            {[...series].reverse().map((d) => (
              <tr key={d.day}>
                <td>{fmt(d.day)}</td>
                <td>{d.xp}</td>
                <td>{d.n}</td>
                <td>{d.ok}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="dk-chart" onMouseLeave={() => setActive(null)}>
          <div className="dk-chart-y" aria-hidden>
            {ticks.map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
          <div className="dk-chart-plot">
            {ticks.map((v) => (
              <span key={v} className="grid" style={{ bottom: `${(v / top) * 100}%` }} aria-hidden />
            ))}
            <span className="goal" style={{ bottom: `${(DAILY_GOAL / top) * 100}%` }} aria-hidden />

            <div className="dk-chart-cols">
              {series.map((d, i) => (
                <div
                  key={d.day}
                  className={`col ${active === i ? "on" : ""}`}
                  tabIndex={0}
                  role="img"
                  aria-label={`${fmt(d.day)}: ${t("prog.activity.tip", { xp: d.xp, n: d.n, ok: d.ok })}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                >
                  {d.xp > 0 && (
                    <span className="bar" style={{ height: `${(d.xp / top) * 100}%` }}>
                      {d.isToday && <em>{d.xp}</em>}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {hovered && active !== null && (
              <div
                className="dk-tip"
                style={{
                  left: `${((active + 0.5) / series.length) * 100}%`,
                  bottom: `calc(${(hovered.xp / top) * 100}% + 10px)`,
                  transform: `translateX(${active < 2 ? "-20%" : active > series.length - 3 ? "-80%" : "-50%"})`,
                }}
                role="status"
              >
                <b>{hovered.xp} XP</b>
                <span>{fmt(hovered.day)}</span>
                <span>
                  {hovered.n} · {hovered.ok} ✓
                </span>
              </div>
            )}
          </div>
          <div className="dk-chart-x" aria-hidden>
            {series.map((d) => (
              <span key={d.day} className={d.isToday ? "today" : ""}>
                {d.label}
              </span>
            ))}
          </div>
        </div>
      )}
      {!asTable && (
        <p className="dk-chart-key">
          <span className="line" aria-hidden /> {t("prog.activity.goal")} · {DAILY_GOAL} XP
        </p>
      )}
      {empty && !asTable && <p className="dk-muted dk-chart-empty">{t("prog.activity.none")}</p>}
    </>
  );
}

/** Where every item stands in memory: one whole, split into ordered parts. */
export function MemoryBar({ strength, total }: { strength: Strength; total: number }) {
  const { t } = useUi();
  // Ordered from strongest to weakest, so the bar reads like a progress bar.
  const parts = [
    { key: "known", label: t("prog.mem.known"), n: strength.known },
    { key: "almost", label: t("prog.mem.almost"), n: strength.almost },
    { key: "learning", label: t("prog.mem.learning"), n: strength.learning },
    { key: "unseen", label: t("prog.mem.unseen"), n: strength.unseen },
  ];
  const share = (n: number) => (total ? (n / total) * 100 : 0);

  return (
    <>
      <div className="dk-segbar" role="img" aria-label={parts.map((p) => `${p.label}: ${p.n}`).join(", ")}>
        {parts
          .filter((p) => p.n > 0)
          .map((p) => (
            <span
              key={p.key}
              className={`dk-segpart ${p.key}`}
              style={{ flexGrow: p.n }}
              title={`${p.label}: ${p.n} (${Math.round(share(p.n))}%)`}
            >
              {share(p.n) >= 9 && <i>{Math.round(share(p.n))}%</i>}
            </span>
          ))}
      </div>
      <ul className="dk-legend">
        {parts.map((p) => (
          <li key={p.key}>
            <span className={`swatch ${p.key}`} aria-hidden />
            <span className="name">{p.label}</span>
            <span className="fig">{p.n}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
