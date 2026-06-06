// ---------------------------------------------------------------------------
// Project configuration you can edit without touching any other code.
// ---------------------------------------------------------------------------

/**
 * Your donation / support page (Ko-fi, Patreon, Buy Me a Coffee, GitHub Sponsors…).
 *
 * Donations are the ONLY monetization allowed here: this project uses Paizo's
 * Community Use Policy, which forbids charging for access or any paywall, but
 * explicitly permits donations. Leave this as "" to hide the Support buttons;
 * paste your real link to turn them on everywhere (title screen, settings,
 * graduation).
 */
export const SUPPORT_URL = ""; // e.g. "https://ko-fi.com/your-handle"

export const hasSupport = (): boolean => SUPPORT_URL.trim().length > 0;

/** Required Community Use / licensing notice shown in the About panel. */
export const COMMUNITY_USE_NOTICE =
  "This is unofficial fan content. It uses the Pathfinder 2e rules under Paizo's " +
  "Community Use Policy and the ORC/OGL, and is not published, endorsed, or " +
  "approved by Paizo. Pathfinder and associated marks are property of Paizo Inc. " +
  "All teaching fiction here is original. This project is free — donations are " +
  "welcome but never required, and nothing is locked behind a paywall.";
