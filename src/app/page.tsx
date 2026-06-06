import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Science-based schedules",
    description: "Model circadian-aware lighting plans from standards and custom occupant rhythms.",
    icon: Clock,
  },
  {
    title: "Professional workflow ready",
    description: "Preserve the shadcn interface while preparing authenticated project workspaces.",
    icon: Sparkles,
  },
  {
    title: "Authenticated foundation",
    description: "Clerk-protected routes are in place before persistence arrives in later phases.",
    icon: ShieldCheck,
  },
];

export default async function LandingPage() {
  const { isAuthenticated } = await auth();

  if (isAuthenticated) {
    redirect("/projects");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <section className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-8 inline-flex rounded-full border bg-white/70 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
          Earthlight Next.js POC foundation
        </div>
        <h1 className="mb-6 max-w-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
          Science-based lighting schedules for professional projects
        </h1>
        <p className="mx-auto mb-10 max-w-3xl text-lg text-muted-foreground md:text-xl">
          Build lighting schedules for architecture and lighting teams with a secure App Router foundation.
          Project persistence, scenarios, ROI snapshots, and reports are intentionally deferred to later phases.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/sign-in">
              Sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/projects" prefetch={false}>
              View protected app shell
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid w-full max-w-5xl gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="border-white/70 bg-white/75 text-left shadow-sm backdrop-blur">
              <CardHeader>
                <item.icon className="mb-3 h-8 w-8 text-lumify-blue-dark" />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Phase 1 keeps this route public while authenticated work starts under <code>/projects</code>.
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
