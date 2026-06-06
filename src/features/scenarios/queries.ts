import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { projectIdAccessWhere } from "@/server/auth/authorization";
import { requireAppIdentity } from "@/server/auth/identity";
import { db } from "@/server/db";
import { projects, scenarios, type ScenarioSource } from "@/server/db/schema";
import { lightingScheduleSchema, type LightingScheduleInput } from "@/server/validation/lighting";
import { scenarioScheduleInputsSchema, type ScenarioScheduleInputs } from "@/server/validation/scenario";

export type ScenarioSummaryDTO = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  source: ScenarioSource;
  presetName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ScenarioDetailDTO = ScenarioSummaryDTO & {
  schedule: LightingScheduleInput;
  scheduleInputs: ScenarioScheduleInputs | null;
};

type ScenarioSummaryRow = Pick<
  typeof scenarios.$inferSelect,
  "id" | "projectId" | "name" | "description" | "source" | "presetName" | "createdAt" | "updatedAt"
>;

type ScenarioDetailRow = ScenarioSummaryRow &
  Pick<typeof scenarios.$inferSelect, "schedule" | "scheduleInputs">;

function toScenarioSummaryDTO(row: ScenarioSummaryRow): ScenarioSummaryDTO {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    description: row.description,
    source: row.source,
    presetName: row.presetName,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toScenarioDetailDTO(row: ScenarioDetailRow): ScenarioDetailDTO | null {
  const schedule = lightingScheduleSchema.safeParse(row.schedule);
  if (!schedule.success) {
    return null;
  }

  const scheduleInputs = row.scheduleInputs
    ? scenarioScheduleInputsSchema.safeParse(row.scheduleInputs)
    : null;

  if (scheduleInputs && !scheduleInputs.success) {
    return null;
  }

  return {
    ...toScenarioSummaryDTO(row),
    schedule: schedule.data,
    scheduleInputs: scheduleInputs?.data ?? null,
  };
}

export async function listScenariosForProject(projectId: string): Promise<ScenarioSummaryDTO[]> {
  const identity = await requireAppIdentity();

  const rows = await db
    .select({
      id: scenarios.id,
      projectId: scenarios.projectId,
      name: scenarios.name,
      description: scenarios.description,
      source: scenarios.source,
      presetName: scenarios.presetName,
      createdAt: scenarios.createdAt,
      updatedAt: scenarios.updatedAt,
    })
    .from(scenarios)
    .innerJoin(projects, eq(projects.id, scenarios.projectId))
    .where(projectIdAccessWhere(projectId, identity))
    .orderBy(desc(scenarios.updatedAt));

  return rows.map((row) => toScenarioSummaryDTO(row));
}

export async function getScenarioForProject(
  projectId: string,
  scenarioId: string,
): Promise<ScenarioDetailDTO | null> {
  const identity = await requireAppIdentity();

  const rows = await db
    .select({
      id: scenarios.id,
      projectId: scenarios.projectId,
      name: scenarios.name,
      description: scenarios.description,
      source: scenarios.source,
      presetName: scenarios.presetName,
      schedule: scenarios.schedule,
      scheduleInputs: scenarios.scheduleInputs,
      createdAt: scenarios.createdAt,
      updatedAt: scenarios.updatedAt,
    })
    .from(scenarios)
    .innerJoin(projects, eq(projects.id, scenarios.projectId))
    .where(and(eq(scenarios.id, scenarioId), projectIdAccessWhere(projectId, identity)))
    .limit(1);

  const scenario = rows.at(0);
  return scenario ? toScenarioDetailDTO(scenario) : null;
}

export async function getLatestScenarioForProject(
  projectId: string,
): Promise<ScenarioDetailDTO | null> {
  const identity = await requireAppIdentity();

  const rows = await db
    .select({
      id: scenarios.id,
      projectId: scenarios.projectId,
      name: scenarios.name,
      description: scenarios.description,
      source: scenarios.source,
      presetName: scenarios.presetName,
      schedule: scenarios.schedule,
      scheduleInputs: scenarios.scheduleInputs,
      createdAt: scenarios.createdAt,
      updatedAt: scenarios.updatedAt,
    })
    .from(scenarios)
    .innerJoin(projects, eq(projects.id, scenarios.projectId))
    .where(projectIdAccessWhere(projectId, identity))
    .orderBy(desc(scenarios.updatedAt))
    .limit(1);

  const scenario = rows.at(0);
  return scenario ? toScenarioDetailDTO(scenario) : null;
}
