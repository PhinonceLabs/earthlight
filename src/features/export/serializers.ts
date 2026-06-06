import { deriveDisplayIntensity, deriveDisplayTemperature } from "@/features/scenarios/displaySchedule";
import { lightingScheduleSchema, type LightingScheduleInput } from "@/domain/validation/lighting";
import { reportSnapshotDataSchema, type ReportSnapshotData } from "@/domain/validation/report";
import { getColorTemperatureName } from "@/utils/lightingStandards";
import { formatTime } from "@/utils/scheduleGenerator";

function csvCell(value: string | number | undefined): string {
  const normalized = value === undefined ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

function timestampLabel(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-").slice(0, 16);
}

function iesMetadata(value: string): string {
  const sanitized = Array.from(value)
    .map((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint < 32 || codePoint === 127 ? " " : character;
    })
    .join("")
    .trim()
    .slice(0, 120);

  return sanitized || "Untitled";
}

export function scheduleExportFilename(extension: "json" | "csv" | "ies", date = new Date()): string {
  return `lighting-schedule-${timestampLabel(date)}.${extension}`;
}

export function reportExportFilename(date = new Date()): string {
  return `earthlight-report-${timestampLabel(date)}.json`;
}

export function serializeScheduleToJson(schedule: LightingScheduleInput): string {
  const validatedSchedule = lightingScheduleSchema.parse(schedule);
  return JSON.stringify(
    {
      ...validatedSchedule,
      exportedAt: new Date().toISOString(),
      version: "2026-06-poc-v1",
      metadata: {
        tool: "Earthlight",
        exportType: "lighting_schedule",
      },
    },
    null,
    2,
  );
}

export function serializeScheduleToCsv(schedule: LightingScheduleInput): string {
  const validatedSchedule = lightingScheduleSchema.parse(schedule);
  const headers = [
    "Time",
    "Display Intensity (%)",
    "Display CCT (K)",
    "Color Name",
    "Photopic Vertical Lux",
    "Melanopic DER",
    "Melanopic EDI Lux",
    "Source",
    "Notes",
  ];
  const rows = validatedSchedule.schedule.map((point) => {
    const temperature = deriveDisplayTemperature(point);
    return [
      formatTime(point.time),
      deriveDisplayIntensity(point),
      temperature,
      getColorTemperatureName(temperature),
      point.photopicVerticalLux,
      point.melanopicDER,
      point.melanopicEDILux,
      point.source,
      point.notes,
    ];
  });

  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function serializeScheduleToIes(schedule: LightingScheduleInput): string {
  const validatedSchedule = lightingScheduleSchema.parse(schedule);
  const displayPoints = validatedSchedule.schedule.map((point) => ({
    time: point.time,
    intensity: deriveDisplayIntensity(point),
    temperature: deriveDisplayTemperature(point),
  }));

  const scheduleName = iesMetadata(validatedSchedule.name);

  return `IESNA:LM-63-2002
[TEST] ${scheduleName}
[TESTLAB] Earthlight
[TESTDATE] ${new Date().toLocaleDateString("en-US")}
[MANUFAC] Custom Schedule
[LUMCAT] ${scheduleName.replace(/\s+/g, "_")}
[LUMINAIRE] Circadian Lighting Schedule
[LAMP] LED
[_CIRCADIAN_SCHEDULE] ${displayPoints.map((point) => `${point.time},${point.intensity},${point.temperature}`).join(";")}
TILT=NONE
1 ${displayPoints.length} 1 1 1 1 1 1 1
1 1 100
0 90
0
${displayPoints.map((point) => point.intensity).join(" ")}
`;
}

export function serializeReportSnapshotToJson(reportData: ReportSnapshotData): string {
  return JSON.stringify(reportSnapshotDataSchema.parse(reportData), null, 2);
}
