import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { EarthlightWordmark } from "@/components/brand/EarthlightLogo";

export default function SignUpPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col bg-background text-foreground grain">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid-paper opacity-40" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-sun-mesh" />

      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <Link href="/" aria-label="Back to Earthlight home">
          <EarthlightWordmark markSize={26} className="text-base" />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-earthlight-slate">
              Get started
            </p>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-earthlight-ink">
              Create your Earthlight account
            </h1>
          </div>
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-xl border border-earthlight-hairline bg-card",
                headerTitle: "font-display",
                formButtonPrimary:
                  "bg-earthlight-ink text-primary-foreground hover:bg-earthlight-ink-soft",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
