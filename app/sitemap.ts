import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hajat.vercel.app";
  const lastUpdated = new Date("2026-08-12");

  return [
    {
      url: `${baseUrl}`,
      lastModified: lastUpdated,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/journey`,
      lastModified: lastUpdated,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: lastUpdated,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: lastUpdated,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ecl-b2`,
      lastModified: lastUpdated,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];
}

