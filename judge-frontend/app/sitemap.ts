import type { MetadataRoute } from "next";

const publicRoutes = [
  "/",
  "/docs",
  "/forum",
  "/login",
  "/register",
  "/register/confirmation",
  "/meet-developer",
  "/code-judge",
  "/code-ide",
  "/code-analysis",
];

function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: new URL(route, baseUrl).toString(),
    lastModified,
  }));
}
