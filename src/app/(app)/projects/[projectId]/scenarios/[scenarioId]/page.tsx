import { notFound } from "next/navigation";
import { getProjectForCurrentIdentity } from "@/features/projects/queries";
import { ProjectWorkspaceClient } from "@/features/projects/components/ProjectWorkspaceClient";
import { listRoiSnapshotsForScenario } from "@/features/roi/queries";
import { listReportSnapshotsForScenario } from "@/features/reports/queries";
import { getScenarioForProject, listScenariosForProject } from "@/features/scenarios/queries";

export const runtime = "nodejs";

type ScenarioPageProps = {
  params: Promise<{ projectId: string; scenarioId: string }>;
};

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const { projectId, scenarioId } = await params;
  const [project, scenario] = await Promise.all([
    getProjectForCurrentIdentity(projectId),
    getScenarioForProject(projectId, scenarioId),
  ]);

  if (!project || !scenario) {
    notFound();
  }

  const [scenarios, roiSnapshots, reportSnapshots] = await Promise.all([
    listScenariosForProject(project.id),
    listRoiSnapshotsForScenario(project.id, scenario.id),
    listReportSnapshotsForScenario(project.id, scenario.id),
  ]);

  return (
    <ProjectWorkspaceClient
      project={project}
      scenarios={scenarios}
      scenario={scenario}
      roiSnapshots={roiSnapshots}
      reportSnapshots={reportSnapshots}
    />
  );
}
