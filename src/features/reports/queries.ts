import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { projectIdAccessWhere, projectAccessWhere } from "@/server/auth/authorization";
import { requireAppIdentity } from "@/server/auth/identity";
import { db } from "@/server/db";
import { projects, reportSnapshots } from "@/server/db/schema";
import { reportSnapshotDataSchema, type ReportSnapshotData } from "@/server/validation/report";

export type ReportSnapshotSummaryDTO = {
  id: string;
  projectId: string;
  scenarioId: string | null;
  roiSnapshotId: string | null;
  name: string;
  reportVersion: string;
  generatedAt: string;
  createdAt: string;
};

export type ReportSnapshotDTO = ReportSnapshotSummaryDTO & {
  reportData: ReportSnapshotData;
};

type ReportSnapshotRow = typeof reportSnapshots.$inferSelect;

function toReportSnapshotSummaryDTO(row: ReportSnapshotRow): ReportSnapshotSummaryDTO {
  return {
    id: row.id,
    projectId: row.projectId,
    scenarioId: row.scenarioId,
    roiSnapshotId: row.roiSnapshotId,
    name: row.name,
    reportVersion: row.reportVersion,
    generatedAt: row.generatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

function toReportSnapshotDTO(row: ReportSnapshotRow): ReportSnapshotDTO | null {
  const reportData = reportSnapshotDataSchema.safeParse(row.reportData);
  if (!reportData.success) {
    return null;
  }

  return {
    ...toReportSnapshotSummaryDTO(row),
    reportData: reportData.data,
  };
}

export async function listReportSnapshotsForScenario(
  projectId: string,
  scenarioId: string,
  limit = 5,
): Promise<ReportSnapshotSummaryDTO[]> {
  const identity = await requireAppIdentity();
  const rows = await db
    .select({
      id: reportSnapshots.id,
      projectId: reportSnapshots.projectId,
      scenarioId: reportSnapshots.scenarioId,
      roiSnapshotId: reportSnapshots.roiSnapshotId,
      name: reportSnapshots.name,
      reportVersion: reportSnapshots.reportVersion,
      reportData: reportSnapshots.reportData,
      generatedAt: reportSnapshots.generatedAt,
      createdAt: reportSnapshots.createdAt,
    })
    .from(reportSnapshots)
    .innerJoin(projects, eq(projects.id, reportSnapshots.projectId))
    .where(
      and(
        eq(reportSnapshots.scenarioId, scenarioId),
        projectIdAccessWhere(projectId, identity),
      ),
    )
    .orderBy(desc(reportSnapshots.createdAt))
    .limit(limit);

  return rows.map(toReportSnapshotSummaryDTO);
}

export async function getReportSnapshotForCurrentIdentity(
  reportId: string,
): Promise<ReportSnapshotDTO | null> {
  const identity = await requireAppIdentity();
  const row = await db
    .select({
      id: reportSnapshots.id,
      projectId: reportSnapshots.projectId,
      scenarioId: reportSnapshots.scenarioId,
      roiSnapshotId: reportSnapshots.roiSnapshotId,
      name: reportSnapshots.name,
      reportVersion: reportSnapshots.reportVersion,
      reportData: reportSnapshots.reportData,
      generatedAt: reportSnapshots.generatedAt,
      createdAt: reportSnapshots.createdAt,
    })
    .from(reportSnapshots)
    .innerJoin(projects, eq(projects.id, reportSnapshots.projectId))
    .where(and(eq(reportSnapshots.id, reportId), projectAccessWhere(identity)))
    .limit(1)
    .then((rows) => rows.at(0) ?? null);

  return row ? toReportSnapshotDTO(row) : null;
}
