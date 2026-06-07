"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { reportSnapshots } from "@/server/db/schema";
import { reportSnapshotCreateSchema } from "@/domain/validation/report";
import { validationError, type ActionResult } from "@/features/shared/actions";
import { getProjectForCurrentIdentity } from "@/features/projects/queries";
import { getScenarioForProject } from "@/features/scenarios/queries";
import { getRoiSnapshotForProject } from "@/features/roi/queries";
import { createReportSnapshotData, REPORT_VERSION } from "./normalizers";

function revalidateReportPaths(projectId: string, scenarioId: string, reportId?: string) {
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/scenarios/${scenarioId}`);
  if (reportId) {
    revalidatePath(`/reports/${reportId}`);
  }
}

export async function createReportSnapshot(
  input: unknown,
): Promise<ActionResult<{ reportId: string; reportUrl: string }>> {
  const parsed = reportSnapshotCreateSchema.safeParse(input);
  if (!parsed.success) {
    return validationError("Please fix the highlighted report fields.", parsed.error);
  }

  const [project, scenario] = await Promise.all([
    getProjectForCurrentIdentity(parsed.data.projectId),
    getScenarioForProject(parsed.data.projectId, parsed.data.scenarioId),
  ]);

  if (!project || !scenario) {
    return { ok: false, message: "Project or scenario not found." };
  }

  const roiSnapshot = parsed.data.roiSnapshotId
    ? await getRoiSnapshotForProject(parsed.data.projectId, parsed.data.roiSnapshotId)
    : null;

  if (parsed.data.roiSnapshotId && !roiSnapshot) {
    return { ok: false, message: "ROI snapshot not found." };
  }

  if (roiSnapshot && roiSnapshot.scenarioId !== scenario.id) {
    return { ok: false, message: "ROI snapshot does not belong to the selected scenario." };
  }

  const generatedAt = new Date();
  const reportData = createReportSnapshotData({ project, scenario, roiSnapshot, generatedAt });
  const [createdReport] = await db
    .insert(reportSnapshots)
    .values({
      projectId: project.id,
      scenarioId: scenario.id,
      roiSnapshotId: roiSnapshot?.id ?? null,
      name: parsed.data.name,
      reportVersion: REPORT_VERSION,
      reportData: reportData as typeof reportSnapshots.$inferInsert["reportData"],
      generatedAt,
    })
    .returning({ id: reportSnapshots.id });

  if (!createdReport) {
    return { ok: false, message: "Unable to create report snapshot." };
  }

  revalidateReportPaths(project.id, scenario.id, createdReport.id);

  return {
    ok: true,
    data: {
      reportId: createdReport.id,
      reportUrl: `/reports/${createdReport.id}`,
    },
  };
}
