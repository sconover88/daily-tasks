import type { MetadataRoute } from "next";

// Lets the phone "Add to Home Screen" and open it like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daily Tasks",
    short_name: "Tasks",
    description: "My personal daily task list.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfcfd",
    theme_color: "#fcfcfd",
    icons: [
      { src: "/app-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/app-icon/512", sizes: "512x512", type: "image/png" },
      { src: "/app-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
