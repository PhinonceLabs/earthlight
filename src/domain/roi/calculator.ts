import { ROI_ASSUMPTIONS, ROI_ASSUMPTION_CASES } from "./assumptions";
import type {
  RoiAssumptionCase,
  RoiAssumptions,
  RoiInputs,
  RoiResults,
  RoiResultsRange,
} from "@/domain/validation/roi";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundRatio(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateRoiForAssumptions(
  inputs: RoiInputs,
  assumptions: RoiAssumptions,
): RoiResults {
  const totalLaborCost = inputs.employees * inputs.averageSalary;
  const productivityGain = totalLaborCost * assumptions.productivityIncrease;

  const absenteeismCostPerDay = inputs.averageSalary / assumptions.workingDaysPerYear;
  const currentAbsenteeismCost =
    inputs.employees * inputs.currentAbsenteeism * absenteeismCostPerDay;
  const reducedAbsenteeism = currentAbsenteeismCost * assumptions.absenteeismReduction;

  const turnoverCostPerEmployee = inputs.averageSalary * assumptions.turnoverCostSalaryMultiplier;
  const currentTurnoverCost =
    inputs.employees * (inputs.currentTurnover / 100) * turnoverCostPerEmployee;
  const reducedTurnover = currentTurnoverCost * assumptions.turnoverReduction;

  const energySavings = inputs.annualLightingEnergyCost * assumptions.energyEfficiency;

  const totalAnnualSavings =
    productivityGain + reducedAbsenteeism + reducedTurnover + energySavings;
  const roiPercentage =
    inputs.implementationCost > 0
      ? ((totalAnnualSavings - inputs.implementationCost) / inputs.implementationCost) * 100
      : 0;
  const paybackPeriod = totalAnnualSavings > 0 ? inputs.implementationCost / totalAnnualSavings : 0;

  return {
    productivityGain: roundMoney(productivityGain),
    reducedAbsenteeism: roundMoney(reducedAbsenteeism),
    reducedTurnover: roundMoney(reducedTurnover),
    energySavings: roundMoney(energySavings),
    totalAnnualSavings: roundMoney(totalAnnualSavings),
    roiPercentage: roundRatio(roiPercentage),
    paybackPeriod: roundRatio(paybackPeriod),
  };
}

export function calculateRoiRange(inputs: RoiInputs): RoiResultsRange {
  return ROI_ASSUMPTION_CASES.reduce((results, assumptionCase) => {
    results[assumptionCase] = calculateRoiForAssumptions(
      inputs,
      ROI_ASSUMPTIONS[assumptionCase],
    );
    return results;
  }, {} as RoiResultsRange);
}

export function getRoiResultCase(
  results: RoiResultsRange,
  assumptionCase: RoiAssumptionCase = "base",
): RoiResults {
  return results[assumptionCase];
}
