import "server-only";

import { count, desc, eq } from "drizzle-orm";
import { projectAccessWhere, projectIdAccessWhere } from "@/server/auth/authorization";
import { requireAppIdentity } from "@/server/auth/identity";
import { db } from "@/server/db";
import { projects, scenarios, type ProjectType } from "@/server/db/schema";

export type ProjectSummaryDTO = {
  id: string;
  name: string;
  description: string;
  client: string;
  location: string;
  projectType: ProjectType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  scenarioCount: number;
};

export type ProjectDetailDTO = ProjectSummaryDTO;

function toProjectDTO(
  row: typeof projects.$inferSelect & { scenarioCount?: number },
): ProjectSummaryDTO {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    client: row.client,
    location: row.location,
    projectType: row.projectType,
    tags: row.tags,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    scenarioCount: Number(row.scenarioCount ?? 0),
  };
}

export async function listProjectsForCurrentIdentity(): Promise<ProjectSummaryDTO[]> {
  const identity = await requireAppIdentity();

  const rows = await db
    .select({
      id: projects.id,
      ownerId: projects.ownerId,
      organizationId: projects.organizationId,
      name: projects.name,
      description: projects.description,
      client: projects.client,
      location: projects.location,
      projectType: projects.projectType,
      tags: projects.tags,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      scenarioCount: count(scenarios.id),
    })
    .from(projects)
    .leftJoin(scenarios, eq(scenarios.projectId, projects.id))
    .where(projectAccessWhere(identity))
    .groupBy(projects.id)
    .orderBy(desc(projects.updatedAt));

  return rows.map(toProjectDTO);
}

export async function getProjectForCurrentIdentity(
  projectId: string,
): Promise<ProjectDetailDTO | null> {
  const identity = await requireAppIdentity();

  const rows = await db
    .select({
      id: projects.id,
      ownerId: projects.ownerId,
      organizationId: projects.organizationId,
      name: projects.name,
      description: projects.description,
      client: projects.client,
      location: projects.location,
      projectType: projects.projectType,
      tags: projects.tags,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      scenarioCount: count(scenarios.id),
    })
    .from(projects)
    .leftJoin(scenarios, eq(scenarios.projectId, projects.id))
    .where(projectIdAccessWhere(projectId, identity))
    .groupBy(projects.id)
    .limit(1);

  const project = rows.at(0);
  return project ? toProjectDTO(project) : null;
}
