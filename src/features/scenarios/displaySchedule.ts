import type { LightingExposurePointInput, LightingScheduleInput } from "@/domain/validation/lighting";
import type { LightingSchedule, TimeIntensityPair } from "@/utils/lightingStandards";

const DEFAULT_DISPLAY_INTENSITY = 50;
const DEFAULT_DISPLAY_TEMPERATURE_K = 4000;
const DAYTIME_MELANOPIC_EDI_TARGET_LUX = 250;
const WORKPLACE_PHOTOPIC_TARGET_LUX = 500;
const HIGH_MELANOPIC_DER = 1.2;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundFinite(value: number): number {
  return Math.round(Number.isFinite(value) ? value : 0);
}

export function deriveDisplayIntensity(point: LightingExposurePointInput): number {
  if (point.intensity !== undefined) {
    return clamp(roundFinite(point.intensity), 0, 100);
  }

  if (point.melanopicEDILux !== undefined) {
    return clamp(roundFinite((point.melanopicEDILux / DAYTIME_MELANOPIC_EDI_TARGET_LUX) * 100), 0, 100);
  }

  if (point.photopicVerticalLux !== undefined) {
    return clamp(roundFinite((point.photopicVerticalLux / WORKPLACE_PHOTOPIC_TARGET_LUX) * 100), 0, 100);
  }

  if (point.melanopicDER !== undefined) {
    return clamp(roundFinite((point.melanopicDER / HIGH_MELANOPIC_DER) * 100), 0, 100);
  }

  return DEFAULT_DISPLAY_INTENSITY;
}

export function deriveDisplayTemperature(point: LightingExposurePointInput): number {
  return clamp(roundFinite(point.temperature ?? point.cctK ?? DEFAULT_DISPLAY_TEMPERATURE_K), 1000, 10000);
}

export function toLegacyDisplayPoint(point: LightingExposurePointInput): TimeIntensityPair {
  return {
    time: point.time,
    intensity: deriveDisplayIntensity(point),
    temperature: deriveDisplayTemperature(point),
  };
}

export function toLegacyDisplaySchedule(schedule: LightingScheduleInput): LightingSchedule {
  return {
    name: schedule.name,
    description: schedule.description,
    citations: schedule.citations,
    // This is intentionally a display-only projection. Persisted JSONB keeps the richer
    // exposure metrics and is not rewritten when legacy visual components need fallbacks.
    schedule: schedule.schedule.map(toLegacyDisplayPoint),
  };
}

export function formatOptionalNumber(value: number | undefined, suffix = ""): string {
  return value === undefined ? "—" : `${roundFinite(value)}${suffix}`;
}

export function formatOptionalDecimal(value: number | undefined): string {
  return value === undefined ? "—" : value.toFixed(2);
}

export function hasDerivedLegacyDisplay(point: LightingExposurePointInput): boolean {
  return point.intensity === undefined || point.temperature === undefined;
}
