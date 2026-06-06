import { notFound, redirect } from "next/navigation";
import { getProjectForCurrentIdentity } from "@/features/projects/queries";
import { ProjectWorkspaceClient } from "@/features/projects/components/ProjectWorkspaceClient";
import { getLatestScenarioForProject, listScenariosForProject } from "@/features/scenarios/queries";

export const runtime = "nodejs";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = await getProjectForCurrentIdentity(projectId);

  if (!project) {
    notFound();
  }

  const latestScenario = await getLatestScenarioForProject(project.id);

  if (latestScenario) {
    redirect(`/projects/${project.id}/scenarios/${latestScenario.id}`);
  }

  const scenarios = await listScenariosForProject(project.id);

  return (
    <ProjectWorkspaceClient
      project={project}
      scenarios={scenarios}
      scenario={null}
      roiSnapshots={[]}
      reportSnapshots={[]}
    />
  );
}
