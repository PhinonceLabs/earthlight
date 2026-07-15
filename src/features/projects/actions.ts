"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";
import { ROI_ASSUMPTIONS, ROI_ASSUMPTIONS_VERSION } from "@/domain/roi/assumptions";
import { calculateRoiRange } from "@/domain/roi/calculator";
import { roiSnapshotDataSchema } from "@/domain/validation/roi";
import { createReportSnapshotData, REPORT_VERSION } from "@/features/reports/normalizers";
import { projectAccessWhere } from "@/server/auth/authorization";
import { requireAppIdentity } from "@/server/auth/identity";
import { db } from "@/server/db";
import { projects, reportSnapshots, roiSnapshots, scenarios, workedExampleTemplates } from "@/server/db/schema";
import { projectCreateSchema, projectUpdateSchema } from "@/server/validation/project";
import { validationError, type ActionResult } from "@/features/shared/actions";
import { workedExampleTemplatesSchema } from "./workedExampleTemplates";

function revalidateProjectPaths(projectId?: string) {
  revalidatePath("/projects");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
}

export async function createProject(input: unknown): Promise<ActionResult<{ projectId: string }>> {
  const parsed = projectCreateSchema.safeParse(input);
  if (!parsed.success) {
    return validationError("Please fix the highlighted project fields.", parsed.error);
  }

  const identity = await requireAppIdentity();
  const [project] = await db
    .insert(projects)
    .values({
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      client: parsed.data.client ?? "",
      location: parsed.data.location ?? "",
      projectType: parsed.data.projectType,
      tags: parsed.data.tags ?? [],
      // Ownership is always server-derived from Clerk/AppUser identity. Never trust client IDs.
      ownerId: identity.appUserId,
      organizationId: identity.organizationId,
    })
    .returning({ id: projects.id });

  if (!project) {
    return { ok: false, message: "Unable to create project." };
  }

  revalidateProjectPaths(project.id);
  return { ok: true, data: { projectId: project.id } };
}

type WorkedExampleCopyCounts = {
  projectCount: number;
  scenarioCount: number;
  roiSnapshotCount: number;
  reportCount: number;
};

type PreparedWorkedExampleRows = {
  projectRows: Array<typeof projects.$inferInsert>;
  scenarioRows: Array<typeof scenarios.$inferInsert>;
  roiRows: Array<typeof roiSnapshots.$inferInsert>;
  reportRows: Array<typeof reportSnapshots.$inferInsert>;
};

async function prepareWorkedExampleRows(ownerId: string): Promise<PreparedWorkedExampleRows | null> {
  const templateRows = await db
    .select({
      key: workedExampleTemplates.key,
      version: workedExampleTemplates.version,
      sortOrder: workedExampleTemplates.sortOrder,
      definition: workedExampleTemplates.definition,
    })
    .from(workedExampleTemplates)
    .orderBy(asc(workedExampleTemplates.sortOrder));
  const parsedTemplates = workedExampleTemplatesSchema.safeParse(templateRows);

  if (!parsedTemplates.success) {
    console.error("Worked-example templates failed validation.", parsedTemplates.error.flatten());
    return null;
  }

  const now = new Date();
  const createdAt = now.toISOString();
  const projectRows: Array<typeof projects.$inferInsert> = [];
  const scenarioRows: Array<typeof scenarios.$inferInsert> = [];
  const roiRows: Array<typeof roiSnapshots.$inferInsert> = [];
  const reportRows: Array<typeof reportSnapshots.$inferInsert> = [];

  for (const template of parsedTemplates.data) {
    const { project, scenario, roiInputs, reportName } = template.definition;
    const projectId = randomUUID();
    const scenarioId = randomUUID();
    const roiSnapshotId = roiInputs ? randomUUID() : null;

    projectRows.push({
      id: projectId,
      ownerId,
      // Worked examples are personal copies even when the user has an active organization.
      organizationId: null,
      workedExampleTemplateKey: template.key,
      workedExampleTemplateVersion: template.version,
      name: project.name!,
      description: project.description ?? "",
      client: project.client ?? "",
      location: project.location ?? "",
      projectType: project.projectType!,
      tags: project.tags ?? [],
      createdAt: now,
      updatedAt: now,
    });
    scenarioRows.push({
      id: scenarioId,
      projectId,
      name: scenario.name!,
      description: scenario.description ?? "",
      source: scenario.source!,
      presetName: scenario.presetName ?? null,
      schedule: scenario.schedule! as typeof scenarios.$inferInsert["schedule"],
      scheduleInputs: scenario.scheduleInputs as typeof scenarios.$inferInsert["scheduleInputs"],
      createdAt: now,
      updatedAt: now,
    });

    const computedRoi = roiInputs
      ? roiSnapshotDataSchema.parse({
          inputs: roiInputs,
          assumptionsVersion: ROI_ASSUMPTIONS_VERSION,
          assumptions: ROI_ASSUMPTIONS,
          results: calculateRoiRange(roiInputs),
        })
      : null;

    if (computedRoi && roiSnapshotId) {
      roiRows.push({
        id: roiSnapshotId,
        projectId,
        scenarioId,
        inputs: computedRoi.inputs! as typeof roiSnapshots.$inferInsert["inputs"],
        assumptionsVersion: computedRoi.assumptionsVersion!,
        assumptions: computedRoi.assumptions! as typeof roiSnapshots.$inferInsert["assumptions"],
        results: computedRoi.results! as typeof roiSnapshots.$inferInsert["results"],
        createdAt: now,
      });
    }

    const reportData = createReportSnapshotData({
      project: {
        id: projectId,
        name: project.name!,
        description: project.description ?? "",
        client: project.client ?? "",
        location: project.location ?? "",
        projectType: project.projectType!,
        tags: project.tags ?? [],
        workedExampleTemplateKey: template.key,
        workedExampleTemplateVersion: template.version,
        workedExampleStatus: "current",
        createdAt,
        updatedAt: createdAt,
        scenarioCount: 1,
      },
      scenario: {
        id: scenarioId,
        projectId,
        name: scenario.name!,
        description: scenario.description ?? "",
        source: scenario.source!,
        presetName: scenario.presetName ?? null,
        schedule: scenario.schedule!,
        scheduleInputs: scenario.scheduleInputs!,
        createdAt,
        updatedAt: createdAt,
      },
      roiSnapshot:
        computedRoi && roiSnapshotId
          ? { id: roiSnapshotId, projectId, scenarioId, createdAt, ...computedRoi }
          : null,
      generatedAt: now,
    });

    reportRows.push({
      id: randomUUID(),
      projectId,
      scenarioId,
      roiSnapshotId,
      name: reportName,
      reportVersion: REPORT_VERSION,
      reportData: reportData as typeof reportSnapshots.$inferInsert["reportData"],
      generatedAt: now,
      createdAt: now,
    });
  }

  return { projectRows, scenarioRows, roiRows, reportRows };
}

