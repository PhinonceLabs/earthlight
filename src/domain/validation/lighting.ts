import { z } from "zod";
import { exposurePointSourceValues } from "@/domain/constants";

export const exposurePointSourceSchema = z.enum(exposurePointSourceValues);

const legacyIntensitySchema = z.number().finite().min(0).max(100);
const colorTemperatureSchema = z.number().finite().min(1000).max(10000);
const verticalLuxSchema = z.number().finite().min(0).max(100_000);
const auditIdSchema = z.string().trim().min(1).max(80);
const auditIdListSchema = z.array(auditIdSchema).max(20);

export const lightingExposurePointCalculationSchema = z
  .object({
    photopicMethod: z.string().trim().min(1).max(500),
    derMethod: z.string().trim().min(1).max(500),
    ediMethod: z.string().trim().min(1).max(500),
    unroundedMelanopicEDILux: verticalLuxSchema,
  })
  .strict();

const metricDefinitionSchema = z
  .object({
    unit: z.string().trim().min(1).max(20),
    definition: z.string().trim().min(1).max(2000),
    equation: z.string().trim().min(1).max(500).optional(),
    citationIds: auditIdListSchema,
  })
  .strict();

const metricDefinitionsSchema = z
  .object({
    photopicVerticalLux: metricDefinitionSchema,
    melanopicDER: metricDefinitionSchema,
    melanopicEDILux: metricDefinitionSchema,
  })
  .strict();

const assumptionValueSchema = z.union([
  z.string().max(2000),
  z.number().finite(),
  z.record(z.union([z.string().max(500), z.number().finite()])),
]);

const assumptionDefinitionSchema = z
  .object({
    label: z.string().trim().min(1).max(200),
    value: assumptionValueSchema,
    unit: z.string().trim().min(1).max(100),
    appliesTo: z.array(z.string().trim().min(1).max(200)).min(1).max(20),
    rationale: z.string().trim().min(1).max(2000),
    citationIds: auditIdListSchema,
  })
  .strict();

const citationDefinitionSchema = z
  .object({
    title: z.string().trim().min(1).max(500),
    publisherOrAuthors: z.string().trim().min(1).max(500),
    year: z.number().int().min(1900).max(2100),
    url: z.string().url().max(1000),
    accessed: z.string().date(),
    supports: z.array(z.string().trim().min(1).max(2000)).min(1).max(20),
  })
  .strict();

const workedExampleQualityChecksSchema = z
  .object({
    expectedTemplateCount: z.literal(4),
    expectedPointCount: z.literal(50),
    allRequestedFieldsPresent: z.literal(true),
    ediEquationToleranceLux: z.number().finite().min(0).max(10),
    warnings: z.array(z.string().trim().min(1).max(2000)).min(1).max(50),
  })
  .strict();

/**
 * Versioned audit evidence carried with copied worked-example schedules. This metadata
 * documents the model and spectral surrogate; it must not be interpreted as a site measurement.
 */
