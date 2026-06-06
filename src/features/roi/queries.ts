import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { projectIdAccessWhere } from "@/server/auth/authorization";
import { requireAppIdentity } from "@/server/auth/identity";
import { db } from "@/server/db";
import { projects, roiSnapshots } from "@/server/db/schema";
import { roiSnapshotDataSchema, type RoiSnapshotData } from "@/server/validation/roi";

export type RoiSnapshotDTO = RoiSnapshotData & {
  id: string;
  projectId: string;
  scenarioId: string | null;
  createdAt: string;
};

type RoiSnapshotRow = typeof roiSnapshots.$inferSelect;

function toRoiSnapshotDTO(row: RoiSnapshotRow): RoiSnapshotDTO | null {
  const snapshotData = roiSnapshotDataSchema.safeParse({
    inputs: row.inputs,
    assumptionsVersion: row.assumptionsVersion,
    assumptions: row.assumptions,
    results: row.results,
  });

  if (!snapshotData.success) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.projectId,
    scenarioId: row.scenarioId,
    createdAt: row.createdAt.toISOString(),
    ...snapshotData.data,
  };
}

export async function listRoiSnapshotsForScenario(
  projectId: string,
  scenarioId: string,
  limit = 5,
): Promise<RoiSnapshotDTO[]> {
  const identity = await requireAppIdentity();
  const rows = await db
    .select({
      id: roiSnapshots.id,
      projectId: roiSnapshots.projectId,
      scenarioId: roiSnapshots.scenarioId,
      inputs: roiSnapshots.inputs,
      assumptionsVersion: roiSnapshots.assumptionsVersion,
      assumptions: roiSnapshots.assumptions,
      results: roiSnapshots.results,
      createdAt: roiSnapshots.createdAt,
    })
    .from(roiSnapshots)
    .innerJoin(projects, eq(projects.id, roiSnapshots.projectId))
    .where(
      and(
        eq(roiSnapshots.scenarioId, scenarioId),
        projectIdAccessWhere(projectId, identity),
      ),
    )
    .orderBy(desc(roiSnapshots.createdAt))
    .limit(limit);

  return rows.flatMap((row) => {
    const dto = toRoiSnapshotDTO(row);
    return dto ? [dto] : [];
  });
}

export async function getRoiSnapshotForProject(
  projectId: string,
  roiSnapshotId: string,
): Promise<RoiSnapshotDTO | null> {
  const identity = await requireAppIdentity();
  const row = await db
    .select({
      id: roiSnapshots.id,
      projectId: roiSnapshots.projectId,
      scenarioId: roiSnapshots.scenarioId,
      inputs: roiSnapshots.inputs,
      assumptionsVersion: roiSnapshots.assumptionsVersion,
      assumptions: roiSnapshots.assumptions,
      results: roiSnapshots.results,
      createdAt: roiSnapshots.createdAt,
    })
    .from(roiSnapshots)
    .innerJoin(projects, eq(projects.id, roiSnapshots.projectId))
    .where(
      and(
        eq(roiSnapshots.id, roiSnapshotId),
        projectIdAccessWhere(projectId, identity),
      ),
    )
    .limit(1)
    .then((rows) => rows.at(0) ?? null);

  return row ? toRoiSnapshotDTO(row) : null;
}
