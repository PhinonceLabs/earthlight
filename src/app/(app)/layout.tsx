import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { EarthlightWordmark } from "@/components/brand/EarthlightLogo";

/**
 * Authenticated shell.
 *
 * Belt-and-suspenders auth: proxy.ts already gates /projects, /reports, /api,
 * and we still call auth.protect() here so this layout cannot accidentally
 * render to an anonymous viewer if the middleware matcher ever drifts.
 */
export default async function AuthenticatedAppLayout({ children }: { children: React.ReactNode }) {
  await auth.protect();

  return (
    <div className="relative isolate min-h-screen bg-background text-foreground">
      {/* Quiet paper texture so the shell still feels like the brand even on
          dense pages (project workspace, report builder). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid-paper opacity-30" />

      <header className="sticky top-0 z-30 border-b border-earthlight-hairline bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/projects"
            className="rounded-md outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <EarthlightWordmark markSize={26} className="text-base" />
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Button variant="ghost" asChild className="text-earthlight-ink hover:bg-earthlight-paper-deep/60">
              <Link href="/projects">Projects</Link>
            </Button>
            <span className="mx-1 h-5 w-px bg-earthlight-hairline" aria-hidden />
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8 ring-1 ring-earthlight-hairline",
                  userButtonPopoverCard: "shadow-xl border-earthlight-hairline",
                },
              }}
            />
          </nav>
        </div>
        {/* Sun-gradient hairline — the brand mark's color signature, used as a
            quiet structural element rather than a decoration. */}
        <div aria-hidden className="h-px w-full border-sun-hairline opacity-70" />
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
