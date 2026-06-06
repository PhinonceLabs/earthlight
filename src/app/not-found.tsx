import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="max-w-md text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-lumify-blue-dark">404</p>
        <h1 className="mb-4 text-4xl font-bold text-lumify-neutral-darker">Page not found</h1>
        <p className="mb-8 text-muted-foreground">
          The Earthlight page you requested does not exist or has moved.
        </p>
        <Button asChild>
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </main>
  );
}
