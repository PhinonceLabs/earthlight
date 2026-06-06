import { z } from "zod";

export const roiInputsSchema = z.object({
  employees: z.number().int().min(0).max(100_000),
  averageSalary: z.number().finite().min(0).max(10_000_000),
  implementationCost: z.number().finite().min(0).max(100_000_000),
  annualLightingEnergyCost: z.number().finite().min(0).max(100_000_000),
  currentAbsenteeism: z.number().finite().min(0).max(365),
  currentTurnover: z.number().finite().min(0).max(100),
});

export const roiAssumptionCaseSchema = z.enum(["low", "base", "high"]);

export const roiAssumptionsSchema = z.object({
  productivityIncrease: z.number().finite().min(0).max(1),
  absenteeismReduction: z.number().finite().min(0).max(1),
  turnoverReduction: z.number().finite().min(0).max(1),
  energyEfficiency: z.number().finite().min(0).max(1),
  workingDaysPerYear: z.number().int().min(1).max(366),
  turnoverCostSalaryMultiplier: z.number().finite().min(0).max(10),
});

export const roiAssumptionSetSchema = z.object({
  low: roiAssumptionsSchema,
  base: roiAssumptionsSchema,
  high: roiAssumptionsSchema,
});

export const roiResultsSchema = z.object({
  productivityGain: z.number().finite().min(0),
  reducedAbsenteeism: z.number().finite().min(0),
  reducedTurnover: z.number().finite().min(0),
  energySavings: z.number().finite().min(0),
  totalAnnualSavings: z.number().finite().min(0),
  roiPercentage: z.number().finite(),
  paybackPeriod: z.number().finite().min(0),
});

export const roiResultsRangeSchema = z.object({
  low: roiResultsSchema,
  base: roiResultsSchema,
  high: roiResultsSchema,
});

export const roiSnapshotCreateSchema = z.object({
  projectId: z.string().uuid(),
  scenarioId: z.string().uuid(),
  inputs: roiInputsSchema,
});

export const roiSnapshotDataSchema = z.object({
  inputs: roiInputsSchema,
  assumptionsVersion: z.string().trim().min(1).max(80),
  assumptions: roiAssumptionSetSchema,
  results: roiResultsRangeSchema,
});

export type RoiInputs = z.infer<typeof roiInputsSchema>;
export type RoiAssumptionCase = z.infer<typeof roiAssumptionCaseSchema>;
export type RoiAssumptions = z.infer<typeof roiAssumptionsSchema>;
export type RoiAssumptionSet = z.infer<typeof roiAssumptionSetSchema>;
export type RoiResults = z.infer<typeof roiResultsSchema>;
export type RoiResultsRange = z.infer<typeof roiResultsRangeSchema>;
export type RoiSnapshotCreateInput = z.infer<typeof roiSnapshotCreateSchema>;
export type RoiSnapshotData = z.infer<typeof roiSnapshotDataSchema>;
