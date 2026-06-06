import "server-only";

import { and, eq, isNull, or, sql } from "drizzle-orm";
import { projects, type Project } from "@/server/db/schema";
import type { AuthIdentity } from "./identity";

export class AuthorizationError extends Error {
  constructor(message = "You are not authorized to access this resource.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export type ProjectAccessScope = Pick<Project, "ownerId" | "organizationId">;

export function canAccessProject(identity: AuthIdentity, project: ProjectAccessScope): boolean {
  if (project.organizationId) {
    // Phase 2 org support is intentionally coarse: any member currently scoped to the
    // Clerk org can access org-owned projects. Add role/project-membership checks before
    // exposing differentiated organization permissions in CRUD workflows.
    return identity.organizationId === project.organizationId;
  }

  return project.ownerId === identity.appUserId;
}

export function assertCanAccessProject(
  identity: AuthIdentity,
  project: ProjectAccessScope,
): asserts project is ProjectAccessScope {
  if (!canAccessProject(identity, project)) {
    throw new AuthorizationError();
  }
}

export function projectAccessWhere(identity: AuthIdentity) {
  return or(
    and(isNull(projects.organizationId), eq(projects.ownerId, identity.appUserId)),
    identity.organizationId
      ? eq(projects.organizationId, identity.organizationId)
      : sql`false`,
  );
}

export function projectIdAccessWhere(projectId: string, identity: AuthIdentity) {
  return and(eq(projects.id, projectId), projectAccessWhere(identity));
}

export function assertScenarioBelongsToProject(
  scenarioProjectId: string,
  projectId: string,
): void {
  if (scenarioProjectId !== projectId) {
    throw new AuthorizationError("Scenario does not belong to the requested project.");
  }
}

export function assertSnapshotBelongsToProject(
  snapshotProjectId: string,
  projectId: string,
): void {
  if (snapshotProjectId !== projectId) {
    throw new AuthorizationError("Snapshot does not belong to the requested project.");
  }
}
