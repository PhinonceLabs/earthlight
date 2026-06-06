import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Earthlight",
  description: "Science-based lighting schedules for architecture and lighting professionals.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background text-foreground antialiased">
          <AppProviders>{children}</AppProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
