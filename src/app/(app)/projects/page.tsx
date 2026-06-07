import { FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listProjectsForCurrentIdentity } from "@/features/projects/queries";
import { ProjectListClient } from "@/features/projects/components/ProjectListClient";

export const runtime = "nodejs";

export default async function ProjectsPage() {
  const projects = await listProjectsForCurrentIdentity();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            Authenticated projects
          </Badge>
          <h1 className="font-display text-4xl font-medium tracking-tight text-earthlight-ink">Projects</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Create authenticated Earthlight projects and persist schedule scenarios in Postgres. Ownership is enforced server-side from Clerk identity.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FolderKanban className="h-4 w-4" />
          {projects.length} project{projects.length === 1 ? "" : "s"}
        </div>
      </div>

      <ProjectListClient projects={projects} />
    </div>
  );
}
