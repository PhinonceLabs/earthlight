import { z } from "zod";
import { projectTypeValues, scenarioSourceValues } from "@/domain/constants";
import { lightingScheduleSchema } from "./lighting";
import { roiSnapshotDataSchema } from "./roi";

export const reportVersionSchema = z.string().trim().min(1).max(80);
export const reportProjectTypeSchema = z.enum(projectTypeValues);
export const reportScenarioSourceSchema = z.enum(scenarioSourceValues);

export const reportProjectSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(""),
  client: z.string().trim().max(120).default(""),
  location: z.string().trim().max(200).default(""),
  projectType: reportProjectTypeSchema,
  projectTypeLabel: z.string().trim().min(1).max(80),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
});

export const reportScenarioSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(""),
  source: reportScenarioSourceSchema,
  presetName: z.string().trim().min(1).max(120).optional(),
});

export const normalizedSchedulePointSchema = z.object({
  timeDecimal: z.number().finite().min(0).max(24),
  timeLabel: z.string().trim().min(1).max(20),
  intensity: z.number().finite().min(0).max(100),
  temperature: z.number().finite().min(1000).max(10000),
  colorName: z.string().trim().min(1).max(80),
});

export const reportRoiSnapshotSchema = roiSnapshotDataSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime({ offset: true }),
});

export const reportSnapshotDataSchema = z.object({
  reportVersion: reportVersionSchema,
  generatedAt: z.string().datetime({ offset: true }),
  project: reportProjectSummarySchema,
  scenario: reportScenarioSummarySchema,
  schedule: lightingScheduleSchema,
  scheduleRows: z.array(normalizedSchedulePointSchema).min(2),
  roi: reportRoiSnapshotSchema.optional(),
  citations: z.array(z.string().trim().min(1).max(1000)).default([]),
  implementationRecommendations: z.array(z.string().trim().min(1).max(1000)).default([]),
});

export const reportSnapshotCreateSchema = z.object({
  projectId: z.string().uuid(),
  scenarioId: z.string().uuid(),
  roiSnapshotId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
});

export type ReportSnapshotData = z.infer<typeof reportSnapshotDataSchema>;
export type ReportSnapshotCreateInput = z.infer<typeof reportSnapshotCreateSchema>;
