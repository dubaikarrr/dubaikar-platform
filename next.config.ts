import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server's client JS/HMR to load when the site is opened from
  // another device on the LAN (e.g. a phone at http://192.168.1.11:5000).
  // Without this, Next 16 blocks cross-origin dev assets, so pages render but
  // don't hydrate (onClick handlers like the theme/notifications buttons die).
  allowedDevOrigins: ["192.168.1.11", "localhost", "127.0.0.1"],

  // PDF routes (budget + resume) launch headless Chromium via @sparticuz/chromium
  // on Vercel. Both packages must NOT be bundled by Next, or the function
  // exceeds the size limit and PDF generation silently fails.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],

  // Serve the founder's exact homepage (public/home.html) at "/".
  // beforeFiles runs ahead of the app route, so it wins over app/(marketing)/page.tsx.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/home.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
