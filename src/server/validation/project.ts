import { z } from "zod";
import { projectTypeValues } from "@/server/domain/constants";

export const projectTypeSchema = z.enum(projectTypeValues);

const rawTagsSchema = z.preprocess((value) => {
  if (typeof value === "string") {
    return value.split(",");
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined) {
    return [];
  }

  return value;
}, z.array(z.string()).default([]));

export const projectTagsSchema = rawTagsSchema
  .transform((tags) => {
    const seen = new Set<string>();
    const normalizedTags: string[] = [];

    for (const tag of tags) {
      const trimmedTag = tag.trim();
      const dedupeKey = trimmedTag.toLocaleLowerCase();

      if (!trimmedTag || seen.has(dedupeKey)) {
        continue;
      }

      seen.add(dedupeKey);
      normalizedTags.push(trimmedTag);
    }

    return normalizedTags;
  })
  .pipe(z.array(z.string().min(1).max(40)).max(20));

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(""),
  client: z.string().trim().max(120).default(""),
  location: z.string().trim().max(200).default(""),
  projectType: projectTypeSchema,
  tags: projectTagsSchema.default([]),
});

export const projectUpdateSchema = projectCreateSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  "At least one project field must be provided for an update.",
);

export type ProjectTypeInput = z.infer<typeof projectTypeSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
