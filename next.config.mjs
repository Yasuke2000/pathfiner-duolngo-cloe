/** @type {import('next').NextConfig} */
const nextConfig = {
  // The rules engine is type-checked and unit-tested; we don't gate builds on eslint
  // (no eslint config is shipped in this slice).
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
