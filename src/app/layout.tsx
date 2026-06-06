import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Sunken Threshold — Learn Pathfinder 2e by Playing",
  description:
    "A single-playthrough, teach-by-playing course that takes a true beginner from their first d20 roll to ready-to-join a real Pathfinder 2e table.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
