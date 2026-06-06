import { z } from "zod";
import { scenarioSourceValues } from "@/server/domain/constants";
import { customScheduleInputSchema, lightingScheduleSchema } from "./lighting";

export const scenarioSourceSchema = z.enum(scenarioSourceValues);

export const presetScheduleInputSchema = z
  .object({
    presetName: z.string().trim().min(1).max(120),
  })
  .strict();

export const importedScheduleInputSchema = z
  .object({
    importFormat: z.enum(["json", "legacy_project_json"]).default("json"),
    importVersion: z.string().trim().max(40).optional(),
    importedAt: z.string().datetime({ offset: true }).optional(),
    sourceName: z.string().trim().max(200).optional(),
  })
  .strict();

export const quickSaveScheduleInputSchema = z
  .object({
    note: z.string().trim().max(500).optional(),
    savedFrom: z.enum(["workspace", "preset", "custom_preview"]).default("workspace"),
  })
  .strict();

export const scenarioScheduleInputsSchema = z.union([
  presetScheduleInputSchema,
  customScheduleInputSchema,
  importedScheduleInputSchema,
  quickSaveScheduleInputSchema,
]);

const scenarioCreateBaseSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(""),
  source: scenarioSourceSchema,
  presetName: z.string().trim().min(1).max(120).optional(),
  schedule: lightingScheduleSchema,
  scheduleInputs: scenarioScheduleInputsSchema.optional(),
});

export const scenarioCreateSchema = scenarioCreateBaseSchema.superRefine((input, ctx) => {
  const addScheduleInputsIssue = (message: string) => {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message,
      path: ["scheduleInputs"],
    });
  };

  if (input.source === "standard_preset") {
    if (!input.presetName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A preset scenario must include the preset name.",
        path: ["presetName"],
      });
    }

    if (input.scheduleInputs && !presetScheduleInputSchema.safeParse(input.scheduleInputs).success) {
      addScheduleInputsIssue("Preset scenarios can only include preset schedule inputs.");
    }
  }

  if (input.source === "custom") {
    if (!input.scheduleInputs || !customScheduleInputSchema.safeParse(input.scheduleInputs).success) {
      addScheduleInputsIssue("Custom scenarios must include custom schedule inputs.");
    }
  }

  if (input.source === "imported") {
    if (!input.scheduleInputs || !importedScheduleInputSchema.safeParse(input.scheduleInputs).success) {
      addScheduleInputsIssue("Imported scenarios must include import metadata inputs.");
    }
  }

  if (input.source === "quick_save") {
    if (input.scheduleInputs && !quickSaveScheduleInputSchema.safeParse(input.scheduleInputs).success) {
      addScheduleInputsIssue("Quick-save scenarios can only include quick-save inputs.");
    }
  }
});

export const scenarioUpdateSchema = scenarioCreateBaseSchema
  .omit({ projectId: true })
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one scenario field must be provided for an update.",
  });

export type ScenarioSourceInput = z.infer<typeof scenarioSourceSchema>;
export type ScenarioCreateInput = z.infer<typeof scenarioCreateSchema>;
export type ScenarioUpdateInput = z.infer<typeof scenarioUpdateSchema>;
export type ScenarioScheduleInputs = z.infer<typeof scenarioScheduleInputsSchema>;
