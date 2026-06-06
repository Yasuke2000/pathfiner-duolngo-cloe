/** @type {import('next').NextConfig} */
const nextConfig = {
  // The whole app is client-side (no server, no DB, no API routes), so we emit
  // a fully static site into ./out — deployable on any static host
  // (Cloudflare Pages/Workers, GitHub Pages, Netlify) as well as Vercel.
  output: "export",
  images: { unoptimized: true },
  // The rules engine is type-checked and unit-tested; we don't gate builds on eslint
  // (no eslint config is shipped in this slice).
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
