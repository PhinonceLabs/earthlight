import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AppProviders } from "./providers";
import "./globals.css";

/**
 * Display font — Fraunces is a variable transitional serif with optical
 * sizing and high stroke contrast. It carries the same editorial "this is a
 * thesis, not a marketing site" feel as the wordmark on earthlight.app
 * (which uses the paid PP Editorial New / Tiempos family). Free, hosted by
 * Google Fonts, perfectly suited to the lighting-architect audience.
 */
/* Variable font — `weight` is omitted intentionally. Variable fonts cannot
   accept a static weight array AND axes at the same time in next/font; this
   form loads the full weight range plus the optical-size and softness axes
   so display sizes pick the right cut automatically. */
const fontDisplay = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
});

/**
 * Body font — DM Sans is a low-contrast geometric sans with humanist warmth.
 * It plays well against a high-contrast serif headline and reads cleanly at
 * 14–16px in dense forms (scenario editor, ROI tables). It echoes the
 * personality of PPMori without requiring a paid license.
 */
/* DM Sans is also variable on Google Fonts (wght axis 100–1000). Letting it
   load the full range keeps the body face flexible without bloating the
   bundle — only the glyph ranges actually used at runtime ship to the
   browser. */
const fontBody = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Earthlight — science-based lighting schedules",
    template: "%s · Earthlight",
  },
  description:
    "Earthlight embeds Human-ROI modeling into lighting design workflows. Quantify impact in financial language before it gets stripped from the project.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${fontDisplay.variable} ${fontBody.variable}`}
      >
        <body className="min-h-screen bg-background text-foreground antialiased">
          <AppProviders>{children}</AppProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
