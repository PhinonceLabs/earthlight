export const projectTypeValues = [
  "office",
  "healthcare",
  "education",
  "residential",
  "retail",
  "hospitality",
  "custom",
] as const;

export const scenarioSourceValues = [
  "standard_preset",
  "custom",
  "imported",
  "quick_save",
] as const;

export const exposurePointSourceValues = ["estimated", "measured", "imported"] as const;

export type ProjectTypeValue = (typeof projectTypeValues)[number];
export type ScenarioSourceValue = (typeof scenarioSourceValues)[number];
export type ExposurePointSourceValue = (typeof exposurePointSourceValues)[number];
