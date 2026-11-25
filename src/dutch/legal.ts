import type { Lang } from "./settings";

/**
 * The legal texts shown in the consent banner and on the /dutch/legal page.
 *
 * DRAFT. These are plain-language starting points, not vetted legal copy. For
 * any real or internal use they must be reviewed by Legal/DPO and the operator
 * named. The point of this module is that the key fact — progress is recorded
 * and may be shared with a coach — is stated up front, in the banner itself,
 * not buried. That is what makes consent valid under the GDPR (freely given,
 * specific, informed, unambiguous); fine print engineered to be missed does not.
 */

export const CONSENT_VERSION = 1;

/** The one sentence that must stay visible in the banner, never only in the fine print. */
export const KEY_NOTICE: Record<Lang, string> = {
  en: "Your progress — which words and exercises you get right and wrong — is recorded on this device and may be shared with your coach.",
  nl: "Je voortgang — welke woorden en oefeningen je goed en fout hebt — wordt op dit toestel bijgehouden en kan gedeeld worden met je begeleider.",
};

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const en: LegalDoc = {
  title: "Terms, privacy & cookies",
  updated: "Draft — to be reviewed before use",
  intro:
    "Code & Koffie is a free tool for learning Dutch and tech English. This page explains what it stores and what is shared. It is a plain-language draft and is not legal advice.",
  sections: [
    {
      heading: "What is recorded",
      body: [
        "As you practise, the app records which words, sentences and questions you have seen, and which you got right or wrong, together with the date. It uses this to decide what to show you next and to track your progress.",
        "It does not ask for your name, e-mail address or any other identifying detail, and it does not try to find out who you are.",
      ],
    },
    {
      heading: "Where it is stored",
      body: [
        "Everything is stored in your own browser, on the device you use, in local storage. It is not sent to a server by default, there is no account, and it is not shared with anyone unless you take an action that shares it.",
        "Because it lives in your browser, clearing your browser data or using another device starts from zero, unless you export a backup first.",
      ],
    },
    {
      heading: "Sharing with a coach",
      body: [
        "This tool is meant to be used with a coach or teacher who helps you. Your progress — the words and questions you get wrong, and how regularly you practise — can be shared with them, so they can see where you are stuck and help you with it.",
        "You should know this is happening: it is stated on the welcome screen, not only here. If you do not want your progress shared, do not send a report and do not turn on shared progress.",
        "Today sharing happens only when you choose to: you send a report code or file. A live, automatic sharing option may be added later; if it is, it will be shown clearly and you will be able to see and turn it off, and this page will say so.",
      ],
    },
    {
      heading: "Cookies & storage",
      body: [
        "The app does not use advertising or tracking cookies. It uses your browser's local storage to remember your progress and your settings (language, theme, and that you have seen this notice). That storage stays on your device.",
      ],
    },
    {
      heading: "Your choices",
      body: [
        "You can export your progress as a backup, import it on another device, or erase everything, all from the Progress tab. Erasing removes the data from this browser.",
        "If this tool is provided by an organisation, you have the rights the GDPR gives you over your personal data — to see it, correct it, or have it deleted. Contact the organisation that gave you the tool.",
      ],
    },
    {
      heading: "No warranty",
      body: [
        "The course content is for learning and may contain mistakes; it is not professional language certification. Use it as practice, not as the final word.",
      ],
    },
  ],
};

const nl: LegalDoc = {
  title: "Voorwaarden, privacy & cookies",
  updated: "Ontwerp — na te kijken voor gebruik",
  intro:
    "Code & Koffie is een gratis hulpmiddel om Nederlands en tech-Engels te leren. Deze pagina legt uit wat er bewaard wordt en wat gedeeld wordt. Het is een ontwerp in gewone taal en geen juridisch advies.",
  sections: [
    {
      heading: "Wat wordt bijgehouden",
      body: [
        "Terwijl je oefent, houdt de app bij welke woorden, zinnen en vragen je gezien hebt, en welke je goed of fout had, met de datum erbij. Daarmee bepaalt de app wat je daarna te zien krijgt en volgt ze je voortgang.",
        "Er wordt niet naar je naam, e-mailadres of andere identificerende gegevens gevraagd, en er wordt niet achterhaald wie je bent.",
      ],
    },
    {
      heading: "Waar het bewaard wordt",
      body: [
        "Alles wordt bewaard in je eigen browser, op het toestel dat je gebruikt (local storage). Het wordt standaard niet naar een server gestuurd, er is geen account, en het wordt met niemand gedeeld tenzij je zelf een handeling doet die het deelt.",
        "Omdat het in je browser staat, begin je opnieuw als je je browsergegevens wist of een ander toestel gebruikt, tenzij je eerst een back-up exporteert.",
      ],
    },
    {
      heading: "Delen met een begeleider",
      body: [
        "Dit hulpmiddel is bedoeld om samen met een begeleider of leerkracht te gebruiken. Je voortgang — de woorden en vragen die je fout hebt, en hoe regelmatig je oefent — kan met hen gedeeld worden, zodat ze zien waar je vastzit en je daarbij kunnen helpen.",
        "Je hoort dit te weten: het staat op het welkomstscherm, niet alleen hier. Wil je je voortgang niet delen, stuur dan geen rapport en zet gedeelde voortgang niet aan.",
        "Vandaag gebeurt delen alleen als je dat zelf kiest: je stuurt een rapportcode of -bestand. Later komt er mogelijk een live, automatische manier van delen; als die er komt, wordt ze duidelijk getoond, kan je ze zien en uitzetten, en zegt deze pagina dat.",
      ],
    },
    {
      heading: "Cookies & opslag",
      body: [
        "De app gebruikt geen reclame- of trackingcookies. Ze gebruikt de local storage van je browser om je voortgang en je instellingen te onthouden (taal, thema, en dat je deze melding gezien hebt). Die opslag blijft op je toestel.",
      ],
    },
    {
      heading: "Jouw keuzes",
      body: [
        "Je kan je voortgang als back-up exporteren, op een ander toestel importeren, of alles wissen, allemaal via het tabblad Voortgang. Wissen verwijdert de gegevens uit deze browser.",
        "Wordt dit hulpmiddel door een organisatie aangeboden, dan heb je de rechten die de AVG je over je persoonsgegevens geeft — inzage, verbetering of verwijdering. Neem contact op met de organisatie die je het hulpmiddel gaf.",
      ],
    },
    {
      heading: "Geen garantie",
      body: [
        "De cursusinhoud dient om te leren en kan fouten bevatten; het is geen professioneel taalcertificaat. Gebruik ze als oefening, niet als het laatste woord.",
      ],
    },
  ],
};

export const LEGAL: Record<Lang, LegalDoc> = { en, nl };
