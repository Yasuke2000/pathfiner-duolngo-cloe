"use client";

import Link from "next/link";
import { SettingsProvider, useUi } from "./settings";
import { IconMoon, IconSun } from "./icons";
import { KEY_NOTICE, LEGAL } from "@/dutch/legal";

/** The full legal text as its own page, linked from the banner and the footer. */
export function LegalView() {
  return (
    <SettingsProvider>
      <Legal />
    </SettingsProvider>
  );
}

function Legal() {
  const { t, lang, theme, setLang, setTheme } = useUi();
  const doc = LEGAL[lang];
  return (
    <div className="dk" data-theme={theme}>
      <header className="dk-top solo">
        <div className="dk-wrap">
          <div className="dk-top-row">
            <div className="dk-brand">
              <Link className="dk-link" href="/dutch" aria-label="Code & Koffie">
                ← <span className="dk-hide-sm">Code &amp; Koffie</span>
              </Link>
              <h1>{t("consent.page")}</h1>
            </div>
            <div className="dk-tools">
              <div className="dk-seg" role="group" aria-label={t("settings.lang")}>
                {(["en", "nl"] as const).map((l) => (
                  <button key={l} className={lang === l ? "on" : ""} aria-pressed={lang === l} onClick={() => setLang(l)}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                className="dk-icon-btn"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={t(theme === "dark" ? "settings.theme.light" : "settings.theme.dark")}
              >
                {theme === "dark" ? <IconSun size={17} /> : <IconMoon size={17} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="dk-wrap">
        <article className="dk-page dk-legal">
          <p className="dk-consent-draft">{doc.updated}</p>
          <h2>{doc.title}</h2>
          <p className="dk-consent-key">{KEY_NOTICE[lang]}</p>
          <p className="dk-muted">{doc.intro}</p>
          {doc.sections.map((sec) => (
            <section key={sec.heading}>
              <h3>{sec.heading}</h3>
              {sec.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
