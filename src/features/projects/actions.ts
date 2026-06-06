"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { projectAccessWhere } from "@/server/auth/authorization";
import { requireAppIdentity } from "@/server/auth/identity";
import { db } from "@/server/db";
import { projects } from "@/server/db/schema";
import { projectCreateSchema, projectUpdateSchema } from "@/server/validation/project";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

function validationError(message: string, error: { flatten: () => { fieldErrors: Record<string, string[]> } }): ActionResult<never> {
  return {
    ok: false,
    message,
    fieldErrors: error.flatten().fieldErrors,
  };
}

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
