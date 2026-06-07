import { z } from "zod";
import { exposurePointSourceValues } from "@/domain/constants";

export const exposurePointSourceSchema = z.enum(exposurePointSourceValues);

const legacyIntensitySchema = z.number().finite().min(0).max(100);
const colorTemperatureSchema = z.number().finite().min(1000).max(10000);
const verticalLuxSchema = z.number().finite().min(0).max(100_000);

export const lightingExposurePointSchema = z
  .object({
    time: z.number().finite().min(0).max(24),
    intensity: legacyIntensitySchema.optional(),
    temperature: colorTemperatureSchema.optional(),
    photopicVerticalLux: verticalLuxSchema.optional(),
    melanopicDER: z.number().finite().min(0).max(5).optional(),
    melanopicEDILux: verticalLuxSchema.optional(),
    cctK: colorTemperatureSchema.optional(),
    source: exposurePointSourceSchema.default("estimated"),
    notes: z.string().trim().max(1000).optional(),
  })
  .superRefine((point, ctx) => {
    const hasLegacyDisplayFields = point.intensity !== undefined || point.temperature !== undefined;
    const hasPrdExposureFields =
      point.photopicVerticalLux !== undefined ||
      point.melanopicDER !== undefined ||
      point.melanopicEDILux !== undefined ||
      point.cctK !== undefined;

    if (!hasLegacyDisplayFields && !hasPrdExposureFields) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Exposure points must include at least one legacy display field or PRD exposure metric.",
      });
    }
  });

export const lightingSchedulePointsSchema = z
  .array(lightingExposurePointSchema)
  .min(2)
  .superRefine((points, ctx) => {
    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const current = points[index];

      if (current.time < previous.time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lighting exposure points must be sorted by increasing time.",
          path: [index, "time"],
        });
      }

      if (current.time === previous.time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lighting exposure points cannot contain duplicate times.",
          path: [index, "time"],
        });
      }
    }

    if (!points.some((point) => point.time === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Persisted lighting schedules must include a midnight start point at time 0.",
      });
    }

    if (!points.some((point) => point.time === 24)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Persisted lighting schedules must include a day-end point at time 24.",
      });
    }
  });

export const lightingScheduleSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(""),
  schedule: lightingSchedulePointsSchema,
  citations: z.array(z.string().trim().min(1).max(1000)).default([]),
});

export const latitudeSchema = z.number().finite().min(-90).max(90);
export const longitudeSchema = z.number().finite().min(-180).max(180);

export const lightingLocationSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  timezone: z.string().trim().min(1).max(100),
});

export const customScheduleInputSchema = z
  .object({
    wakeTime: z.number().finite().min(0).max(24),
    sleepTime: z.number().finite().min(0).max(24),
    maxIntensity: z.number().finite().min(0).max(100),
    basePresetName: z.string().trim().min(1).max(120),
    useSunTimes: z.boolean().default(false),
    location: lightingLocationSchema.optional(),
  })
  .strict()
  .superRefine((input, ctx) => {
    if (input.sleepTime <= input.wakeTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sleep time must be later than wake time for same-day schedules.",
        path: ["sleepTime"],
      });
    }

    if (input.useSunTimes && !input.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Location is required when sunrise/sunset adjustment is enabled.",
        path: ["location"],
      });
    }
  });

export type LightingExposurePointInput = z.infer<typeof lightingExposurePointSchema>;
export type LightingScheduleInput = z.infer<typeof lightingScheduleSchema>;
export type CustomScheduleInput = z.infer<typeof customScheduleInputSchema>;
