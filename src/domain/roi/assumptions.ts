import type { RoiAssumptionCase, RoiAssumptionSet } from "@/domain/validation/roi";

export const ROI_ASSUMPTIONS_VERSION = "2026-06-poc-v2";

export const ROI_ASSUMPTION_CASES = ["low", "base", "high"] as const satisfies readonly RoiAssumptionCase[];

export const ROI_ASSUMPTIONS: RoiAssumptionSet = {
  low: {
    productivityIncrease: 0.04,
    absenteeismReduction: 0.1,
    turnoverReduction: 0.1,
    energyEfficiency: 0.15,
    workingDaysPerYear: 250,
    turnoverCostSalaryMultiplier: 0.5,
  },
  base: {
    productivityIncrease: 0.08,
    absenteeismReduction: 0.25,
    turnoverReduction: 0.2,
    energyEfficiency: 0.3,
    workingDaysPerYear: 250,
    turnoverCostSalaryMultiplier: 0.75,
  },
  high: {
    productivityIncrease: 0.12,
    absenteeismReduction: 0.35,
    turnoverReduction: 0.3,
    energyEfficiency: 0.4,
    workingDaysPerYear: 250,
    turnoverCostSalaryMultiplier: 1,
  },
};
