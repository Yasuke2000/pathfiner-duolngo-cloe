"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUi } from "./settings";
import { hasConsented, recordConsent } from "@/dutch/consent";
import { KEY_NOTICE, LEGAL } from "@/dutch/legal";

/**
 * First-visit notice. The key fact — progress is recorded and may be shared with
 * a coach — is in the banner itself, in bold, before any button. The full terms,
 * privacy and cookie texts are one tap away under "read more". This is the
 * transparency mechanism: it exists so nobody is tracked without knowing.
 */
export function ConsentGate() {
  const { t, lang } = useUi();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!hasConsented()) setOpen(true);
  }, []);

  if (!open) return null;

  const doc = LEGAL[lang];

  function accept() {
    recordConsent();
    setOpen(false);
  }

  return (
    <div className="dk-consent-scrim" role="dialog" aria-modal="true" aria-labelledby="dk-consent-title">
      <div className="dk-consent">
        <h2 id="dk-consent-title">{t("consent.title")}</h2>

        <p className="dk-consent-key">{KEY_NOTICE[lang]}</p>

        <button className="dk-link dk-consent-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
          {expanded ? t("consent.less") : t("consent.more")}
        </button>

        {expanded && (
          <div className="dk-consent-body">
            <p className="dk-consent-draft">{doc.updated}</p>
            <p className="dk-muted">{doc.intro}</p>
            {doc.sections.map((sec) => (
              <section key={sec.heading}>
                <h3>{sec.heading}</h3>
                {sec.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </section>
            ))}
          </div>
        )}

        <div className="dk-consent-actions">
          <Link className="dk-link" href="/dutch/legal">
            {t("consent.page")}
          </Link>
          <button className="dk-btn primary" onClick={accept} autoFocus>
            {t("consent.ack")}
          </button>
        </div>
      </div>
    </div>
  );
}