export const workedExampleLightingMetricsSchema = z
  .object({
    schemaVersion: z.literal("worked-example-lighting-metrics-v1"),
    templateVersion: z.string().trim().min(1).max(80),
    metricDefinitions: metricDefinitionsSchema,
    assumptions: z.record(auditIdSchema, assumptionDefinitionSchema),
    citations: z.record(auditIdSchema, citationDefinitionSchema),
    qualityChecks: workedExampleQualityChecksSchema,
  })
  .strict()
  .superRefine((metadata, ctx) => {
    const citationIds = new Set(Object.keys(metadata.citations));
    const validateCitationIds = (ids: string[], path: (string | number)[]) => {
      ids.forEach((id, index) => {
        if (!citationIds.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Unknown worked-example citation ID: ${id}.`,
            path: [...path, index],
          });
        }
      });
    };

    for (const [metricName, metric] of Object.entries(metadata.metricDefinitions)) {
      validateCitationIds(metric.citationIds, ["metricDefinitions", metricName, "citationIds"]);
    }
    for (const [assumptionId, assumption] of Object.entries(metadata.assumptions)) {
      validateCitationIds(assumption.citationIds, ["assumptions", assumptionId, "citationIds"]);
    }
  });

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
    assumptionIds: auditIdListSchema.optional(),
    citationIds: auditIdListSchema.optional(),
    calculation: lightingExposurePointCalculationSchema.optional(),
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

export const lightingScheduleSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).default(""),
    schedule: lightingSchedulePointsSchema,
    citations: z.array(z.string().trim().min(1).max(1000)).default([]),
    workedExampleLightingMetrics: workedExampleLightingMetricsSchema.optional(),
  })
  .superRefine((schedule, ctx) => {
    const metadata = schedule.workedExampleLightingMetrics;
    if (!metadata) {
      return;
    }

    const assumptionIds = new Set(Object.keys(metadata.assumptions));
    const citationIds = new Set(Object.keys(metadata.citations));
    schedule.schedule.forEach((point, index) => {
      const requiredFields = [
        ["photopicVerticalLux", point.photopicVerticalLux],
        ["melanopicDER", point.melanopicDER],
        ["melanopicEDILux", point.melanopicEDILux],
        ["assumptionIds", point.assumptionIds],
        ["citationIds", point.citationIds],
        ["calculation", point.calculation],
        ["notes", point.notes],
      ] as const;

      requiredFields.forEach(([field, value]) => {
        if (value === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Audited worked-example points must include every requested metric and provenance field.",
            path: ["schedule", index, field],
          });
        }
      });

      if (point.source !== "estimated") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Audited worked-example points must be identified as modeled estimates.",
          path: ["schedule", index, "source"],
        });
      }
      if (point.assumptionIds?.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Audited worked-example points require at least one assumption reference.",
          path: ["schedule", index, "assumptionIds"],
        });
      }
      if (point.citationIds?.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Audited worked-example points require at least one citation reference.",
          path: ["schedule", index, "citationIds"],
        });
      }

      point.assumptionIds?.forEach((id, idIndex) => {
        if (!assumptionIds.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Unknown worked-example assumption ID: ${id}.`,
            path: ["schedule", index, "assumptionIds", idIndex],
          });
        }
      });
      point.citationIds?.forEach((id, idIndex) => {
        if (!citationIds.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Unknown worked-example citation ID: ${id}.`,
            path: ["schedule", index, "citationIds", idIndex],
          });
        }
      });

      if (
        point.photopicVerticalLux !== undefined &&
        point.melanopicDER !== undefined &&
        point.melanopicEDILux !== undefined
      ) {
        const calculatedEdi = point.photopicVerticalLux * point.melanopicDER;
        if (Math.abs(calculatedEdi - point.melanopicEDILux) > metadata.qualityChecks.ediEquationToleranceLux) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Melanopic EDI must agree with photopic vertical lux multiplied by melanopic DER.",
            path: ["schedule", index, "melanopicEDILux"],
          });
        }
        if (
          point.calculation &&
          Math.abs(point.calculation.unroundedMelanopicEDILux - calculatedEdi) > 1e-9
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "The audited unrounded melanopic EDI must preserve the stated equation result.",
            path: ["schedule", index, "calculation", "unroundedMelanopicEDILux"],
          });
        }
        if (
          point.calculation &&
          point.melanopicEDILux !== Math.floor(point.calculation.unroundedMelanopicEDILux + 0.5)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Audited melanopic EDI must use the declared positive half-up integer rounding.",
            path: ["schedule", index, "melanopicEDILux"],
          });
        }
      }
    });
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
export type LightingExposurePointCalculation = z.infer<typeof lightingExposurePointCalculationSchema>;
export type WorkedExampleLightingMetrics = z.infer<typeof workedExampleLightingMetricsSchema>;