function workedExampleCopyCounts(rows: PreparedWorkedExampleRows): WorkedExampleCopyCounts {
  return {
    projectCount: rows.projectRows.length,
    scenarioCount: rows.scenarioRows.length,
    roiSnapshotCount: rows.roiRows.length,
    reportCount: rows.reportRows.length,
  };
}

export async function addWorkedExamples(): Promise<ActionResult<WorkedExampleCopyCounts>> {
  try {
    const identity = await requireAppIdentity();
    const rows = await prepareWorkedExampleRows(identity.appUserId);
    if (!rows) {
      return { ok: false, message: "Worked examples are temporarily unavailable." };
    }

    // neon-http does not support interactive transactions. Drizzle batch submits these
    // four statements as one Neon transaction, preventing partially copied example sets.
    await db.batch([
      db.insert(projects).values(rows.projectRows),
      db.insert(scenarios).values(rows.scenarioRows),
      db.insert(roiSnapshots).values(rows.roiRows),
      db.insert(reportSnapshots).values(rows.reportRows),
    ]);

    revalidateProjectPaths();
    return { ok: true, data: workedExampleCopyCounts(rows) };
  } catch (error) {
    console.error("Failed to add worked examples.", error);
    return {
      ok: false,
      message: "Worked examples could not be added. Refresh the page and try again.",
    };
  }
}

export async function resetWorkedExamples(): Promise<ActionResult<WorkedExampleCopyCounts>> {
  try {
    const identity = await requireAppIdentity();
    const rows = await prepareWorkedExampleRows(identity.appUserId);
    if (!rows) {
      return { ok: false, message: "Worked examples are temporarily unavailable." };
    }

    // Project is the aggregate root: deleting a managed project cascades through its
    // scenario, ROI, and report rows. Untagged legacy copies and organization projects
    // deliberately fall outside this predicate and must never be inferred from names.
    await db.batch([
      db
        .delete(projects)
        .where(
          and(
            eq(projects.ownerId, identity.appUserId),
            isNull(projects.organizationId),
            isNotNull(projects.workedExampleTemplateKey),
          ),
        ),
      db.insert(projects).values(rows.projectRows),
      db.insert(scenarios).values(rows.scenarioRows),
      db.insert(roiSnapshots).values(rows.roiRows),
      db.insert(reportSnapshots).values(rows.reportRows),
    ]);

    revalidateProjectPaths();
    return { ok: true, data: workedExampleCopyCounts(rows) };
  } catch (error) {
    console.error("Failed to reset worked examples.", error);
    return {
      ok: false,
      message: "Worked examples could not be reset. Refresh the page and try again.",
    };
  }
}

export async function updateProject(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ projectId: string }>> {
  const parsed = projectUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return validationError("Please fix the highlighted project fields.", parsed.error);
  }

  const identity = await requireAppIdentity();
  const [updatedProject] = await db
    .update(projects)
    .set(parsed.data)
    .where(and(eq(projects.id, projectId), projectAccessWhere(identity)))
    .returning({ id: projects.id });

  if (!updatedProject) {
    // A generic not-found response prevents leaking whether the ID exists for another user.
    return { ok: false, message: "Project not found." };
  }

  revalidateProjectPaths(updatedProject.id);
  return { ok: true, data: { projectId: updatedProject.id } };
}

export async function deleteProject(projectId: string): Promise<ActionResult<{ projectId: string }>> {
  const identity = await requireAppIdentity();
  const [deletedProject] = await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), projectAccessWhere(identity)))
    .returning({ id: projects.id });

  if (!deletedProject) {
    return { ok: false, message: "Project not found." };
  }

  revalidateProjectPaths(deletedProject.id);
  return { ok: true, data: { projectId: deletedProject.id } };
}
