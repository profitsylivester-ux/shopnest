import type { NextConfig } from "next";

// On a live host (Render, Vercel or a CI build) the website must know where the API is. Stop the build with a
// clear message instead of quietly shipping a site that talks to localhost.
if ((process.env.RENDER || process.env.VERCEL || process.env.CI) && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is missing: set it to the address of the ShopNest API before building.");
}

const nextConfig: NextConfig = {
  devIndicators: false,
};

export default nextConfig;
