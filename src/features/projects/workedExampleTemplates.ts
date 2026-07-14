import { z } from "zod";
import { customScheduleInputSchema, lightingScheduleSchema } from "@/domain/validation/lighting";
import { roiInputsSchema } from "@/domain/validation/roi";
import { projectCreateSchema } from "@/server/validation/project";
import { presetScheduleInputSchema, scenarioScheduleInputsSchema } from "@/server/validation/scenario";

export const WORKED_EXAMPLE_TEMPLATE_VERSION = "2026-07-10-v1";

export const workedExampleTemplateKeys = [
  "northbridge-academy",
  "meridian-tower",
  "st-anselm-outpatient",
  "harbor-heights",
] as const;

const scenarioTemplateSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).default(""),
    source: z.enum(["standard_preset", "custom"]),
    presetName: z.string().trim().min(1).max(120).optional(),
    schedule: lightingScheduleSchema,
    scheduleInputs: scenarioScheduleInputsSchema,
  })
  .strict()
  .superRefine((scenario, ctx) => {
    if (scenario.source === "standard_preset") {
      const inputs = presetScheduleInputSchema.safeParse(scenario.scheduleInputs);
      if (!scenario.presetName || !inputs.success || inputs.data.presetName !== scenario.presetName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduleInputs"],
          message: "Preset scenarios require matching preset metadata.",
        });
      }
    }
    if (scenario.source === "custom") {
      if (scenario.presetName || !customScheduleInputSchema.safeParse(scenario.scheduleInputs).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduleInputs"],
          message: "Custom scenarios require custom schedule inputs and cannot name a preset.",
        });
      }
    }
  });

const workedExampleDefinitionSchema = z
  .object({
    project: projectCreateSchema,
    scenario: scenarioTemplateSchema,
    roiInputs: roiInputsSchema.optional(),
    reportName: z.string().trim().min(1).max(120),
  })
  .strict();

export const workedExampleTemplateSchema = z
  .object({
    key: z.enum(workedExampleTemplateKeys),
    version: z.literal(WORKED_EXAMPLE_TEMPLATE_VERSION),
    sortOrder: z.number().int().min(1).max(workedExampleTemplateKeys.length),
    definition: workedExampleDefinitionSchema,
  })
  .strict()
  .superRefine((template, ctx) => {
    const isHarborHeights = template.key === "harbor-heights";
    const metrics = template.definition.scenario.schedule.workedExampleLightingMetrics;
    if (!metrics) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["definition", "scenario", "schedule", "workedExampleLightingMetrics"],
        message: "Canonical worked examples require audited lighting metric metadata.",
      });
    } else if (metrics.templateVersion !== template.version) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["definition", "scenario", "schedule", "workedExampleLightingMetrics", "templateVersion"],
        message: "Worked-example lighting metric metadata must match its template version.",
      });
    }
    if (isHarborHeights && template.definition.roiInputs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["definition", "roiInputs"],
        message: "Harbor Heights must not include employee-based ROI inputs.",
      });
    }
    if (!isHarborHeights && !template.definition.roiInputs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["definition", "roiInputs"],
        message: "Employee-based worked examples require ROI inputs.",
      });
    }
  });

export const workedExampleTemplatesSchema = z
  .array(workedExampleTemplateSchema)
  .length(workedExampleTemplateKeys.length)
  .superRefine((templates, ctx) => {
    const keys = new Set(templates.map((template) => template.key));
    for (const key of workedExampleTemplateKeys) {
      if (!keys.has(key)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Missing worked-example template: ${key}.` });
      }
    }
  });

export type WorkedExampleTemplate = z.infer<typeof workedExampleTemplateSchema>;
