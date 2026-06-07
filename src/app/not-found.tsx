import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EarthlightMark } from "@/components/brand/EarthlightLogo";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center bg-background px-4 grain">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid-paper opacity-40" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-sun-mesh" />

      <div className="max-w-md text-center">
        <EarthlightMark size={56} title="Earthlight" className="mx-auto mb-8 animate-pulse-gentle" />
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.32em] text-earthlight-sun-orange">
          404 · off-schedule
        </p>
        <h1 className="mb-4 font-display text-4xl font-medium tracking-tight text-earthlight-ink">
          That page is past sunset.
        </h1>
        <p className="mb-8 text-earthlight-slate">
          The Earthlight page you requested does not exist or has moved.
          Head back to the workspace and pick up where you left off.
        </p>
        <Button asChild className="bg-earthlight-ink text-primary-foreground hover:bg-earthlight-ink-soft">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </main>
  );
}
