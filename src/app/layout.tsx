import type { Metadata, Viewport } from "next";
import { Cinzel, Inter, Spectral } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

// Fonts are self-hosted at build time (downloaded and bundled into the static
// output), so the deployed game makes no external font requests — it runs fully
// local / offline once loaded.
const cinzel = Cinzel({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
const spectral = Spectral({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-prose", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://pathfiner-duolngo-cloe.delportedavid21.workers.dev"),
  title: "The Sunken Threshold — Learn Pathfinder 2e by Playing",
  description:
    "A free, solo, play-in-your-browser origin adventure that teaches Pathfinder 2e by playing — from your first d20 roll to a built hero, ready for a real table.",
  manifest: "./manifest.webmanifest",
  icons: { icon: "./icon.svg", apple: "./icon.svg" },
  appleWebApp: { capable: true, title: "Sunken Threshold", statusBarStyle: "black-translucent" },
  openGraph: {
    title: "The Sunken Threshold — Learn Pathfinder 2e by Playing",
    description:
      "A free, solo, play-in-your-browser origin adventure that teaches Pathfinder 2e by playing.",
    type: "website",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "The Sunken Threshold" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Sunken Threshold — Learn Pathfinder 2e by Playing",
    description: "A free, solo, browser adventure that teaches Pathfinder 2e by playing.",
    images: ["/og.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0c17",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable} ${spectral.variable}`}>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
