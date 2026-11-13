import type { MetadataRoute } from "next";

// Personal app: ask every crawler to stay out.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
