import { getColorTemperatureName } from "@/utils/lightingStandards";
import { formatTime } from "@/utils/scheduleGenerator";
import { deriveDisplayIntensity, deriveDisplayTemperature } from "@/features/scenarios/displaySchedule";
import type { ProjectDetailDTO } from "@/features/projects/queries";
import type { ScenarioDetailDTO } from "@/features/scenarios/queries";
import type { RoiSnapshotDTO } from "@/features/roi/queries";
import { reportSnapshotDataSchema, type ReportSnapshotData } from "@/server/validation/report";
import type { ProjectType } from "@/server/db/schema";

export const REPORT_VERSION = "2026-06-poc-v1";

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  office: "Office",
  healthcare: "Healthcare",
  education: "Education",
  residential: "Residential",
  retail: "Retail",
  hospitality: "Hospitality",
  custom: "Custom",
};

const DEFAULT_IMPLEMENTATION_RECOMMENDATIONS = [
  "Pilot the scenario in one representative area before full deployment.",
  "Validate occupant comfort and visual task performance before locking schedules.",
  "Review measured photopic and melanopic exposure after installation and tune controls seasonally.",
];

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nestedValue);
    }
  }

  return value;
}

export function createReportSnapshotData(input: {
  project: ProjectDetailDTO;
  scenario: ScenarioDetailDTO;
  roiSnapshot?: RoiSnapshotDTO | null;
  generatedAt?: Date;
}): ReportSnapshotData {
  const generatedAt = input.generatedAt ?? new Date();
  const scheduleRows = input.scenario.schedule.schedule.map((point) => {
    const temperature = deriveDisplayTemperature(point);

    return {
      timeDecimal: point.time,
      timeLabel: formatTime(point.time),
      intensity: deriveDisplayIntensity(point),
      temperature,
      colorName: getColorTemperatureName(temperature),
    };
  });

  const normalized = reportSnapshotDataSchema.parse({
    reportVersion: REPORT_VERSION,
    generatedAt: generatedAt.toISOString(),
    project: {
      id: input.project.id,
      name: input.project.name,
      description: input.project.description,
      client: input.project.client,
      location: input.project.location,
      projectType: input.project.projectType,
      projectTypeLabel: PROJECT_TYPE_LABELS[input.project.projectType],
      tags: input.project.tags,
    },
    scenario: {
      id: input.scenario.id,
      name: input.scenario.name,
      description: input.scenario.description,
      source: input.scenario.source,
      presetName: input.scenario.presetName ?? undefined,
    },
    schedule: input.scenario.schedule,
    scheduleRows,
    roi: input.roiSnapshot
      ? {
          id: input.roiSnapshot.id,
          createdAt: input.roiSnapshot.createdAt,
          inputs: input.roiSnapshot.inputs,
          assumptionsVersion: input.roiSnapshot.assumptionsVersion,
          assumptions: input.roiSnapshot.assumptions,
          results: input.roiSnapshot.results,
        }
      : undefined,
    citations: input.scenario.schedule.citations,
    implementationRecommendations: DEFAULT_IMPLEMENTATION_RECOMMENDATIONS,
  });

  // Immutable report snapshots are built from validated copies. The frozen object prevents
  // accidental mutation before persistence; no update action is exposed for saved reports.
  return deepFreeze(normalized);
}
