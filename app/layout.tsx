import type { Metadata, Viewport } from "next";
import { Host_Grotesk, Instrument_Sans } from "next/font/google";
import TabBar from "@/components/TabBar";
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-host-grotesk",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Daily Tasks", template: "%s · Daily Tasks" },
  description: "My personal daily task list.",
  // Personal app: keep it out of search results.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  appleWebApp: { capable: true, title: "Daily Tasks", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fcfcfd",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${hostGrotesk.variable} ${instrumentSans.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-action focus:px-4 focus:py-3 focus:text-action-ink"
        >
          Skip to content
        </a>
        <main
          id="main"
          className="mx-auto w-full max-w-xl px-[var(--page-margin)] pt-[max(1.5rem,env(safe-area-inset-top))] pb-[calc(var(--tabbar-height)+2.5rem+env(safe-area-inset-bottom))]"
        >
          {children}
        </main>
        <TabBar />
      </body>
    </html>
  );
}
